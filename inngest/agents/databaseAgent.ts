import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import convex from "@/lib/convexClient";
import { client } from "@/lib/schematic";
import { createAgent, createTool, openai } from "@inngest/agent-kit";
import { z } from "zod";
import { StructuredReceiptData } from "@/types/structuredReceipt";

const structuredReceiptDataZ = z.object({
    entreprise: z.string(),
    description: z.string(),
    telephone: z.string(),
    email: z.string(),
    numero_pesee: z.string(),
    date_entree: z.string(),
    heure_entree: z.string(),
    date_sortie: z.string(),
    heure_sortie: z.string(),
    matricule: z.string(),
    client: z.string(),
    transporteur: z.string(),
    destination: z.string(),
    bon_livraison: z.string(),
    produit: z.string(),
    poids_entree_kg: z.number().nullable().optional(),
    poids_sortie_kg: z.number().nullable().optional(),
    poids_net_kg: z.number().nullable().optional(),
    installateur: z.object({
        nom: z.string(),
        telephone: z.string(),
        email: z.string(),
    }),
});

const saveToDatabaseTool = createTool({
    name: "save_to_database",
    description: "Saves the given data to the convex database.",

    parameters: z.object({
        fileDisplayName: z.string().describe(
            "The readable display name of the receipt to show in the UI. If the file name is not human readable, use this to give a more readable name."
        ),
        receiptId: z.string().describe("The ID of the receipt to update"),
        parsedData: structuredReceiptDataZ.describe(
            "The structured JSON payload that must exactly match the requested schema."
        ),
    }),
    handler: async (params, context) => {
        const {
            fileDisplayName,
            receiptId,
            parsedData,
        } = params;

        const normalizedParsedData: StructuredReceiptData = {
            ...parsedData,
            poids_entree_kg:
                parsedData.poids_entree_kg ?? undefined,
            poids_sortie_kg:
                parsedData.poids_sortie_kg ?? undefined,
            poids_net_kg:
                parsedData.poids_net_kg ?? undefined,
        };

        const result = await context.step?.run(
            "save-receipt-to-database",
            async () => {

                try {

                    //Call the convex mutation to update the receipt with extracted data
                    const { userId } = await convex.mutation(
                        api.receipts.updateReceiptWithExtractedData,
                        {
                            id: receiptId as Id<"receipts">,
                            fileDisplayName,
                            receiptSummary: normalizedParsedData.description,
                            parsedData: normalizedParsedData,
                        }
                    );
                    //Track event in schematic
                    await client.track({
                        event: "scan",
                        company: {
                            id: userId,
                        },
                        user: {
                            id: userId,
                        },

                    });
                    return {
                        addedToDB: "Success",
                        receiptId,
                        fileDisplayName,
                        parsedData: normalizedParsedData,

                    };
                } catch (error) {
                    return {
                        addedToDB: "Failed",
                        error: error instanceof Error ? error.message : "Unknown error",
                    };
                }
            },
        );

        if (result?.addedToDB === "Success") {
            //Only set state values if the operation was succesful
            if (context.network) {
                context.network.state.data["saved-to-database"] = true;
                context.network.state.data["receipt"] = receiptId;
            }

        }
        return result;
    },
});



export const databaseAgent = createAgent({
    name: "database_agent",
    description:
        "responsible for taking key information regarding receipts and saving it to the convex database.",
    system:
        "You are a helpful assistant that takes key information regarding receipts and saves it to the convex database.",
    model: openai({
        model: "gpt-4o-mini",
        defaultParameters: {
            max_completion_tokens: 1000,
        },
    }),
    tools: [saveToDatabaseTool],
});

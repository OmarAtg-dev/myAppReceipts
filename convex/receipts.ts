import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
const weightField = v.union(v.number(), v.null());
const structuredReceiptDataSchema = v.object({
    entreprise: v.string(),
    description: v.string(),
    telephone: v.string(),
    email: v.string(),
    numero_pesee: v.string(),
    date_entree: v.string(),
    heure_entree: v.string(),
    date_sortie: v.string(),
    heure_sortie: v.string(),
    matricule: v.string(),
    client: v.string(),
    transporteur: v.string(),
    destination: v.string(),
    bon_livraison: v.string(),
    produit: v.string(),
    poids_entree_kg: weightField,
    poids_sortie_kg: weightField,
    poids_net_kg: weightField,
    installateur: v.object({
        nom: v.string(),
        telephone: v.string(),
        email: v.string(),
    }),
});

//Function to generate a Comvex upload URL for the client
export const generateUploadURL = mutation({
    args: {},
    handler: async (ctx) => {
        //Generate a URL that the client can use to upload a file
        return await ctx.storage.generateUploadUrl();
    },
});


// Store a receipt file and add it to the database 
export const storeReceipt = mutation({
    args: {

        userId: v.string(),
        fileId: v.id("_storage"),
        fileName: v.string(),
        size: v.number(),
        mimeType: v.string(),
    },
    handler: async (ctx, args) => {
        // Save the receipt to the database
        const receiptId = await ctx.db.insert("receipts", {
            userId: args.userId,
            fileName: args.fileName,
            fileId: args.fileId,
            uploadedAt: Date.now(),
            size: args.size,
            mimeType: args.mimeType,
            status: "pending",
            receiptSummary: undefined,
            parsedData: undefined,
        });
        return receiptId;
    },
});
// Function to get all receipts 
export const getReceipts = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        //Only return receipts for the authenticated user 
        return await ctx.db
            .query("receipts")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .order("desc")
            .collect();

    },
});


// Function to get a single receipt by ID 
export const getReceiptById = query({
    args: {
        id: v.id("receipts"),
    },

    handler: async (ctx, args) => {
        // Get the receipt

        const receipt = await ctx.db.get(args.id);
        // Verify user has access to this receipt
        if (receipt) {

            const identity = await ctx.auth.getUserIdentity();
            if (!identity) {
                throw new Error("Not authenticated");
            }

            const userId = identity.subject;
            if (receipt.userId !== userId) {
                throw new Error("Not authorized to access this receipt");
            }
        }
        return receipt;
    },
});

//Generate a URL to download a receipt file
export const getReceiptDownloadUrl = query({
    args: {
        fileId: v.id("_storage"),

    },
    handler: async (ctx, args) => {
        //Get a temporary URL that can be used to download the file 
        return await ctx.storage.getUrl(args.fileId);
    }
});

// Update the status of a receipt
export const updateReceiptStatus = mutation({
    args: {
        id: v.id("receipts"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        // Verify user has access to this receipt
        const receipt = await ctx.db.get(args.id);
        if (!receipt) {
            throw new Error("Receipt not found");
        }

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;
        if (receipt.userId !== userId) {
            throw new Error("Not authorized to update this receipt");
        }

        await ctx.db.patch(args.id, {
            status: args.status,
        });
        return true;
    },
});



// Delete a receipt and its file
export const deleteReceipt = mutation({
    args: {
        id: v.id("receipts"),

    },
    handler: async (ctx, args) => {
        const receipt = await ctx.db.get(args.id);
        if (!receipt) {
            throw new Error("Receipt not found");

        }
        // Verify user has access to this receipt
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");

        }
        const userId = identity.subject;
        if (receipt.userId !== userId) {
            throw new Error("Not authorized to delete this receipt");

        }
        // Delete the file from storage
        await ctx.storage.delete(receipt.fileId);
        // Delete the receipt record 
        await ctx.db.delete(args.id);
        return true;
    },
});



// Update a receipt with extracted data
export const updateReceiptWithExtractedData = mutation({
    args: {
        id: v.id("receipts"),
        receiptSummary: v.string(),
        fileDisplayName: v.string(),
        parsedData: structuredReceiptDataSchema,
    },


    handler: async (ctx, args) => {
        // Verify the receipt exists
        const receipt = await ctx.db.get(args.id);
        if (!receipt) {
            throw new Error("Receipt not found");

        }
        // Update the receipt with the extracted data 
        await ctx.db.patch(args.id, {
            fileDisplayName: args.fileDisplayName,
            parsedData: args.parsedData,
            receiptSummary: args.receiptSummary,
            status: "processed", // Mark as processed now that we have extracted data
        });
        return {
            userId: receipt.userId,

        };
    },
});
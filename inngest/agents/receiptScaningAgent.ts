import { createAgent, createTool, openai, anthropic } from "@inngest/agent-kit";
import { PDFDocument } from "pdf-lib";
import { Buffer } from "node:buffer";
import { z } from "zod";

type DocumentSource = {
    type: "base64";
    media_type: "application/pdf";
    data: string;
};

const analyzeReceiptTool = createTool({
    name: "analyze-receipt-file",
    description: "Analyzes the given receipt file (PDF or image)",
    parameters: z.object({
        fileUrl: z.string(),
    }),
    handler: async ({ fileUrl }, { step }) => {
        try {
            const documentSource = await buildDocumentSource(fileUrl);

            return await step?.ai.infer("parse-pdf", {
                model: anthropic({
                    // model: "claude-3-5-sonnet-latest",
                    model: "claude-3-5-haiku-latest",
                    defaultParameters: {
                        max_tokens: 3094,
                    },
                }) as any,
                body: {
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "document",
                                    source: documentSource,
                                },
                                {
                                    type: "text",
                                    text: `You must return ONLY the following JSON object (no prose, no markdown). Use empty strings when data is missing. For numeric weights, output a number when known otherwise use null. Do not include any additional keys.
{
  "entreprise": "",
  "description": "",
  "telephone": "",
  "email": "",
  "numero_pesee": "",
  "date_entree": "",
  "heure_entree": "",
  "date_sortie": "",
  "heure_sortie": "",
  "matricule": "",
  "client": "",
  "transporteur": "",
  "destination": "",
  "bon_livraison": "",
  "produit": "",
  "poids_entree_kg": null,
  "poids_sortie_kg": null,
  "poids_net_kg": null,
  "installateur": {
    "nom": "",
    "telephone": "",
    "email": ""
  }
}
`,
                                },
                            ],
                        },
                    ],
                },
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
});

async function buildDocumentSource(fileUrl: string): Promise<DocumentSource> {
    const { bytes, detectedType } = await downloadFileBytes(fileUrl);
    if (isPdfBuffer(bytes) || looksPdfLike(detectedType, fileUrl)) {
        return toPdfDocument(bytes);
    }

    const pdfBytes = await convertImageBytesToPdf(bytes, detectedType);
    return toPdfDocument(pdfBytes);
}

async function downloadFileBytes(fileUrl: string) {
    const response = await fetch(fileUrl);
    if (!response.ok) {
        throw new Error(
            `Failed to fetch file for analysis: ${response.status} ${response.statusText}`,
        );
    }

    const arrayBuffer = await response.arrayBuffer();
    const detectedType = response.headers.get("content-type") ?? undefined;
    return { bytes: new Uint8Array(arrayBuffer), detectedType };
}

function isPdfBuffer(bytes: Uint8Array) {
    if (bytes.length < 4) return false;
    const header = Buffer.from(bytes.subarray(0, 4)).toString();
    return header === "%PDF";
}

function looksPdfLike(detectedType?: string, fileUrl?: string) {
    const lowered = detectedType?.toLowerCase();
    return (
        (lowered && lowered.includes("pdf")) ||
        (fileUrl && fileUrl.toLowerCase().includes(".pdf"))
    );
}

function toPdfDocument(bytes: Uint8Array): DocumentSource {
    return {
        type: "base64",
        media_type: "application/pdf",
        data: Buffer.from(bytes).toString("base64"),
    };
}

async function convertImageBytesToPdf(bytes: Uint8Array, mimeType?: string) {
    const pdfDoc = await PDFDocument.create();
    const usePngPipeline = isPng(bytes, mimeType);
    const image = usePngPipeline
        ? await pdfDoc.embedPng(bytes)
        : await pdfDoc.embedJpg(bytes);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
    });
    return pdfDoc.save();
}

function isPng(bytes: Uint8Array, mimeType?: string) {
    if (mimeType?.toLowerCase().includes("png")) {
        return true;
    }
    if (bytes.length < 8) return false;
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return pngSignature.every((value, index) => bytes[index] === value);
}
export const receiptScanningAgent = createAgent({
    name: "receipt_scanning_agent",
    description: "Processes receipt PDFs/images, extracts weigh ticket fields, and collaborates with the database agent to persist them.",
    system: `You are an AI-powered weigh-ticket extraction assistant.
- Always call the "analyze-receipt-file" tool first to obtain structured JSON in the required format.
- Do not invent fields; use empty strings when values are missing.
- After you have the JSON payload, call the database agent's save_to_database tool with the receiptId, a readable fileDisplayName, and the JSON (parsedData).
- Never return prose—only reason internally and use tools to share results.`,
    model: openai({
        model: "gpt-4o-mini",
        // apiKey: process.env.OPENAI_API_KEY,
        // baseUrl: "https://api.openai.com/v1/",
        defaultParameters: {
            max_completion_tokens: 3094,
        },
    }),
    tools: [analyzeReceiptTool],
});
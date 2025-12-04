import { createAgent, createTool, openai, anthropic } from "@inngest/agent-kit";
import { PDFDocument } from "pdf-lib";
import { Buffer } from "node:buffer";
import { z } from "zod";

type DocumentSource =
    | { type: "url"; url: string }
    | { type: "base64"; media_type: "application/pdf"; data: string };


const analyzeReceiptTool = createTool({
    name: "analyze-receipt-file",
    description: "Analyzes the given receipt file (PDF or image)",
    parameters: z.object({
        fileUrl: z.string(),
        mimeType: z.string().optional(),
    }),
   handler: async ({ fileUrl, mimeType }, { step }) => {

        try {

        
            const documentSource = await buildDocumentSource(fileUrl, mimeType);

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
                                    text: `Extract the data from the receipt and return the structured output as follows:
                                {
                                    "merchant": {
                                        "name": "Store Name",
                                        "address": "123 Main St, City, Country",
                                        "contact": "+123456789"
                                    },
                                    "transaction": {
                                        "date": "YYYY-MM-DD",
                                        "receipt_number": "ABC123456",
                                        "payment_method": "Credit Card"
                                    },
                                    "items": [
                                        {
                                        "name": "Item 1",
                                        "quantity": 2,
                                        "unit_price": 10.0,
                                        "total_price": 20.0
                                        }
                                    ],
                                    "totals": {
                                        "subtotal": 20.0,
                                        "tax": 2.0,
                                        "total": 22.0,
                                        "currency": "USD"
                                    },
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
async function buildDocumentSource(
    fileUrl: string,
    mimeType?: string,
): Promise<DocumentSource> {
    if (isPdfLike(mimeType, fileUrl)) {
        return { type: "url", url: fileUrl };
    }

    const { bytes, detectedType } = await downloadFileBytes(fileUrl);
    if (isPdfBuffer(bytes)) {
        return {
            type: "base64",
            media_type: "application/pdf",
            data: Buffer.from(bytes).toString("base64"),
        };
    }

    const pdfBytes = await convertImageBytesToPdf(bytes, mimeType ?? detectedType);
    return {
        type: "base64",
        media_type: "application/pdf",
        data: Buffer.from(pdfBytes).toString("base64"),
    };
}

function isPdfLike(mimeType?: string, fileUrl?: string) {
    const lowered = mimeType?.toLowerCase();
    return (
        (lowered && lowered.includes("pdf")) ||
        (fileUrl && fileUrl.toLowerCase().endsWith(".pdf"))
    );
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
    description: "Processes receipt images and PDFs to extract key information such as vendor names, dates, amounts, and line items",
    system: `You are an AI-powered receipt scanning assistant. Your primary role is to accurately extract and structure relevant information from scanned receipts. Your task includes recognizing and parsing details such as:
        - Merchant Information: Store name, address, contact details
        - Transaction Details: Date, time, receipt number, payment method
        - Itemized Purchases: Product names, quantities, individual prices, discounts
        - Total Amounts: Subtotal, taxes, total paid, and any applied discounts
        - Ensure high accuracy by detecting OCR errors and correcting misread text when possible.
        - Normalize dates, currency values, and formatting for consistency.
        - If any key details are missing or unclear, return a structured response indicating incomplete data.
        - Handle multiple formats, languages, and varying receipt layouts efficiently.
        - Maintain a structured JSON output for easy integration with databases or expense tracking systems.
        `,
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
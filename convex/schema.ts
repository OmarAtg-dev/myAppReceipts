import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { structuredReceiptDataSchema } from "./receiptData";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  receipts: defineTable({
    userId: v.string(), // Clerk user ID
    fileName: v.string(),
    fileDisplayName: v.optional(v.string()),
    fileId: v.id("_storage"),
    uploadedAt: v.number(),
    size: v.number(),
    mimeType: v.string(),
    status: v.string(), // 'pending', 'processed', 'error'

    receiptSummary: v.optional(v.string()),
    parsedData: v.optional(structuredReceiptDataSchema),
    items: v.optional(
      v.array(
        v.object({
          name: v.string(),
          quantity: v.number(),
          unitPrice: v.number(),
          totalPrice: v.number(),
        }),
      ),
    ),
  }),
});

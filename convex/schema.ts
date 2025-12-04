import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

    // Fields for extracted data gathered by agents/OCR
    merchantName: v.optional(v.string()),
    merchantAddress: v.optional(v.string()),
    merchantContact: v.optional(v.string()),
    transactionDate: v.optional(v.string()),
    transactionAmount: v.optional(v.string()),
    currency: v.optional(v.string()),
    receiptSummary: v.optional(v.string()),
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
    parsedData: v.optional(
      v.object({
        bon_livraison: v.optional(v.string()),
        client: v.optional(v.string()),
        date_entree: v.optional(v.string()),
        date_sortie: v.optional(v.string()),
        description: v.optional(v.string()),
        destination: v.optional(v.string()),
        email: v.optional(v.string()),
        entreprise: v.optional(v.string()),
        heure_entree: v.optional(v.string()),
        heure_sortie: v.optional(v.string()),
        installateur: v.optional(
          v.object({
            email: v.optional(v.string()),
            nom: v.optional(v.string()),
            telephone: v.optional(v.string()),
          }),
        ),
        matricule: v.optional(v.string()),
        numero_pesee: v.optional(v.string()),
        poids_entree_kg: v.optional(v.union(v.number(), v.null())),
        poids_net_kg: v.optional(v.union(v.number(), v.null())),
        poids_sortie_kg: v.optional(v.union(v.number(), v.null())),
        produit: v.optional(v.string()),
        telephone: v.optional(v.string()),
        transporteur: v.optional(v.string()),
      }),
    ),
  }),
});

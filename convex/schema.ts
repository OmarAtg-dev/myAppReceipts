import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
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

import { v } from "convex/values";
import { StructuredReceiptData } from "../types/structuredReceipt";

export const structuredReceiptDataSchema = v.object({
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
  poids_entree_kg: v.optional(v.number()),
  poids_sortie_kg: v.optional(v.number()),
  poids_net_kg: v.optional(v.number()),
  installateur: v.object({
    nom: v.string(),
    telephone: v.string(),
    email: v.string(),
  }),
});

export type { StructuredReceiptData };

import { v } from "convex/values";
import { StructuredReceiptData } from "../types/structuredReceipt";

const numberOrNull = v.union(v.number(), v.null());

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
  poids_entree_kg: numberOrNull,
  poids_sortie_kg: numberOrNull,
  poids_net_kg: numberOrNull,
  installateur: v.object({
    nom: v.string(),
    telephone: v.string(),
    email: v.string(),
  }),
});

export type { StructuredReceiptData };

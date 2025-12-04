export interface StructuredReceiptData {
  entreprise: string;
  description: string;
  telephone: string;
  email: string;
  numero_pesee: string;
  date_entree: string;
  heure_entree: string;
  date_sortie: string;
  heure_sortie: string;
  matricule: string;
  client: string;
  transporteur: string;
  destination: string;
  bon_livraison: string;
  produit: string;
  poids_entree_kg: number | null;
  poids_sortie_kg: number | null;
  poids_net_kg: number | null;
  installateur: {
    nom: string;
    telephone: string;
    email: string;
  };
}

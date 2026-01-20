/**
 * Client Mistral AI
 * Ce fichier configure et exporte le client Mistral pour une utilisation côté serveur uniquement
 */

import { Mistral } from '@mistralai/mistralai';

// Vérification de la présence de la clé API
if (!process.env.MISTRAL_API_KEY) {
  throw new Error(
    'La variable d\'environnement MISTRAL_API_KEY est manquante. ' +
    'Veuillez créer un fichier .env.local avec votre clé API Mistral.'
  );
}

// Initialisation du client Mistral
export const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

// Export du type pour utilisation dans d'autres fichiers
export type MistralClient = typeof mistralClient;

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

/**
 * Retourne le client Mistral initialisé
 */
export function getMistralClient(): Mistral {
  return mistralClient;
}

/**
 * Génère un prompt visuel pour la création d'image à partir d'ingrédients
 */
export async function generateVisualPrompt(params: {
  ingredients: string[];
  style?: string;
  presentation?: string;
}): Promise<{ prompt: string; model: string; tokensUsed: number }> {
  const { ingredients, style, presentation } = params;

  const systemPrompt = `Tu es un expert en photographie culinaire. Génère un prompt détaillé en anglais pour créer une image photoréaliste d'un plat délicieux.
Le prompt doit décrire:
- Le plat principal avec les ingrédients visibles
- La présentation et le dressage
- L'éclairage et l'ambiance
- Les détails qui rendent le plat appétissant

Réponds UNIQUEMENT avec le prompt, sans explication.`;

  const userPrompt = `Crée un prompt pour une image de plat avec ces ingrédients: ${ingredients.join(', ')}${style ? `. Style: ${style}` : ''}${presentation ? `. Présentation: ${presentation}` : ''}`;

  const response = await mistralClient.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    maxTokens: 500,
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    throw new Error('Réponse invalide de Mistral');
  }

  return {
    prompt: content.trim(),
    model: 'mistral-small-latest',
    tokensUsed: response.usage?.totalTokens || 0,
  };
}

// Export du type pour utilisation dans d'autres fichiers
export type MistralClient = typeof mistralClient;

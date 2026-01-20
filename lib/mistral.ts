/**
 * Client Mistral AI
 * Ce fichier configure et exporte le client Mistral pour une utilisation côté serveur uniquement
 */

import { Mistral } from '@mistralai/mistralai';
import type { CulinaryStyle, PresentationStyle, FilterSelection } from '@/types';

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

// --------------------------------------------
// Mappings pour enrichir les prompts avec les filtres
// --------------------------------------------

const CUISINE_STYLE_PROMPTS: Record<string, string> = {
  'français': 'French haute cuisine style, elegant plating, classic sauces, refined presentation',
  'italien': 'Italian rustic style, fresh pasta, olive oil drizzle, Mediterranean colors, herbs like basil',
  'japonais': 'Japanese minimalist presentation, clean lines, precise cuts, zen aesthetics, subtle garnishes',
  'chinois': 'Chinese style, vibrant wok-tossed appearance, glossy sauces, colorful vegetables',
  'indien': 'Indian cuisine style, rich spices, vibrant curry colors, traditional brass serving',
  'mexicain': 'Mexican style, colorful fresh ingredients, lime wedges, cilantro, rustic presentation',
  'américain': 'American comfort food style, generous portions, melted cheese, hearty presentation',
  'méditerranéen': 'Mediterranean style, fresh vegetables, olive oil, herbs, sun-kissed colors',
};

const DISH_TYPE_PROMPTS: Record<string, string> = {
  'entrée': 'appetizer portion, elegant small plate, refined presentation, whetting the appetite',
  'plat principal': 'main course, generous portion, centerpiece of the meal, satisfying presentation',
  'dessert': 'dessert presentation, sweet and indulgent, artistic plating, delicate garnishes',
  'apéritif': 'appetizer bites, finger food style, cocktail party presentation, bite-sized elegance',
  'petit-déjeuner': 'breakfast presentation, morning freshness, warm and inviting, cozy atmosphere',
};

const COOKING_STYLE_PROMPTS: Record<string, string> = {
  'chaud': 'steaming hot, visible steam rising, freshly cooked, warm comfort',
  'froid': 'chilled presentation, refreshing appearance, crisp and cool, summer vibes',
  'ambiant': 'room temperature, natural presentation, casual elegance',
};

const DIETARY_PROMPTS: Record<string, string> = {
  'végétarien': 'vegetarian dish, plant-based proteins, colorful vegetables, no meat visible',
  'vegan': 'vegan presentation, entirely plant-based, fresh produce, no animal products',
  'sans gluten': 'gluten-free ingredients, alternative grains, naturally gluten-free presentation',
  'sans lactose': 'dairy-free, plant-based alternatives, no cheese or cream visible',
  'halal': 'halal certified appearance, traditional presentation, respectful of dietary laws',
  'casher': 'kosher style, traditional Jewish cuisine influences, respectful presentation',
};

/**
 * Génère un prompt visuel pour la création d'image à partir d'ingrédients
 */
export async function generateVisualPrompt(params: {
  ingredients: string[];
  style?: CulinaryStyle;
  presentation?: PresentationStyle;
  filters?: FilterSelection;
}): Promise<{ prompt: string; model: string; tokensUsed: number }> {
  const { ingredients, style, presentation, filters = {} } = params;

  // Construire les enrichissements basés sur les filtres
  const promptEnhancements: string[] = [];

  // Style de cuisine (français, italien, etc.)
  if (filters.style && CUISINE_STYLE_PROMPTS[filters.style]) {
    promptEnhancements.push(CUISINE_STYLE_PROMPTS[filters.style]);
  }

  // Type de plat (entrée, plat principal, dessert, etc.)
  if (filters.type && DISH_TYPE_PROMPTS[filters.type]) {
    promptEnhancements.push(DISH_TYPE_PROMPTS[filters.type]);
  }

  // Mode de cuisson (chaud, froid, ambiant)
  if (filters.cuisson && COOKING_STYLE_PROMPTS[filters.cuisson]) {
    promptEnhancements.push(COOKING_STYLE_PROMPTS[filters.cuisson]);
  }

  // Régime alimentaire
  if (filters.regime && DIETARY_PROMPTS[filters.regime]) {
    promptEnhancements.push(DIETARY_PROMPTS[filters.regime]);
  }

  const filterEnhancementsText = promptEnhancements.length > 0
    ? `\n\nStyle et présentation requis:\n- ${promptEnhancements.join('\n- ')}`
    : '';

  // Construire les contraintes textuelles pour le contexte
  const filterConstraints: string[] = [];
  if (filters.type) filterConstraints.push(`Type: ${filters.type}`);
  if (filters.cuisson) filterConstraints.push(`Température: ${filters.cuisson}`);
  if (filters.style) filterConstraints.push(`Cuisine: ${filters.style}`);
  if (filters.regime) filterConstraints.push(`Régime: ${filters.regime}`);

  const constraintsText = filterConstraints.length > 0
    ? `\nContraintes: ${filterConstraints.join(', ')}`
    : '';

  const systemPrompt = `Tu es un expert mondial en photographie culinaire et en gastronomie. Ta mission est de créer des prompts détaillés en anglais pour générer des images photoréalistes de plats exceptionnels.

RÈGLES STRICTES:
1. Le prompt doit être en ANGLAIS uniquement
2. Décris le plat de manière très détaillée et appétissante
3. Inclus TOUS les ingrédients fournis de manière visible et identifiable
4. Respecte STRICTEMENT les contraintes de style, type de plat, et régime alimentaire
5. Décris l'éclairage professionnel (studio food photography lighting)
6. Mentionne la vaisselle et les éléments de présentation appropriés au style

FORMAT DU PROMPT:
- Description du plat et des ingrédients
- Style de présentation et dressage
- Ambiance et éclairage
- Détails qui rendent le plat irrésistible

Réponds UNIQUEMENT avec le prompt final, sans explication ni commentaire.`;

  const userPrompt = `Crée un prompt pour une image photoréaliste d'un plat gastronomique.

Ingrédients principaux: ${ingredients.join(', ')}
${style ? `Style visuel: ${style}` : ''}
${presentation ? `Présentation: ${presentation}` : ''}${constraintsText}${filterEnhancementsText}

Le prompt doit mettre en valeur ces ingrédients dans un plat cohérent et appétissant qui respecte toutes les contraintes mentionnées.`;

  const response = await mistralClient.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    maxTokens: 600,
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

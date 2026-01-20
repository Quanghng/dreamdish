// ============================================
// Templates de prompts pour DreamDish
// ============================================

import type { CulinaryStyle, PresentationStyle } from '@/types';

// --------------------------------------------
// Prompt système principal pour la génération
// --------------------------------------------
export const SYSTEM_PROMPT_VISUAL = `Tu es un expert en gastronomie et en photographie culinaire de renommée mondiale.
Ton rôle est de créer des descriptions visuelles ultra-détaillées pour des plats gastronomiques.

RÈGLES IMPORTANTES:
1. Écris UNIQUEMENT en anglais (pour compatibilité avec les générateurs d'images comme DALL-E/Stable Diffusion)
2. Décris précisément chaque élément visuel du plat
3. Inclus les textures, couleurs, reflets, et éclairage
4. Mentionne la vaisselle et le décor de table
5. Optimise la description pour les générateurs d'images AI
6. Longueur: entre 150 et 300 mots
7. NE PAS inclure d'introduction ni de conclusion - uniquement la description

STRUCTURE RECOMMANDÉE:
- Vue d'ensemble du plat et composition
- Ingrédient principal et sa préparation visuelle
- Accompagnements et garnitures
- Sauces, finitions et détails
- Éclairage, ambiance et atmosphère
- Détails de la vaisselle et présentation`;

// --------------------------------------------
// Descriptions des styles culinaires
// --------------------------------------------
export const styleDescriptions: Record<CulinaryStyle, string> = {
  modern: 'Présentation minimaliste contemporaine avec des techniques modernes de haute cuisine',
  classic: 'Présentation classique française avec élégance traditionnelle et raffinement',
  fusion: 'Fusion créative de cuisines du monde avec présentation innovante et audacieuse',
  molecular: 'Gastronomie moléculaire avec textures surprenantes, sphérifications et gels',
  rustic: 'Style rustique raffiné mettant en valeur les produits du terroir authentiques',
};

// --------------------------------------------
// Descriptions des styles de présentation
// --------------------------------------------
export const presentationDescriptions: Record<PresentationStyle, string> = {
  minimalist: 'Assiette épurée avec espace négatif important, focus absolu sur les ingrédients',
  elaborate: 'Composition complexe et sophistiquée avec multiples éléments et garnitures',
  artistic: 'Présentation artistique abstraite avec couleurs vives et formes géométriques',
  traditional: 'Disposition classique respectant les codes traditionnels de la haute gastronomie',
};

// --------------------------------------------
// Template pour la génération de prompts visuels
// --------------------------------------------
export const promptTemplates = {
  /**
   * Génère le prompt système enrichi avec le style
   */
  system: (style: CulinaryStyle, presentation: PresentationStyle): string => {
    const styleDesc = styleDescriptions[style] || styleDescriptions.modern;
    const presentationDesc = presentationDescriptions[presentation] || presentationDescriptions.artistic;

    return `${SYSTEM_PROMPT_VISUAL}

STYLE CULINAIRE DEMANDÉ: ${styleDesc}
STYLE DE PRÉSENTATION: ${presentationDesc}`;
  },

  /**
   * Génère le prompt utilisateur avec les ingrédients
   */
  user: (ingredients: string[], style: CulinaryStyle, presentation: PresentationStyle): string => {
    const ingredientsList = ingredients.join(', ');

    return `Crée une description visuelle détaillée pour un plat gastronomique original et innovant.

INGRÉDIENTS PRINCIPAUX À UTILISER: ${ingredientsList}

STYLE CULINAIRE: ${style}
PRÉSENTATION: ${presentation}

Imagine un plat digne d'un restaurant 3 étoiles Michelin qui sublime ces ingrédients de manière inattendue et créative. La description doit être en anglais et optimisée pour un générateur d'images AI.`;
  },
};

// --------------------------------------------
// Template pour la modération de contenu
// --------------------------------------------
export const MODERATION_PROMPT = `Tu es un système de modération pour une application culinaire. Analyse les ingrédients suivants.

IMPORTANT: Sois TRÈS PERMISSIF avec les ingrédients alimentaires. Cette application est pour la cuisine créative.

ACCEPTER (isValid: true):
- TOUS les ingrédients alimentaires, même exotiques ou rares (bottarga, pitaya, yuzu, etc.)
- TOUTES les épices et aromates du monde entier
- TOUS les fruits, légumes, viandes, poissons, fromages
- Les ingrédients fermentés (kimchi, miso, etc.)
- Les préparations culinaires (chocolat, beurre, crème, etc.)
- Les termes de cuisson ou de style (froid, chaud, chinois, japonais, etc.)
- Les combinaisons inhabituelles mais comestibles

REJETER UNIQUEMENT (isValid: false):
- Substances réellement toxiques (arsenic, cyanure, mort-aux-rats)
- Objets non alimentaires (plastique, métal, verre)
- Drogues illicites explicites (cocaïne, héroïne)
- Termes vulgaires ou offensants évidents

EN CAS DE DOUTE: ACCEPTER (isValid: true)

Réponds UNIQUEMENT en format JSON valide:
{
  "isValid": boolean,
  "flaggedItems": ["liste des éléments problématiques"],
  "reason": "explication courte si non valide"
}`;

// --------------------------------------------
// Template pour les suggestions d'ingrédients
// --------------------------------------------
export const suggestionTemplates = {
  /**
   * Génère le prompt pour les suggestions
   */
  suggestions: (currentIngredients: string[], partialInput: string): string => {
    const context = currentIngredients.length > 0
      ? `Ingrédients déjà sélectionnés: ${currentIngredients.join(', ')}\n`
      : '';

    return `${context}L'utilisateur recherche un ingrédient commençant par ou contenant: "${partialInput}"

Suggère exactement 5 ingrédients culinaires qui:
1. Correspondent à la recherche "${partialInput}"
2. Se marient harmonieusement avec les ingrédients existants (si présents)
3. Sont facilement disponibles dans une cuisine classique ou un supermarché
4. Apportent de la diversité (légumes, protéines, aromates, etc.)

Réponds UNIQUEMENT avec un tableau JSON d'ingrédients en français, sans explication:
["ingrédient1", "ingrédient2", "ingrédient3", "ingrédient4", "ingrédient5"]`;
  },
};

// --------------------------------------------
// Types exportés
// --------------------------------------------
export type { CulinaryStyle, PresentationStyle };

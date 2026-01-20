// ============================================
// Constructeur dynamique de prompts pour DreamDish
// ============================================

import {
  promptTemplates,
  MODERATION_PROMPT,
  suggestionTemplates,
  styleDescriptions,
  presentationDescriptions,
} from './templates';
import type { CulinaryStyle, PresentationStyle, BuiltPrompt } from '@/types';

// --------------------------------------------
// Interface pour les options du builder
// --------------------------------------------
export interface PromptBuilderOptions {
  ingredients: string[];
  style?: CulinaryStyle;
  presentation?: PresentationStyle;
  additionalContext?: string;
}

// --------------------------------------------
// Constructeur de prompts visuels
// --------------------------------------------

/**
 * Construit un prompt complet pour la génération visuelle
 * @param options - Options de construction du prompt
 * @returns Prompt système et utilisateur prêts à l'envoi
 */
export function buildVisualPrompt(options: PromptBuilderOptions): BuiltPrompt {
  const {
    ingredients,
    style = 'modern',
    presentation = 'artistic',
    additionalContext,
  } = options;

  // Validation des ingrédients
  if (!ingredients || ingredients.length === 0) {
    throw new Error('Au moins un ingrédient est requis pour construire le prompt');
  }

  // Construction du prompt système avec le style
  const systemPrompt = promptTemplates.system(style, presentation);

  // Construction du prompt utilisateur
  let userPrompt = promptTemplates.user(ingredients, style, presentation);

  // Ajout du contexte additionnel si fourni
  if (additionalContext && additionalContext.trim()) {
    userPrompt += `\n\nCONTEXTE ADDITIONNEL: ${additionalContext.trim()}`;
  }

  return {
    systemPrompt: systemPrompt,
    userPrompt: userPrompt,
    metadata: {
      ingredientCount: ingredients.length,
      style,
      presentation,
    },
  };
}

// --------------------------------------------
// Constructeur de prompts de modération
// --------------------------------------------

/**
 * Construit un prompt pour la modération de contenu
 * @param ingredients - Liste des ingrédients à vérifier
 * @returns Prompt formaté pour la modération
 */
export function buildModerationPrompt(ingredients: string[]): string {
  if (!ingredients || ingredients.length === 0) {
    throw new Error('Au moins un ingrédient est requis pour la modération');
  }

  const ingredientsList = ingredients
    .map((ingredient, index) => `${index + 1}. ${ingredient}`)
    .join('\n');

  return `${MODERATION_PROMPT}

INGRÉDIENTS À ANALYSER:
${ingredientsList}`;
}

// --------------------------------------------
// Constructeur de prompts de suggestions
// --------------------------------------------

/**
 * Construit un prompt pour les suggestions d'ingrédients
 * @param currentIngredients - Ingrédients déjà sélectionnés
 * @param partialInput - Texte partiel entré par l'utilisateur
 * @returns Prompt formaté pour les suggestions
 */
export function buildSuggestionPrompt(
  currentIngredients: string[],
  partialInput: string
): string {
  if (!partialInput || partialInput.trim().length < 2) {
    throw new Error('Au moins 2 caractères sont requis pour les suggestions');
  }

  return suggestionTemplates.suggestions(
    currentIngredients || [],
    partialInput.trim()
  );
}

// --------------------------------------------
// Utilitaires pour les prompts
// --------------------------------------------

/**
 * Obtient la description d'un style culinaire
 * @param style - Style culinaire
 * @returns Description du style
 */
export function getStyleDescription(style: CulinaryStyle): string {
  return styleDescriptions[style] || styleDescriptions.modern;
}

/**
 * Obtient la description d'un style de présentation
 * @param presentation - Style de présentation
 * @returns Description de la présentation
 */
export function getPresentationDescription(presentation: PresentationStyle): string {
  return presentationDescriptions[presentation] || presentationDescriptions.artistic;
}

/**
 * Valide les options de construction de prompt
 * @param options - Options à valider
 * @returns true si valide, sinon lance une erreur
 */
export function validatePromptOptions(options: PromptBuilderOptions): boolean {
  const { ingredients, style, presentation } = options;

  // Validation des ingrédients
  if (!ingredients || !Array.isArray(ingredients)) {
    throw new Error('Les ingrédients doivent être un tableau');
  }

  if (ingredients.length === 0) {
    throw new Error('Au moins un ingrédient est requis');
  }

  if (ingredients.length > 15) {
    throw new Error('Maximum 15 ingrédients autorisés');
  }

  // Validation des ingrédients individuels
  for (const ingredient of ingredients) {
    if (typeof ingredient !== 'string' || ingredient.trim().length === 0) {
      throw new Error('Chaque ingrédient doit être une chaîne non vide');
    }
  }

  // Validation du style (si fourni)
  if (style && !Object.keys(styleDescriptions).includes(style)) {
    throw new Error(`Style culinaire invalide: ${style}`);
  }

  // Validation de la présentation (si fournie)
  if (presentation && !Object.keys(presentationDescriptions).includes(presentation)) {
    throw new Error(`Style de présentation invalide: ${presentation}`);
  }

  return true;
}

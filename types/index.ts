/**
 * Types partagés pour l'application DreamDish
 */

// Type pour un ingrédient
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  imageUrl?: string;
}

// Catégories d'ingrédients
export enum IngredientCategory {
  VEGETABLE = 'vegetable',
  FRUIT = 'fruit',
  MEAT = 'meat',
  FISH = 'fish',
  DAIRY = 'dairy',
  SPICE = 'spice',
  GRAIN = 'grain',
  OTHER = 'other',
}

// Réponse de l'API de génération de prompt
export interface GeneratePromptResponse {
  prompt: string;
  ingredients: string[];
  timestamp: number;
}

// Styles culinaires disponibles
export type CulinaryStyle =
  | 'modern'
  | 'classic'
  | 'fusion'
  | 'molecular'
  | 'rustic';

// Styles de présentation disponibles
export type PresentationStyle =
  | 'minimalist'
  | 'elaborate'
  | 'artistic'
  | 'traditional';

// Requête pour générer un prompt
export interface GeneratePromptRequest {
  ingredients: string[];
  style?: CulinaryStyle;
  options?: PromptOptions;
}

// Options pour la génération de prompt
export interface PromptOptions {
  temperature?: number;
  maxTokens?: number;
  model?: MistralModel;
}

// Modèles Mistral disponibles
export enum MistralModel {
  LARGE = 'mistral-large-latest',
  MEDIUM = 'mistral-medium-latest',
  SMALL = 'mistral-small-latest',
  MODERATION = 'mistral-moderation-latest',
}

// Requête pour la génération complète (prompt + image)
export interface GenerateFullRequest {
  ingredients: string[];
  style?: CulinaryStyle;
  presentation?: PresentationStyle;
  filters?: FilterSelection;
}

// Sélection des filtres culinaires
export interface FilterSelection {
  category?: string;
  cuisson?: string;
  style?: string;
  regime?: string;
  type?: string;
}

// Réponse de la génération complète
export interface GenerateFullResponse {
  prompt: string;
  imageUrl: string;
  model: string;
  tokensUsed: number;
  generatedAt: string;
}

// Résultat de la modération
export interface ModerationResult {
  isValid: boolean;
  flaggedCategories: string[];
  confidence: number;
  reason?: string;
}

// Requête pour les suggestions d'ingrédients
export interface SuggestionRequest {
  partialInput: string;
  currentIngredients?: string[];
}

// Réponse des suggestions d'ingrédients
export interface SuggestionResponse {
  suggestions: string[];
}

// Réponse de la génération d'image
export interface GenerateImageResponse {
  imageUrl: string;
  prompt: string;
  generatedAt: string;
}

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

// Requête pour générer un prompt
export interface GeneratePromptRequest {
  ingredients: string[];
  style?: string;
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
  style?: string;
  presentation?: string;
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

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
  model?: string;       
  tokensUsed?: number;  
  generatedAt?: string;
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
  additionalContext?: string;
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

// ============================================
// Types pour la génération de recettes (Vision-to-Recipe)
// ============================================

// Structure d'une recette générée
export interface GeneratedRecipe {
  /** Titre créatif et unique de la recette */
  title: string;
  /** Description courte du plat */
  description: string;
  /** Temps de préparation estimé en minutes */
  prepTime: number;
  /** Temps de cuisson estimé en minutes */
  cookTime: number;
  /** Nombre de portions */
  servings: number;
  /** Niveau de difficulté */
  difficulty: 'facile' | 'moyen' | 'difficile' | 'expert';
  /** Liste des ingrédients avec quantités */
  ingredients: RecipeIngredient[];
  /** Instructions étape par étape */
  instructions: RecipeStep[];
  /** Guide de dressage/présentation */
  platingGuide: string;
  /** Tags culinaires */
  tags: string[];
}

// Ingrédient de recette avec quantité
export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
  isOriginal: boolean; // True si fourni par l'utilisateur
  category: 'principal' | 'condiment' | 'épice' | 'garniture' | 'sauce';
}

// Étape d'instruction
export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  duration?: number; // en minutes
  tips?: string;
}

// Estimation nutritionnelle
export interface NutritionalInfo {
  calories: number;
  protein: number; // en grammes
  carbohydrates: number; // en grammes
  fat: number; // en grammes
  fiber: number; // en grammes
  sodium: number; // en mg
  disclaimer: string;
}

// Suggestion d'accord mets-vin/boisson
export interface DrinkPairing {
  type: 'vin' | 'bière' | 'cocktail' | 'sans-alcool';
  name: string;
  description: string;
  reason: string;
  alternatives: string[];
}

// Entrée du livre de recettes
export interface CookbookEntry {
  id: string;
  recipe: GeneratedRecipe;
  imageUrl: string;
  originalIngredients: string[];
  nutritionalInfo?: NutritionalInfo;
  drinkPairings?: DrinkPairing[];
  createdAt: string;
  notes?: string;
  rating?: number;
  category?: string;
  isFavorite: boolean;
}

// Requête pour générer une recette
export interface GenerateRecipeRequest {
  imageUrl: string;
  originalIngredients: string[];
  imageBase64?: string;
}

// Réponse de la génération de recette
export interface GenerateRecipeResponse {
  recipe: GeneratedRecipe;
  nutritionalInfo: NutritionalInfo;
  drinkPairings: DrinkPairing[];
  model: string;
  tokensUsed: number;
  generatedAt: string;
}

// ============================================
// Types supplémentaires pour la compatibilité
// ============================================
// Prompt construit
export interface BuiltPrompt {
  system: string;
  user: string;
  metadata: {
    style: CulinaryStyle;
    presentation: PresentationStyle;
    ingredientCount: number;
  };
}

// Codes d'erreur AI
export type AIErrorCode =
  | 'RATE_LIMIT'
  | 'RATE_LIMITED'  
  | 'INVALID_API_KEY'
  | 'AUTH_ERROR' 
  | 'MODEL_NOT_FOUND' 
  | 'MODEL_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'EMPTY_RESPONSE' 
  | 'MODERATION_FAILED' 
  | 'CONTENT_FILTERED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

// Erreur AI structurée
export interface AIError extends Error {
  code: AIErrorCode;
  retryable: boolean;
  retryAfter?: number;
}

// Statut de santé AI
export interface AIHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks?: { 
    mistralConnection: boolean;
    apiKeyValid: boolean;
    moderationEnabled: boolean;
    suggestionsEnabled: boolean;
  };
  mistral: {
    connected: boolean;
    latency?: number;
  };
  imageGeneration: {
    available: boolean;
    provider: string;
  };
  metrics?: {
    totalRequests: number; // Required
    successRate: number;   // Required
    averageLatency: number; // Required
    tokenUsage?: any;      // Optional or specific type
    recentRequests?: number;
    suggestionsCache?: any;
  };
  timestamp?: string;
}

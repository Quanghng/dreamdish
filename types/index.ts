// ============================================
// Types partagés pour l'application DreamDish
// ============================================

// --------------------------------------------
// Types pour les ingrédients
// --------------------------------------------

/**
 * Catégories d'ingrédients disponibles
 */
export type IngredientCategory =
  | 'vegetables'
  | 'fruits'
  | 'meats'
  | 'seafood'
  | 'dairy'
  | 'spices'
  | 'grains'
  | 'other';

/**
 * Représente un ingrédient dans le catalogue
 */
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  imageUrl?: string;
}

// --------------------------------------------
// Types pour les styles culinaires
// --------------------------------------------

/**
 * Styles culinaires disponibles pour la génération
 */
export type CulinaryStyle =
  | 'modern'
  | 'classic'
  | 'fusion'
  | 'molecular'
  | 'rustic';

/**
 * Styles de présentation pour le plat
 */
export type PresentationStyle =
  | 'minimalist'
  | 'elaborate'
  | 'artistic'
  | 'traditional';

// --------------------------------------------
// Types pour les requêtes/réponses API
// --------------------------------------------

/**
 * Requête pour générer un prompt visuel
 */
export interface GeneratePromptRequest {
  ingredients: string[];
  style?: CulinaryStyle;
  presentation?: PresentationStyle;
  additionalContext?: string;
}

/**
 * Réponse de l'API de génération de prompt
 */
export interface GeneratePromptResponse {
  prompt: string;
  model: string;
  tokensUsed: number;
  generatedAt: string;
}

/**
 * Requête pour générer une image
 */
export interface GenerateImageRequest {
  prompt: string;
  width?: number;
  height?: number;
}

/**
 * Réponse de l'API de génération d'image
 */
export interface GenerateImageResponse {
  imageUrl: string;
  prompt: string;
  generatedAt: string;
}

/**
 * Requête combinée pour générer prompt + image
 */
export interface GenerateFullRequest {
  ingredients: string[];
  style?: CulinaryStyle;
  presentation?: PresentationStyle;
  generateImage?: boolean;
}

/**
 * Réponse combinée avec prompt et image
 */
export interface GenerateFullResponse {
  prompt: string;
  imageUrl?: string;
  model: string;
  tokensUsed: number;
  generatedAt: string;
}

/**
 * Requête pour les suggestions d'ingrédients
 */
export interface SuggestionRequest {
  currentIngredients: string[];
  partialInput: string;
}

/**
 * Réponse de l'API de suggestions
 */
export interface SuggestionResponse {
  suggestions: string[];
}

// --------------------------------------------
// Types pour la modération
// --------------------------------------------

/**
 * Résultat de la vérification de modération
 */
export interface ModerationResult {
  isValid: boolean;
  flaggedCategories: string[];
  confidence: number;
  reason?: string;
}

// --------------------------------------------
// Types pour la gestion des erreurs
// --------------------------------------------

/**
 * Erreur standardisée pour les opérations AI
 */
export interface AIError {
  code: string;
  message: string;
  retryable: boolean;
}

/**
 * Codes d'erreur possibles
 */
export type AIErrorCode =
  | 'RATE_LIMITED'
  | 'AUTH_ERROR'
  | 'MODEL_NOT_FOUND'
  | 'INVALID_REQUEST'
  | 'EMPTY_RESPONSE'
  | 'MODERATION_FAILED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

// --------------------------------------------
// Types pour les métriques et monitoring
// --------------------------------------------

/**
 * Métriques d'une requête AI
 */
export interface AIMetrics {
  operation: string;
  model: string;
  durationMs: number;
  tokensUsed: number;
  success: boolean;
  errorCode?: string;
  timestamp: string;
}

/**
 * Statut de santé du service AI
 */
export interface AIHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: {
    mistralConnection: boolean;
    apiKeyValid: boolean;
    moderationEnabled: boolean;
    suggestionsEnabled: boolean;
  };
  metrics: {
    averageLatency: number;
    successRate: number;
    tokenUsage: {
      total: number;
      average: number;
    };
    recentRequests: number;
  };
  timestamp: string;
}

// --------------------------------------------
// Types pour le rate limiting
// --------------------------------------------

/**
 * Résultat de la vérification du rate limit
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// --------------------------------------------
// Types pour les options de prompt
// --------------------------------------------

/**
 * Options avancées pour la génération de prompt
 */
export interface PromptOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Prompt construit prêt à être envoyé
 */
export interface BuiltPrompt {
  system: string;
  user: string;
}

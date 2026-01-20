// ============================================
// Gestion des erreurs AI pour DreamDish
// ============================================

import type { AIError, AIErrorCode } from '@/types';

// --------------------------------------------
// Codes d'erreur constants
// --------------------------------------------
export const ErrorCodes: Record<AIErrorCode, AIErrorCode> = {
  RATE_LIMITED: 'RATE_LIMITED',
  AUTH_ERROR: 'AUTH_ERROR',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
  EMPTY_RESPONSE: 'EMPTY_RESPONSE',
  MODERATION_FAILED: 'MODERATION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

// --------------------------------------------
// Classe d'erreur personnalisée pour Mistral
// --------------------------------------------
export class MistralError extends Error implements AIError {
  code: string;
  retryable: boolean;

  constructor(code: string, message: string, retryable: boolean) {
    super(message);
    this.name = 'MistralError';
    this.code = code;
    this.retryable = retryable;
  }
}

// --------------------------------------------
// Fonctions de création d'erreurs
// --------------------------------------------

/**
 * Crée une erreur AI standardisée
 */
export function createAIError(
  code: AIErrorCode,
  message: string,
  retryable: boolean
): AIError {
  return { code, message, retryable };
}

/**
 * Crée une erreur appropriée à partir d'un code de statut HTTP
 */
export function createErrorFromStatusCode(
  statusCode: number,
  message: string
): MistralError {
  switch (statusCode) {
    case 401:
      return new MistralError(
        ErrorCodes.AUTH_ERROR,
        'Clé API invalide. Veuillez vérifier MISTRAL_API_KEY.',
        false
      );
    case 429:
      return new MistralError(
        ErrorCodes.RATE_LIMITED,
        'Limite de débit dépassée. Veuillez patienter.',
        true
      );
    case 404:
      return new MistralError(
        ErrorCodes.MODEL_NOT_FOUND,
        'Modèle demandé non disponible.',
        false
      );
    case 400:
      return new MistralError(
        ErrorCodes.INVALID_REQUEST,
        message || 'Paramètres de requête invalides.',
        false
      );
    case 408:
    case 504:
      return new MistralError(
        ErrorCodes.TIMEOUT,
        'Délai d\'attente dépassé.',
        true
      );
    default:
      return new MistralError(
        ErrorCodes.UNKNOWN,
        message || 'Une erreur inattendue s\'est produite.',
        true
      );
  }
}

/**
 * Gère les erreurs de l'API Mistral et les convertit en erreurs standardisées
 */
export function handleMistralError(error: unknown): AIError {
  // Erreur déjà formatée
  if (error instanceof MistralError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Limitation de débit
    if (message.includes('rate limit') || message.includes('429')) {
      return createAIError(
        ErrorCodes.RATE_LIMITED,
        'Limite de débit API dépassée. Veuillez patienter.',
        true
      );
    }

    // Authentification
    if (message.includes('401') || message.includes('unauthorized') || message.includes('invalid api key')) {
      return createAIError(
        ErrorCodes.AUTH_ERROR,
        'Clé API invalide.',
        false
      );
    }

    // Modèle non trouvé
    if (message.includes('404') || message.includes('not found')) {
      return createAIError(
        ErrorCodes.MODEL_NOT_FOUND,
        'Modèle demandé non disponible.',
        false
      );
    }

    // Timeout
    if (message.includes('timeout') || message.includes('timed out')) {
      return createAIError(
        ErrorCodes.TIMEOUT,
        'La requête a expiré.',
        true
      );
    }

    // Erreur réseau
    if (message.includes('network') || message.includes('fetch') || message.includes('econnrefused')) {
      return createAIError(
        ErrorCodes.NETWORK_ERROR,
        'Erreur de connexion réseau.',
        true
      );
    }

    // Erreur générique
    return createAIError(ErrorCodes.UNKNOWN, error.message, true);
  }

  return createAIError(ErrorCodes.UNKNOWN, 'Une erreur inattendue s\'est produite.', true);
}

// --------------------------------------------
// Messages d'erreur conviviaux pour l'utilisateur
// --------------------------------------------
const userFriendlyMessages: Record<string, string> = {
  [ErrorCodes.RATE_LIMITED]: 'Trop de requêtes. Veuillez patienter quelques instants.',
  [ErrorCodes.AUTH_ERROR]: 'Erreur d\'authentification. Contactez l\'administrateur.',
  [ErrorCodes.MODEL_NOT_FOUND]: 'Service temporairement indisponible.',
  [ErrorCodes.INVALID_REQUEST]: 'Requête invalide. Vérifiez vos ingrédients.',
  [ErrorCodes.EMPTY_RESPONSE]: 'Aucune réponse générée. Réessayez.',
  [ErrorCodes.MODERATION_FAILED]: 'Contenu non autorisé détecté.',
  [ErrorCodes.NETWORK_ERROR]: 'Erreur réseau. Vérifiez votre connexion.',
  [ErrorCodes.TIMEOUT]: 'Délai d\'attente dépassé. Réessayez.',
  [ErrorCodes.UNKNOWN]: 'Une erreur inattendue s\'est produite.',
};

/**
 * Obtient un message d'erreur convivial pour l'utilisateur
 */
export function getUserFriendlyMessage(error: AIError): string {
  return userFriendlyMessages[error.code] || userFriendlyMessages[ErrorCodes.UNKNOWN];
}

/**
 * Vérifie si une valeur est une erreur AI
 */
export function isAIError(error: unknown): error is AIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'retryable' in error
  );
}

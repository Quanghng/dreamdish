// ============================================
// Gestion des erreurs AI pour DreamDish
// ============================================

import type { AIError, AIErrorCode } from '@/types';

// --------------------------------------------
// Codes d'erreur constants
// --------------------------------------------
export const ErrorCodes: Record<string, AIErrorCode> = {
  RATE_LIMIT: 'RATE_LIMIT', // Changed to match Type definition usually
  AUTH_ERROR: 'AUTH_ERROR',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
  EMPTY_RESPONSE: 'EMPTY_RESPONSE',
  MODERATION_FAILED: 'MODERATION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
  SERVER_ERROR: 'SERVER_ERROR'
} as const;

// --------------------------------------------
// Classe d'erreur personnalisée pour Mistral
// --------------------------------------------
export class MistralError extends Error implements AIError {
  code: AIErrorCode;
  retryable: boolean;

  constructor(code: AIErrorCode, message: string, retryable: boolean) {
    super(message);
    this.name = 'MistralError';
    this.code = code;
    this.retryable = retryable;
  }
}

// --------------------------------------------
// Fonctions de création d'erreurs
// --------------------------------------------

export function createAIError(
  code: AIErrorCode,
  message: string,
  retryable: boolean
): AIError {
  const error = new Error(message) as AIError;
  error.name = 'AIError';
  error.code = code;
  error.retryable = retryable;
  return error;
}

export function createErrorFromStatusCode(
  statusCode: number,
  message: string
): MistralError {
  switch (statusCode) {
    case 401:
      return new MistralError(
        'AUTH_ERROR',
        'Clé API invalide. Veuillez vérifier MISTRAL_API_KEY.',
        false
      );
    case 429:
      return new MistralError(
        'RATE_LIMIT',
        'Limite de débit dépassée. Veuillez patienter.',
        true
      );
    case 404:
      return new MistralError(
        'MODEL_NOT_FOUND',
        'Modèle demandé non disponible.',
        false
      );
    case 400:
      return new MistralError(
        'INVALID_REQUEST',
        message || 'Paramètres de requête invalides.',
        false
      );
    case 408:
    case 504:
      return new MistralError(
        'TIMEOUT',
        'Délai d\'attente dépassé.',
        true
      );
    default:
      return new MistralError(
        'UNKNOWN',
        message || 'Une erreur inattendue s\'est produite.',
        true
      );
  }
}

export function handleMistralError(error: unknown): AIError {
  if (error instanceof MistralError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('rate limit') || message.includes('429')) {
      return createAIError(
        'RATE_LIMIT',
        'Limite de débit API dépassée. Veuillez patienter.',
        true
      );
    }

    if (message.includes('401') || message.includes('unauthorized')) {
      return createAIError(
        'AUTH_ERROR',
        'Clé API invalide.',
        false
      );
    }

    if (message.includes('404') || message.includes('not found')) {
      return createAIError(
        'MODEL_NOT_FOUND',
        'Modèle demandé non disponible.',
        false
      );
    }

    if (message.includes('timeout')) {
      return createAIError(
        'TIMEOUT',
        'La requête a expiré.',
        true
      );
    }

    if (message.includes('network') || message.includes('fetch')) {
      return createAIError(
        'NETWORK_ERROR',
        'Erreur de connexion réseau.',
        true
      );
    }

    return createAIError('UNKNOWN', error.message, true);
  }

  return createAIError('UNKNOWN', 'Une erreur inattendue s\'est produite.', true);
}

const userFriendlyMessages: Record<string, string> = {
  'RATE_LIMIT': 'Trop de requêtes. Veuillez patienter quelques instants.',
  'AUTH_ERROR': 'Erreur d\'authentification. Contactez l\'administrateur.',
  'MODEL_NOT_FOUND': 'Service temporairement indisponible.',
  'INVALID_REQUEST': 'Requête invalide. Vérifiez vos ingrédients.',
  'EMPTY_RESPONSE': 'Aucune réponse générée. Réessayez.',
  'MODERATION_FAILED': 'Contenu non autorisé détecté.',
  'NETWORK_ERROR': 'Erreur réseau. Vérifiez votre connexion.',
  'TIMEOUT': 'Délai d\'attente dépassé. Réessayez.',
  'UNKNOWN': 'Une erreur inattendue s\'est produite.',
};

export function getUserFriendlyMessage(error: AIError): string {
  return userFriendlyMessages[error.code] || userFriendlyMessages['UNKNOWN'];
}

export function isAIError(error: unknown): error is AIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'retryable' in error
  );
}
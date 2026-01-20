// ============================================
// Configuration globale des tests pour DreamDish
// ============================================

import { afterAll, afterEach, vi } from 'vitest';

// --------------------------------------------
// Mock des variables d'environnement
// --------------------------------------------
vi.stubEnv('MISTRAL_API_KEY', 'test-api-key-for-testing');
vi.stubEnv('ENABLE_MODERATION', 'true');
vi.stubEnv('ENABLE_SUGGESTIONS', 'true');
vi.stubEnv('LOG_AI_REQUESTS', 'false');

// --------------------------------------------
// Mock global du client Mistral
// --------------------------------------------
vi.mock('@mistralai/mistralai', () => ({
  Mistral: vi.fn().mockImplementation(() => ({
    chat: {
      complete: vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: 'A beautifully plated dish featuring golden seared salmon...',
          },
        }],
        usage: {
          totalTokens: 150,
          promptTokens: 50,
          completionTokens: 100,
        },
      }),
    },
  })),
}));

// --------------------------------------------
// Nettoyage après chaque test
// --------------------------------------------
afterEach(() => {
  vi.clearAllMocks();
});

// --------------------------------------------
// Nettoyage global après tous les tests
// --------------------------------------------
afterAll(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

// --------------------------------------------
// Utilitaires de test
// --------------------------------------------

/**
 * Crée une requête mock pour les tests d'API
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Request {
  const { method = 'POST', body, headers = {} } = options;

  return new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Génère des ingrédients de test
 */
export function generateTestIngredients(count: number = 3): string[] {
  const ingredients = [
    'saumon', 'citron', 'aneth', 'asperges', 'beurre',
    'ail', 'échalote', 'crème fraîche', 'poivre', 'sel',
  ];
  return ingredients.slice(0, count);
}

/**
 * Mock d'une réponse AI réussie
 */
export const mockSuccessfulAIResponse = {
  choices: [{
    message: {
      content: 'A stunning gourmet plate featuring perfectly seared salmon with crispy skin, ' +
        'accompanied by tender asparagus spears and a delicate lemon butter sauce. ' +
        'The dish is presented on a white porcelain plate with artistic sauce drizzles.',
    },
  }],
  usage: {
    totalTokens: 200,
    promptTokens: 80,
    completionTokens: 120,
  },
};

/**
 * Mock d'une réponse de modération valide
 */
export const mockValidModerationResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        isValid: true,
        flaggedItems: [],
        reason: null,
      }),
    },
  }],
  usage: { totalTokens: 50 },
};

/**
 * Mock d'une réponse de modération invalide
 */
export const mockInvalidModerationResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        isValid: false,
        flaggedItems: ['poison'],
        reason: 'Ingrédient dangereux détecté',
      }),
    },
  }],
  usage: { totalTokens: 50 },
};

/**
 * Mock d'une réponse de suggestions
 */
export const mockSuggestionsResponse = {
  choices: [{
    message: {
      content: '["tomate", "thon", "tortilla", "thym", "truffe"]',
    },
  }],
  usage: { totalTokens: 30 },
};

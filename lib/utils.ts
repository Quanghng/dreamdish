// ============================================
// Fonctions utilitaires pour l'application DreamDish
// ============================================

import { type ClassValue, clsx } from 'clsx';
import { mistralConfig } from '@/config/mistral.config';
import type { AIError, RateLimitResult } from '@/types';

// --------------------------------------------
// Utilitaires CSS
// --------------------------------------------

/**
 * Combine les classes CSS avec clsx
 * Utile pour Tailwind CSS avec conditions
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// --------------------------------------------
// Utilitaires de formatage
// --------------------------------------------

/**
 * Formate une liste d'ingrédients en phrase
 * Ex: ["tomate", "basilic", "mozzarella"] => "tomate, basilic et mozzarella"
 */
export function formatIngredientsList(ingredients: string[]): string {
  if (ingredients.length === 0) return '';
  if (ingredients.length === 1) return ingredients[0];
  if (ingredients.length === 2) return `${ingredients[0]} et ${ingredients[1]}`;

  const allButLast = ingredients.slice(0, -1).join(', ');
  const last = ingredients[ingredients.length - 1];
  return `${allButLast} et ${last}`;
}

/**
 * Tronque un texte à une longueur maximale
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// --------------------------------------------
// Utilitaires de validation
// --------------------------------------------

/**
 * Valide si une clé API est correctement formatée
 */
export function isValidApiKey(key: string): boolean {
  return key.length > 0 && !key.includes('votre_clé') && !key.includes('your_key');
}

/**
 * Valide une liste d'ingrédients
 * @returns null si valide, sinon le message d'erreur
 */
export function validateIngredients(ingredients: unknown): string | null {
  if (!ingredients) {
    return 'Le champ ingredients est requis';
  }

  if (!Array.isArray(ingredients)) {
    return 'ingredients doit être un tableau';
  }

  if (ingredients.length === 0) {
    return 'Au moins un ingrédient est requis';
  }

  if (ingredients.length > 15) {
    return 'Maximum 15 ingrédients autorisés';
  }

  // Vérification de chaque ingrédient
  for (const ingredient of ingredients) {
    if (typeof ingredient !== 'string') {
      return 'Chaque ingrédient doit être une chaîne de caractères';
    }
    if (ingredient.trim().length === 0) {
      return 'Les ingrédients ne peuvent pas être vides';
    }
    if (ingredient.length > 100) {
      return 'Chaque ingrédient doit faire moins de 100 caractères';
    }
  }

  return null;
}

// --------------------------------------------
// Utilitaires async - Retry avec backoff exponentiel
// --------------------------------------------

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

/**
 * Exécute une fonction avec logique de retry et backoff exponentiel
 * @param fn - Fonction à exécuter
 * @param options - Options de retry (utilise la config par défaut si non fourni)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const {
    maxRetries = mistralConfig.retry.maxRetries,
    initialDelayMs = mistralConfig.retry.initialDelayMs,
    maxDelayMs = mistralConfig.retry.maxDelayMs,
    backoffMultiplier = mistralConfig.retry.backoffMultiplier,
  } = options || {};

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Vérifie si l'erreur est non-retryable
      if (isNonRetryableError(error)) {
        throw error;
      }

      // Ne pas attendre après la dernière tentative
      if (attempt < maxRetries) {
        console.log(`[Retry] Tentative ${attempt + 1} échouée, nouvelle tentative dans ${delay}ms...`);
        await sleep(delay);
        delay = Math.min(delay * backoffMultiplier, maxDelayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Vérifie si une erreur ne doit pas être retentée
 */
function isNonRetryableError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'retryable' in error) {
    return !(error as AIError).retryable;
  }
  return false;
}

/**
 * Pause l'exécution pendant un délai donné
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --------------------------------------------
// Utilitaires de Rate Limiting
// --------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Classe de rate limiting simple en mémoire
 */
class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Vérifie si une requête est autorisée
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    let entry = this.store.get(key);

    // Nettoyage des entrées expirées
    if (entry && entry.resetAt <= now) {
      entry = undefined;
    }

    if (!entry) {
      entry = {
        count: 0,
        resetAt: now + this.windowMs,
      };
    }

    const allowed = entry.count < this.maxRequests;

    if (allowed) {
      entry.count++;
      this.store.set(key, entry);
    }

    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetAt: entry.resetAt,
    };
  }

  /**
   * Réinitialise le limiteur pour une clé donnée
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Nettoie toutes les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }
}

// Instances de rate limiters pour différents usages
export const apiRateLimiter = new RateLimiter(60000, 30);   // 30 requêtes/minute pour l'API
export const aiRateLimiter = new RateLimiter(60000, 10);    // 10 appels AI/minute

// --------------------------------------------
// Utilitaires de parsing
// --------------------------------------------

/**
 * Parse de manière sécurisée une réponse JSON
 */
export function safeJsonParse<T>(content: string): T | null {
  try {
    // Essaie d'extraire un objet ou tableau JSON de la réponse
    const match = content.match(/[\[{][\s\S]*[\]}]/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
  } catch {
    // Parsing échoué
  }
  return null;
}

/**
 * Extrait un tableau de suggestions d'une réponse AI
 */
export function parseSuggestionsResponse(content: string): string[] {
  // Essaie de parser comme JSON
  const parsed = safeJsonParse<string[]>(content);
  if (Array.isArray(parsed)) {
    return parsed
      .filter(s => typeof s === 'string')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 5);
  }

  // Fallback: parse ligne par ligne
  return content
    .split('\n')
    .map(line => line.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(line => line.length > 0 && line.length < 50)
    .slice(0, 5);
}

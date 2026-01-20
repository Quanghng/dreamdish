/**
 * Fonctions utilitaires pour l'application
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Combine les classes CSS avec clsx
 * Utile pour Tailwind CSS avec conditions
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

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
 * Valide si une clé API est correctement formatée
 */
export function isValidApiKey(key: string): boolean {
  return key.length > 0 && !key.includes('votre_clé');
}

/**
 * Tronque un texte à une longueur maximale
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Parse JSON de manière sécurisée
 * Retourne null si le parsing échoue
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    // Extraire le JSON d'un bloc de code markdown si présent
    const jsonMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
    const cleanJson = jsonMatch ? jsonMatch[1].trim() : json.trim();
    return JSON.parse(cleanJson) as T;
  } catch {
    return null;
  }
}

/**
 * Valide une liste d'ingrédients
 * Retourne un message d'erreur ou null si valide
 */
export function validateIngredients(ingredients: unknown): string | null {
  if (!Array.isArray(ingredients)) {
    return 'Les ingrédients doivent être un tableau';
  }

  if (ingredients.length === 0) {
    return 'Au moins un ingrédient est requis';
  }

  if (ingredients.length > 20) {
    return 'Maximum 20 ingrédients autorisés';
  }

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

/**
 * Exécute une fonction avec retry automatique
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Rate limiter simple en mémoire
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(key: string): { allowed: boolean; resetAt: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Récupérer les requêtes existantes et filtrer celles dans la fenêtre
    const existing = this.requests.get(key) || [];
    const recent = existing.filter(timestamp => timestamp > windowStart);

    if (recent.length >= this.maxRequests) {
      return {
        allowed: false,
        resetAt: recent[0] + this.windowMs,
      };
    }

    // Ajouter la nouvelle requête
    recent.push(now);
    this.requests.set(key, recent);

    return {
      allowed: true,
      resetAt: now + this.windowMs,
    };
  }
}

// Instance globale du rate limiter pour les appels AI
export const aiRateLimiter = new RateLimiter(10, 60000); // 10 requêtes par minute

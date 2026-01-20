// ============================================
// Service de modération de contenu pour DreamDish
// ============================================

import { getMistralClient } from './mistral';
import { mistralConfig } from '@/config/mistral.config';
import { buildModerationPrompt } from '@/lib/prompts/builder';
import { safeJsonParse } from '@/lib/utils';
import type { ModerationResult } from '@/types';

// --------------------------------------------
// Liste noire pour vérification rapide
// --------------------------------------------
const BLOCKLIST = [
  // Substances dangereuses
  'poison', 'toxique', 'toxic', 'arsenic', 'cyanure', 'cyanide',
  // Substances illicites
  'drogue', 'drug', 'cocaine', 'heroin', 'cannabis', 'marijuana',
  // Non alimentaire
  'plastique', 'plastic', 'metal', 'verre', 'glass',
  // Termes offensants (exemples)
  'explosive', 'weapon', 'arme',
];

// --------------------------------------------
// Fonction principale de modération
// --------------------------------------------

/**
 * Modère le contenu des ingrédients avant traitement
 * Combine une vérification rapide par liste noire et une vérification AI
 * 
 * @param ingredients - Liste des ingrédients à vérifier
 * @returns Résultat de la modération
 */
export async function moderateContent(
  ingredients: string[]
): Promise<ModerationResult> {
  // Étape 1: Vérification rapide par liste noire
  const blocklistResult = checkBlocklist(ingredients);
  if (!blocklistResult.isValid) {
    return blocklistResult;
  }

  // Étape 2: Modération AI (si le modèle est disponible)
  // Si la modération AI échoue, on autorise par défaut (fail-open)
  try {
    return await aiModeration(ingredients);
  } catch (error) {
    console.error('[Modération] Échec de la modération AI, utilisation du fallback:', error);
    // Fallback: autoriser si la modération AI échoue
    return {
      isValid: true,
      flaggedCategories: [],
      confidence: 0.5,
      reason: 'Modération AI indisponible, vérification basique effectuée',
    };
  }
}

// --------------------------------------------
// Vérification par liste noire (rapide)
// --------------------------------------------

/**
 * Effectue une vérification rapide contre la liste noire
 * @param ingredients - Liste des ingrédients à vérifier
 * @returns Résultat de la vérification
 */
function checkBlocklist(ingredients: string[]): ModerationResult {
  const flagged: string[] = [];

  for (const ingredient of ingredients) {
    const normalized = ingredient.toLowerCase().trim();

    for (const blocked of BLOCKLIST) {
      if (normalized.includes(blocked)) {
        flagged.push(ingredient);
        break; // Un seul match suffit pour flaguer l'ingrédient
      }
    }
  }

  if (flagged.length > 0) {
    return {
      isValid: false,
      flaggedCategories: ['blocklist'],
      confidence: 1.0,
      reason: `Ingrédients non autorisés détectés: ${flagged.join(', ')}`,
    };
  }

  return {
    isValid: true,
    flaggedCategories: [],
    confidence: 1.0,
  };
}

// --------------------------------------------
// Modération par AI
// --------------------------------------------

/**
 * Effectue une modération avancée via l'AI Mistral
 * @param ingredients - Liste des ingrédients à vérifier
 * @returns Résultat de la modération AI
 */
async function aiModeration(ingredients: string[]): Promise<ModerationResult> {
  const client = getMistralClient();
  const prompt = buildModerationPrompt(ingredients);

  const response = await client.chat.complete({
    model: mistralConfig.models.moderation,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1, // Température basse pour une modération cohérente
    maxTokens: 256,
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    // Pas de réponse, on autorise par défaut
    return {
      isValid: true,
      flaggedCategories: [],
      confidence: 0.5,
    };
  }

  // Parse de la réponse de modération
  return parseModerationResponse(content);
}

// --------------------------------------------
// Parsing de la réponse de modération
// --------------------------------------------

/**
 * Interface pour la réponse JSON de modération
 */
interface ModerationJsonResponse {
  isValid: boolean;
  flaggedItems?: string[];
  reason?: string;
}

/**
 * Parse la réponse JSON de l'AI de modération
 * @param content - Contenu de la réponse AI
 * @returns Résultat de modération formaté
 */
function parseModerationResponse(content: string): ModerationResult {
  const parsed = safeJsonParse<ModerationJsonResponse>(content);

  if (parsed && typeof parsed.isValid === 'boolean') {
    return {
      isValid: parsed.isValid,
      flaggedCategories: Array.isArray(parsed.flaggedItems) ? parsed.flaggedItems : [],
      confidence: 0.9,
      reason: parsed.reason,
    };
  }

  // Si le parsing échoue, on autorise par défaut
  return {
    isValid: true,
    flaggedCategories: [],
    confidence: 0.5,
    reason: 'Impossible de parser la réponse de modération',
  };
}

// --------------------------------------------
// Fonction utilitaire pour vérification simple
// --------------------------------------------

/**
 * Vérifie rapidement si un ingrédient unique est valide
 * Utile pour la validation en temps réel
 * 
 * @param ingredient - Ingrédient à vérifier
 * @returns true si l'ingrédient semble valide
 */
export function isIngredientValid(ingredient: string): boolean {
  const normalized = ingredient.toLowerCase().trim();

  for (const blocked of BLOCKLIST) {
    if (normalized.includes(blocked)) {
      return false;
    }
  }

  return true;
}

/**
 * Obtient la liste des termes bloqués (pour debug/admin)
 */
export function getBlocklist(): readonly string[] {
  return BLOCKLIST;
}

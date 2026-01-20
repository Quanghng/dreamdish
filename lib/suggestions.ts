// ============================================
// Service de suggestions d'ingrédients pour DreamDish
// ============================================

import { getMistralClient } from './mistral';
import { mistralConfig } from '@/config/mistral.config';
import { buildSuggestionPrompt } from '@/lib/prompts/builder';
import { parseSuggestionsResponse } from '@/lib/utils';
import type { SuggestionResponse } from '@/types';

// --------------------------------------------
// Cache pour les suggestions (évite les appels redondants)
// --------------------------------------------
interface CacheEntry {
  data: string[];
  timestamp: number;
}

const suggestionsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes de TTL

// --------------------------------------------
// Fonction principale de suggestions
// --------------------------------------------

/**
 * Obtient des suggestions d'ingrédients basées sur l'entrée utilisateur
 * Utilise un cache pour éviter les appels répétitifs
 * 
 * @param currentIngredients - Ingrédients déjà sélectionnés
 * @param partialInput - Texte partiel entré par l'utilisateur
 * @returns Liste de suggestions
 */
export async function getIngredientSuggestions(
  currentIngredients: string[],
  partialInput: string
): Promise<SuggestionResponse> {
  // Validation de l'entrée
  if (!partialInput || partialInput.trim().length < 2) {
    return { suggestions: [] };
  }

  const trimmedInput = partialInput.trim().toLowerCase();

  // Création de la clé de cache
  const cacheKey = createCacheKey(currentIngredients, trimmedInput);

  // Vérification du cache
  const cached = suggestionsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { suggestions: cached.data };
  }

  // Génération des suggestions via AI
  try {
    const suggestions = await generateSuggestions(currentIngredients, trimmedInput);

    // Mise en cache du résultat
    suggestionsCache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now(),
    });

    // Nettoyage périodique du cache
    cleanupCache();

    return { suggestions };
  } catch (error) {
    console.error('[Suggestions] Erreur lors de la génération:', error);
    return { suggestions: [] };
  }
}

// --------------------------------------------
// Génération des suggestions via AI
// --------------------------------------------

/**
 * Appelle l'API Mistral pour générer des suggestions
 * @param currentIngredients - Contexte des ingrédients existants
 * @param partialInput - Recherche de l'utilisateur
 * @returns Liste de suggestions
 */
async function generateSuggestions(
  currentIngredients: string[],
  partialInput: string
): Promise<string[]> {
  const client = getMistralClient();

  // Construction du prompt via le builder
  const prompt = buildSuggestionPrompt(currentIngredients, partialInput);

  const response = await client.chat.complete({
    model: mistralConfig.models.suggestions,
    messages: [{ role: 'user', content: prompt }],
    temperature: mistralConfig.suggestions.temperature,
    maxTokens: mistralConfig.suggestions.maxTokens,
    topP: mistralConfig.suggestions.topP,
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    return [];
  }

  // Parse de la réponse
  return parseSuggestionsResponse(content);
}

// --------------------------------------------
// Gestion du cache
// --------------------------------------------

/**
 * Crée une clé de cache unique basée sur le contexte
 */
function createCacheKey(ingredients: string[], partial: string): string {
  const sortedIngredients = [...ingredients].sort().join(',');
  return `${sortedIngredients}:${partial.toLowerCase()}`;
}

/**
 * Nettoie les entrées expirées du cache
 */
function cleanupCache(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of suggestionsCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      suggestionsCache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0 && mistralConfig.features.logRequests) {
    console.log(`[Suggestions Cache] ${cleaned} entrées expirées supprimées`);
  }
}

/**
 * Vide complètement le cache des suggestions
 * Utile pour les tests ou le reset manuel
 */
export function clearSuggestionsCache(): void {
  suggestionsCache.clear();
  console.log('[Suggestions Cache] Cache vidé');
}

/**
 * Obtient les statistiques du cache
 */
export function getCacheStats(): { size: number; oldestEntry: number | null } {
  let oldestTimestamp: number | null = null;

  for (const entry of suggestionsCache.values()) {
    if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp;
    }
  }

  return {
    size: suggestionsCache.size,
    oldestEntry: oldestTimestamp,
  };
}

// --------------------------------------------
// Suggestions statiques de fallback
// --------------------------------------------

/**
 * Liste d'ingrédients communs pour le fallback
 */
const COMMON_INGREDIENTS = [
  // Légumes
  'tomate', 'carotte', 'oignon', 'ail', 'poivron', 'courgette', 'aubergine',
  'épinard', 'brocoli', 'champignon', 'pomme de terre', 'haricot vert',
  // Fruits
  'citron', 'orange', 'pomme', 'fraise', 'framboise', 'mangue', 'avocat',
  // Protéines
  'poulet', 'boeuf', 'porc', 'agneau', 'saumon', 'thon', 'crevette',
  // Produits laitiers
  'fromage', 'crème', 'beurre', 'lait', 'yaourt', 'mozzarella', 'parmesan',
  // Aromates et épices
  'basilic', 'thym', 'romarin', 'persil', 'coriandre', 'menthe', 'curry',
  // Féculents
  'riz', 'pâtes', 'quinoa', 'lentilles', 'pois chiche',
];

/**
 * Fournit des suggestions de fallback basées sur une recherche locale
 * Utilisé quand l'API AI n'est pas disponible
 * 
 * @param partialInput - Texte partiel de recherche
 * @returns Liste de suggestions locales
 */
export function getLocalSuggestions(partialInput: string): string[] {
  const search = partialInput.toLowerCase().trim();

  if (search.length < 2) {
    return [];
  }

  return COMMON_INGREDIENTS
    .filter(ingredient => ingredient.toLowerCase().includes(search))
    .slice(0, 5);
}

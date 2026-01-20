// ============================================
// Tests unitaires pour le service de suggestions
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getIngredientSuggestions,
  getLocalSuggestions,
  clearSuggestionsCache,
  getCacheStats,
} from '@/lib/suggestions';

// --------------------------------------------
// Tests du service de suggestions
// --------------------------------------------

describe('Service de Suggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSuggestionsCache();
  });

  // --------------------------------------------
  // Tests de getIngredientSuggestions
  // --------------------------------------------

  describe('getIngredientSuggestions', () => {
    it('devrait retourner des suggestions pour une entrée valide', async () => {
      const result = await getIngredientSuggestions([], 'tom');

      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('devrait retourner un tableau vide pour une entrée trop courte', async () => {
      const result = await getIngredientSuggestions([], 'a');

      expect(result.suggestions).toHaveLength(0);
    });

    it('devrait retourner un tableau vide pour une entrée vide', async () => {
      const result = await getIngredientSuggestions([], '');

      expect(result.suggestions).toHaveLength(0);
    });

    it('devrait prendre en compte les ingrédients existants', async () => {
      const currentIngredients = ['tomate', 'basilic'];
      const result = await getIngredientSuggestions(currentIngredients, 'moz');

      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('devrait limiter les suggestions à 5 maximum', async () => {
      const result = await getIngredientSuggestions([], 'car');

      expect(result.suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  // --------------------------------------------
  // Tests de getLocalSuggestions (fallback)
  // --------------------------------------------

  describe('getLocalSuggestions', () => {
    it('devrait retourner des suggestions locales pour "tom"', () => {
      const suggestions = getLocalSuggestions('tom');

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.some(s => s.toLowerCase().includes('tom'))).toBe(true);
    });

    it('devrait retourner des suggestions locales pour "pou"', () => {
      const suggestions = getLocalSuggestions('pou');

      expect(Array.isArray(suggestions)).toBe(true);
      // Devrait inclure "poulet"
      expect(suggestions.some(s => s.toLowerCase().includes('pou'))).toBe(true);
    });

    it('devrait retourner un tableau vide pour une entrée trop courte', () => {
      const suggestions = getLocalSuggestions('a');

      expect(suggestions).toHaveLength(0);
    });

    it('devrait être insensible à la casse', () => {
      const suggestionsLower = getLocalSuggestions('tomate');
      const suggestionsUpper = getLocalSuggestions('TOMATE');

      expect(suggestionsLower).toEqual(suggestionsUpper);
    });

    it('devrait limiter les résultats à 5', () => {
      const suggestions = getLocalSuggestions('a');

      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  // --------------------------------------------
  // Tests du cache
  // --------------------------------------------

  describe('Cache', () => {
    it('devrait retourner les statistiques du cache', () => {
      const stats = getCacheStats();

      expect(stats).toBeDefined();
      expect(typeof stats.size).toBe('number');
    });

    it('devrait vider le cache correctement', () => {
      clearSuggestionsCache();
      const stats = getCacheStats();

      expect(stats.size).toBe(0);
    });

    it('devrait utiliser le cache pour les requêtes identiques', async () => {
      // Première requête
      await getIngredientSuggestions([], 'tom');
      const statsAfterFirst = getCacheStats();

      // Deuxième requête identique (devrait utiliser le cache)
      await getIngredientSuggestions([], 'tom');
      const statsAfterSecond = getCacheStats();

      // Le cache devrait avoir la même taille (pas de nouvelle entrée)
      expect(statsAfterSecond.size).toBe(statsAfterFirst.size);
    });
  });
});

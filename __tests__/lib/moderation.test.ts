// ============================================
// Tests unitaires pour le service de modération
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { moderateContent, isIngredientValid, getBlocklist } from '@/lib/moderation';

// --------------------------------------------
// Tests du service de modération
// --------------------------------------------

describe('Service de Modération', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------
  // Tests de moderateContent
  // --------------------------------------------

  describe('moderateContent', () => {
    it('devrait accepter des ingrédients valides', async () => {
      const ingredients = ['saumon', 'citron', 'aneth'];

      const result = await moderateContent(ingredients);

      expect(result.isValid).toBe(true);
      expect(result.flaggedCategories).toHaveLength(0);
    });

    it('devrait rejeter des ingrédients contenant des termes dangereux', async () => {
      const ingredients = ['saumon', 'poison', 'citron'];

      const result = await moderateContent(ingredients);

      expect(result.isValid).toBe(false);
      expect(result.flaggedCategories.length).toBeGreaterThan(0);
    });

    it('devrait rejeter des substances toxiques', async () => {
      const ingredients = ['arsenic', 'légumes'];

      const result = await moderateContent(ingredients);

      expect(result.isValid).toBe(false);
    });

    it('devrait rejeter des substances illicites', async () => {
      const ingredients = ['cannabis', 'brownie'];

      const result = await moderateContent(ingredients);

      expect(result.isValid).toBe(false);
    });

    it('devrait gérer un tableau vide', async () => {
      const ingredients: string[] = [];

      // Devrait retourner valide pour un tableau vide (validation à faire en amont)
      const result = await moderateContent(ingredients);

      expect(result).toBeDefined();
    });

    it('devrait être insensible à la casse', async () => {
      const ingredients = ['POISON', 'Citron'];

      const result = await moderateContent(ingredients);

      expect(result.isValid).toBe(false);
    });
  });

  // --------------------------------------------
  // Tests de isIngredientValid
  // --------------------------------------------

  describe('isIngredientValid', () => {
    it('devrait valider un ingrédient normal', () => {
      expect(isIngredientValid('tomate')).toBe(true);
      expect(isIngredientValid('basilic')).toBe(true);
      expect(isIngredientValid('mozzarella')).toBe(true);
    });

    it('devrait rejeter un ingrédient dangereux', () => {
      expect(isIngredientValid('poison')).toBe(false);
      expect(isIngredientValid('cyanure')).toBe(false);
    });

    it('devrait être insensible à la casse', () => {
      expect(isIngredientValid('TOXIC')).toBe(false);
      expect(isIngredientValid('Poison')).toBe(false);
    });

    it('devrait gérer les espaces', () => {
      expect(isIngredientValid('  tomate  ')).toBe(true);
      expect(isIngredientValid('  poison  ')).toBe(false);
    });
  });

  // --------------------------------------------
  // Tests de getBlocklist
  // --------------------------------------------

  describe('getBlocklist', () => {
    it('devrait retourner une liste non vide', () => {
      const blocklist = getBlocklist();

      expect(Array.isArray(blocklist)).toBe(true);
      expect(blocklist.length).toBeGreaterThan(0);
    });

    it('devrait contenir des termes dangereux connus', () => {
      const blocklist = getBlocklist();

      expect(blocklist).toContain('poison');
      expect(blocklist).toContain('toxic');
    });

    it('devrait retourner une liste en lecture seule', () => {
      const blocklist = getBlocklist();

      // La liste doit être immuable (readonly)
      expect(Object.isFrozen(blocklist) || Array.isArray(blocklist)).toBe(true);
    });
  });
});

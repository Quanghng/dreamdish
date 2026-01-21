// ============================================
// Tests de qualité des prompts
// ============================================

import { describe, it, expect } from 'vitest';
import {
  buildVisualPrompt,
  buildModerationPrompt,
  buildSuggestionPrompt,
  validatePromptOptions,
  getStyleDescription,
  getPresentationDescription,
} from '@/lib/prompts/builder';
import { styleDescriptions, presentationDescriptions } from '@/lib/prompts/templates';

// --------------------------------------------
// Tests du constructeur de prompts
// --------------------------------------------

describe('Constructeur de Prompts', () => {
  // --------------------------------------------
  // Tests de buildVisualPrompt
  // --------------------------------------------

  describe('buildVisualPrompt', () => {
    it('devrait inclure tous les ingrédients dans le prompt utilisateur', () => {
      const ingredients = ['saumon', 'asperges', 'citron'];
      const { user } = buildVisualPrompt({ ingredients });

      for (const ingredient of ingredients) {
        expect(user).toContain(ingredient);
      }
    });

    it('devrait inclure le style dans le prompt système', () => {
      const { system } = buildVisualPrompt({
        ingredients: ['poulet'],
        style: 'molecular',
      });

      // Le prompt contient la description du style (en français: "moléculaire")
      expect(system.toLowerCase()).toContain('moléculaire');
    });

    it('devrait inclure la présentation dans le prompt système', () => {
      const { system } = buildVisualPrompt({
        ingredients: ['boeuf'],
        presentation: 'minimalist',
      });

      expect(system.toLowerCase()).toContain('minimalist');
    });

    it('devrait utiliser des valeurs par défaut si style/présentation non fournis', () => {
      const { system, user } = buildVisualPrompt({
        ingredients: ['tomate'],
      });

      expect(system).toBeDefined();
      expect(user).toBeDefined();
      expect(system.length).toBeGreaterThan(0);
    });

    it('devrait inclure le contexte additionnel si fourni', () => {
      const additionalContext = 'Pour un dîner romantique';
      const { user } = buildVisualPrompt({
        ingredients: ['homard'],
        additionalContext,
      });

      expect(user).toContain(additionalContext);
    });

    it('devrait exiger le format anglais dans le prompt système', () => {
      const { system } = buildVisualPrompt({
        ingredients: ['test'],
      });

      expect(system.toLowerCase()).toContain('anglais');
    });

    it('devrait mentionner les contraintes de longueur', () => {
      const { system } = buildVisualPrompt({
        ingredients: ['test'],
      });

      // Vérifie que les limites de mots sont mentionnées
      expect(system).toMatch(/150|300/);
    });

    it('devrait lever une erreur si aucun ingrédient', () => {
      expect(() => buildVisualPrompt({ ingredients: [] })).toThrow();
    });
  });

  // --------------------------------------------
  // Tests de buildModerationPrompt
  // --------------------------------------------

  describe('buildModerationPrompt', () => {
    it('devrait inclure tous les ingrédients à vérifier', () => {
      const ingredients = ['tomate', 'basilic', 'mozzarella'];
      const prompt = buildModerationPrompt(ingredients);

      for (const ingredient of ingredients) {
        expect(prompt).toContain(ingredient);
      }
    });

    it('devrait demander une réponse JSON', () => {
      const prompt = buildModerationPrompt(['test']);

      expect(prompt.toLowerCase()).toContain('json');
    });

    it('devrait lever une erreur pour un tableau vide', () => {
      expect(() => buildModerationPrompt([])).toThrow();
    });
  });

  // --------------------------------------------
  // Tests de buildSuggestionPrompt
  // --------------------------------------------

  describe('buildSuggestionPrompt', () => {
    it('devrait inclure l\'entrée partielle', () => {
      const prompt = buildSuggestionPrompt([], 'tom');

      expect(prompt).toContain('tom');
    });

    it('devrait inclure les ingrédients existants si fournis', () => {
      const currentIngredients = ['basilic', 'mozzarella'];
      const prompt = buildSuggestionPrompt(currentIngredients, 'tom');

      expect(prompt).toContain('basilic');
      expect(prompt).toContain('mozzarella');
    });

    it('devrait demander exactement 5 suggestions', () => {
      const prompt = buildSuggestionPrompt([], 'car');

      expect(prompt).toContain('5');
    });

    it('devrait lever une erreur pour une entrée trop courte', () => {
      expect(() => buildSuggestionPrompt([], 'a')).toThrow();
    });
  });

  // --------------------------------------------
  // Tests de validatePromptOptions
  // --------------------------------------------

  describe('validatePromptOptions', () => {
    it('devrait valider des options correctes', () => {
      expect(() => validatePromptOptions({
        ingredients: ['saumon', 'citron'],
        style: 'modern',
        presentation: 'artistic',
      })).not.toThrow();
    });

    it('devrait rejeter un style invalide', () => {
      expect(() => validatePromptOptions({
        ingredients: ['test'],
        style: 'invalid' as never,
      })).toThrow();
    });

    it('devrait rejeter une présentation invalide', () => {
      expect(() => validatePromptOptions({
        ingredients: ['test'],
        presentation: 'invalid' as never,
      })).toThrow();
    });

    it('devrait rejeter plus de 15 ingrédients', () => {
      expect(() => validatePromptOptions({
        ingredients: Array(20).fill('ingredient'),
      })).toThrow();
    });

    it('devrait rejeter des ingrédients vides', () => {
      expect(() => validatePromptOptions({
        ingredients: ['tomate', '', 'basilic'],
      })).toThrow();
    });
  });

  // --------------------------------------------
  // Tests des descriptions
  // --------------------------------------------

  describe('Descriptions de styles', () => {
    it('devrait retourner une description pour chaque style', () => {
      const styles = ['modern', 'classic', 'fusion', 'molecular', 'rustic'] as const;

      for (const style of styles) {
        const description = getStyleDescription(style);
        expect(description).toBeDefined();
        expect(description.length).toBeGreaterThan(0);
      }
    });

    it('devrait retourner une description pour chaque présentation', () => {
      const presentations = ['minimalist', 'elaborate', 'artistic', 'traditional'] as const;

      for (const presentation of presentations) {
        const description = getPresentationDescription(presentation);
        expect(description).toBeDefined();
        expect(description.length).toBeGreaterThan(0);
      }
    });
  });
});

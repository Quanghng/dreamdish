// ============================================
// Tests unitaires pour le client Mistral
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateVisualPrompt,
  getRecentMetrics,
  getAverageLatency,
  getSuccessRate,
  getTokenUsage,
} from '@/lib/mistral';
import { generateTestIngredients, mockSuccessfulAIResponse } from '../setup';

// --------------------------------------------
// Tests du client Mistral
// --------------------------------------------

describe('Client Mistral', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------
  // Tests de generateVisualPrompt
  // --------------------------------------------

  describe('generateVisualPrompt', () => {
    it('devrait générer un prompt pour des ingrédients valides', async () => {
      const ingredients = generateTestIngredients(3);

      const result = await generateVisualPrompt({ ingredients });

      expect(result).toBeDefined();
      expect(result.prompt).toBeDefined();
      expect(typeof result.prompt).toBe('string');
      expect(result.prompt.length).toBeGreaterThan(0);
      expect(result.model).toBeDefined();
      expect(result.tokensUsed).toBeGreaterThanOrEqual(0);
      expect(result.generatedAt).toBeDefined();
    });

    it('devrait inclure le style culinaire dans la génération', async () => {
      const ingredients = generateTestIngredients(2);

      const result = await generateVisualPrompt({
        ingredients,
        style: 'molecular',
      });

      expect(result).toBeDefined();
      expect(result.prompt).toBeDefined();
    });

    it('devrait inclure le style de présentation dans la génération', async () => {
      const ingredients = generateTestIngredients(2);

      const result = await generateVisualPrompt({
        ingredients,
        presentation: 'minimalist',
      });

      expect(result).toBeDefined();
      expect(result.prompt).toBeDefined();
    });

    it('devrait accepter un contexte additionnel', async () => {
      const ingredients = generateTestIngredients(2);

      const result = await generateVisualPrompt({
        ingredients,
        additionalContext: 'Pour un dîner romantique aux chandelles',
      });

      expect(result).toBeDefined();
      expect(result.prompt).toBeDefined();
    });
  });

  // --------------------------------------------
  // Tests des métriques
  // --------------------------------------------

  describe('Métriques', () => {
    it('devrait retourner les métriques récentes', () => {
      const metrics = getRecentMetrics(10);

      expect(Array.isArray(metrics)).toBe(true);
    });

    it('devrait calculer la latence moyenne', () => {
      const latency = getAverageLatency();

      expect(typeof latency).toBe('number');
      expect(latency).toBeGreaterThanOrEqual(0);
    });

    it('devrait calculer le taux de succès', () => {
      const successRate = getSuccessRate();

      expect(typeof successRate).toBe('number');
      expect(successRate).toBeGreaterThanOrEqual(0);
      expect(successRate).toBeLessThanOrEqual(1);
    });

    it('devrait retourner l\'utilisation des tokens', () => {
      const tokenUsage = getTokenUsage();

      expect(tokenUsage).toBeDefined();
      expect(typeof tokenUsage.total).toBe('number');
      expect(typeof tokenUsage.average).toBe('number');
    });

    it('devrait filtrer les métriques par opération', () => {
      const latency = getAverageLatency('generateVisualPrompt');
      const successRate = getSuccessRate('generateVisualPrompt');

      expect(typeof latency).toBe('number');
      expect(typeof successRate).toBe('number');
    });
  });
});

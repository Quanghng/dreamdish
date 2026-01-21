// ============================================
// Tests d'intégration pour l'API /api/generate
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/generate/route';
import { NextRequest } from 'next/server';

// --------------------------------------------
// Helper pour créer des requêtes de test
// --------------------------------------------

function createRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

// --------------------------------------------
// Tests de la route POST /api/generate
// --------------------------------------------

describe('POST /api/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------
  // Tests de validation
  // --------------------------------------------

  describe('Validation des entrées', () => {
    it('devrait retourner 400 si ingredients est manquant', async () => {
      const request = createRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('ingredients');
    });

    it('devrait retourner 400 si ingredients est un tableau vide', async () => {
      const request = createRequest({ ingredients: [] });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('devrait retourner 400 si ingredients n\'est pas un tableau', async () => {
      const request = createRequest({ ingredients: 'saumon' });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('devrait retourner 400 si trop d\'ingrédients (>15)', async () => {
      const ingredients = Array(20).fill('ingredient');
      const request = createRequest({ ingredients });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('15');
    });

    it('devrait retourner 400 pour un style invalide', async () => {
      const request = createRequest({
        ingredients: ['saumon'],
        style: 'invalid_style',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('devrait retourner 400 pour une présentation invalide', async () => {
      const request = createRequest({
        ingredients: ['saumon'],
        presentation: 'invalid_presentation',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  // --------------------------------------------
  // Tests de succès
  // --------------------------------------------

  describe('Génération réussie', () => {
    it('devrait retourner 200 pour une requête valide', async () => {
      const request = createRequest({
        ingredients: ['saumon', 'citron', 'aneth'],
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('devrait retourner un prompt dans la réponse', async () => {
      const request = createRequest({
        ingredients: ['saumon', 'citron'],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.prompt).toBeDefined();
      expect(typeof data.prompt).toBe('string');
    });

    it('devrait inclure les métadonnées dans la réponse', async () => {
      const request = createRequest({
        ingredients: ['poulet', 'thym'],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.model).toBeDefined();
      expect(data.tokensUsed).toBeDefined();
      expect(data.generatedAt).toBeDefined();
    });

    it('devrait accepter les paramètres optionnels', async () => {
      const request = createRequest({
        ingredients: ['boeuf', 'champignons'],
        style: 'classic',
        presentation: 'elaborate',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  // --------------------------------------------
  // Tests des headers de réponse
  // --------------------------------------------

  describe('Headers de réponse', () => {
    it('devrait inclure le header X-Model-Used', async () => {
      const request = createRequest({
        ingredients: ['tomate', 'basilic'],
      });

      const response = await POST(request);

      expect(response.headers.get('X-Model-Used')).toBeDefined();
    });

    it('devrait inclure le header X-Tokens-Used', async () => {
      const request = createRequest({
        ingredients: ['tomate', 'basilic'],
      });

      const response = await POST(request);

      expect(response.headers.get('X-Tokens-Used')).toBeDefined();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/generate/route';
import { NextRequest } from 'next/server';

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

const hasMistralKey = Boolean(process.env.MISTRAL_API_KEY);

const describeIf = hasMistralKey ? describe : describe.skip;

describeIf('POST /api/generate (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation des entrées', () => {
    it('devrait retourner 400 si ingredients est manquant', async () => {
      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toContain('ingrédient');
    });

    it('devrait retourner 400 si ingredients est un tableau vide', async () => {
      const request = createRequest({ ingredients: [] });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

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
        ingredients: ['tomate', 'basilic'],
      });
      const response = await POST(request);
      const data = await response.json();
      expect(typeof data.prompt).toBe('string');
      expect(data.prompt.length).toBeGreaterThan(0);
    });
  });
});

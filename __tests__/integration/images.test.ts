import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/images/route';
import { NextRequest } from 'next/server';

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

const hasMistralKey = Boolean(process.env.MISTRAL_API_KEY);
const hasImageKey = Boolean(process.env.GOOGLE_AI_API_KEY || process.env.HUGGINGFACE_API_KEY);

const describeIf = hasMistralKey && hasImageKey ? describe : describe.skip;

describeIf('POST /api/images (integration)', () => {
  it('devrait générer une image et un prompt', async () => {
    const request = createRequest({
      ingredients: ['tomate', 'basilic', 'mozzarella'],
      style: 'moderne et artistique',
      presentation: 'élégante',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(typeof data.prompt).toBe('string');
    expect(data.prompt.length).toBeGreaterThan(0);
    expect(typeof data.imageUrl).toBe('string');
    expect(data.imageUrl.startsWith('data:image')).toBe(true);
  });
});

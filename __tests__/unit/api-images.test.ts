import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/images/route';

const mockGenerateImage = vi.fn();
const mockGenerateVisualPrompt = vi.fn();
const mockModerateContent = vi.fn();
const mockIsImageGenerationAvailable = vi.fn();

vi.mock('@/lib/image-generation', () => ({
  generateImage: (...args: unknown[]) => mockGenerateImage(...args),
  isImageGenerationAvailable: () => mockIsImageGenerationAvailable(),
}));

vi.mock('@/lib/mistral', () => ({
  generateVisualPrompt: (...args: unknown[]) => mockGenerateVisualPrompt(...args),
}));

vi.mock('@/lib/moderation', () => ({
  moderateContent: (...args: unknown[]) => mockModerateContent(...args),
}));

vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/utils')>('@/lib/utils');
  return {
    ...actual,
    aiRateLimiter: {
      check: () => ({
        allowed: true,
        resetAt: Date.now() + 1000,
        remaining: 9,
      }),
    },
  };
});

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/images (unit)', () => {
  beforeEach(() => {
    mockGenerateImage.mockReset();
    mockGenerateVisualPrompt.mockReset();
    mockModerateContent.mockReset();
    mockIsImageGenerationAvailable.mockReset();
  });

  it('returns 503 when image generation is unavailable', async () => {
    mockIsImageGenerationAvailable.mockReturnValue(false);
    const response = await POST(createRequest({ ingredients: ['tomate'] }));
    expect(response.status).toBe(503);
  });

  it('returns 400 for invalid ingredients', async () => {
    mockIsImageGenerationAvailable.mockReturnValue(true);
    const response = await POST(createRequest({ ingredients: [] }));
    expect(response.status).toBe(400);
  });

  it('returns 200 with image and prompt for a valid request', async () => {
    mockIsImageGenerationAvailable.mockReturnValue(true);
    mockModerateContent.mockResolvedValue({ isValid: true, flaggedCategories: [] });
    mockGenerateVisualPrompt.mockResolvedValue({
      prompt: 'test prompt',
      model: 'mock-model',
      tokensUsed: 42,
    });
    mockGenerateImage.mockResolvedValue({
      imageUrl: 'data:image/png;base64,abc',
      prompt: 'test prompt',
      generatedAt: '2025-01-01T00:00:00.000Z',
    });

    const response = await POST(createRequest({ ingredients: ['tomate', 'basilic'] }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.prompt).toBe('test prompt');
    expect(data.imageUrl).toContain('data:image/png;base64');
    expect(data.model).toBe('mock-model');
  });
});

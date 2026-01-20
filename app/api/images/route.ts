// ============================================
// API Route: Génération d'images
// Route: POST /api/images
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateImage, isImageGenerationAvailable } from '@/lib/image-generation';
import { generateVisualPrompt } from '@/lib/mistral';
import { moderateContent } from '@/lib/moderation';
import { withRetry, validateIngredients, aiRateLimiter } from '@/lib/utils';
import { mistralConfig } from '@/config/mistral.config';
import { isAIError, getUserFriendlyMessage } from '@/lib/errors';
import type { GenerateFullRequest, GenerateFullResponse } from '@/types';

// --------------------------------------------
// Handler POST pour la génération d'images
// --------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Vérification de la disponibilité du service
    if (!isImageGenerationAvailable()) {
      return NextResponse.json(
        {
          error: 'Service de génération d\'images non configuré',
          details: 'La clé API Hugging Face est manquante. Ajoutez HUGGINGFACE_API_KEY dans .env.local (gratuit sur https://huggingface.co/settings/tokens)',
        },
        { status: 503 }
      );
    }

    // 2. Vérification du rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = aiRateLimiter.check(`images:${clientIp}`);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Trop de requêtes. Veuillez patienter.',
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // 3. Parsing et validation du body
    const body = await request.json();
    const validationError = validateRequest(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { ingredients, style, presentation } = body as GenerateFullRequest;

    // 4. Modération du contenu (si activée)
    if (mistralConfig.features.enableModeration) {
      const moderationResult = await moderateContent(ingredients);

      if (!moderationResult.isValid) {
        return NextResponse.json(
          {
            error: 'Contenu non autorisé détecté',
            flaggedCategories: moderationResult.flaggedCategories,
          },
          { status: 422 }
        );
      }
    }

    // 5. Génération du prompt via Mistral
    console.log('[API Images] Génération du prompt pour:', ingredients);
    const promptResult = await withRetry(() =>
      generateVisualPrompt({ ingredients, style, presentation })
    );

    console.log('[API Images] Prompt généré:', promptResult.prompt.substring(0, 100) + '...');

    // 6. Génération de l'image via Hugging Face
    console.log('[API Images] Démarrage de la génération d\'image avec Hugging Face...');
    const imageResult = await generateImage(promptResult.prompt);

    // 7. Retour de la réponse complète
    const response: GenerateFullResponse = {
      prompt: promptResult.prompt,
      imageUrl: imageResult.imageUrl,
      model: promptResult.model,
      tokensUsed: promptResult.tokensUsed,
      generatedAt: imageResult.generatedAt,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (err) {
    console.error('[API Images] Erreur:', err);

    if (isAIError(err)) {
      return NextResponse.json(
        {
          error: getUserFriendlyMessage(err),
          code: err.code,
        },
        { status: 500 }
      );
    }

    // Cast to unknown first to allow instanceof check
    const error = err as unknown;
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

    return NextResponse.json(
      {
        error: 'Erreur lors de la génération de l\'image',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------
// Validation de la requête
// --------------------------------------------

function validateRequest(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Le corps de la requête doit être un objet JSON';
  }

  const { ingredients } = body as Record<string, unknown>;
  return validateIngredients(ingredients);
}

// --------------------------------------------
// Handler GET pour vérifier le statut
// --------------------------------------------

export async function GET() {
  return NextResponse.json({
    available: isImageGenerationAvailable(),
    provider: 'google-gemini',
    model: 'imagen-3 / gemini-2.0-flash',
  });
}

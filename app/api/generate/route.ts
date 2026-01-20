// ============================================
// API Route: Génération de prompt visuel
// Route: POST /api/generate
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateVisualPrompt } from '@/lib/mistral';
import { moderateContent } from '@/lib/moderation';
import { withRetry, validateIngredients, aiRateLimiter } from '@/lib/utils';
import { mistralConfig } from '@/config/mistral.config';
import { isAIError, getUserFriendlyMessage } from '@/lib/errors';
import type { GeneratePromptRequest, GeneratePromptResponse } from '@/types';

// --------------------------------------------
// Handler POST pour la génération de prompt
// --------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Vérification du rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = aiRateLimiter.check(clientIp);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Trop de requêtes. Veuillez patienter.',
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          },
        }
      );
    }

    // 2. Parsing et validation du body
    const body = await request.json();
    const validationError = validateRequest(body);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const { ingredients, style, presentation, additionalContext } = body as GeneratePromptRequest;

    // 3. Modération du contenu (si activée)
    if (mistralConfig.features.enableModeration) {
      const moderationResult = await moderateContent(ingredients);

      if (!moderationResult.isValid) {
        return NextResponse.json(
          {
            error: 'Contenu non autorisé détecté',
            flaggedCategories: moderationResult.flaggedCategories,
            reason: moderationResult.reason,
          },
          { status: 422 }
        );
      }
    }

    // 4. Génération du prompt avec retry automatique
    const result = await withRetry(() =>
      generateVisualPrompt({
        ingredients,
        style,
        presentation,
        additionalContext,
      })
    );

    // 5. Retour de la réponse avec headers informatifs
    return NextResponse.json(result as GeneratePromptResponse, {
      status: 200,
      headers: {
        'X-Model-Used': result.model,
        'X-Tokens-Used': String(result.tokensUsed),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      },
    });

  } catch (error) {
    console.error('[API Generate] Erreur:', error);

    // Gestion des erreurs AI standardisées
    if (isAIError(error)) {
      const statusCode = error.code === 'RATE_LIMITED' ? 429 : 500;
      return NextResponse.json(
        {
          error: getUserFriendlyMessage(error),
          code: error.code,
          retryable: error.retryable,
        },
        { status: statusCode }
      );
    }

    // Erreur générique
    return NextResponse.json(
      {
        error: 'Une erreur est survenue lors de la génération du prompt',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------
// Validation de la requête
// --------------------------------------------

/**
 * Valide le corps de la requête
 * @returns Message d'erreur ou null si valide
 */
function validateRequest(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Le corps de la requête doit être un objet JSON';
  }

  const { ingredients, style, presentation } = body as Record<string, unknown>;

  // Validation des ingrédients
  const ingredientsError = validateIngredients(ingredients);
  if (ingredientsError) {
    return ingredientsError;
  }

  // Validation du style (optionnel)
  const validStyles = ['modern', 'classic', 'fusion', 'molecular', 'rustic'];
  if (style && !validStyles.includes(style as string)) {
    return `Style invalide. Valeurs acceptées: ${validStyles.join(', ')}`;
  }

  // Validation de la présentation (optionnel)
  const validPresentations = ['minimalist', 'elaborate', 'artistic', 'traditional'];
  if (presentation && !validPresentations.includes(presentation as string)) {
    return `Présentation invalide. Valeurs acceptées: ${validPresentations.join(', ')}`;
  }

  return null;
}

// --------------------------------------------
// Handler OPTIONS pour CORS (si nécessaire)
// --------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

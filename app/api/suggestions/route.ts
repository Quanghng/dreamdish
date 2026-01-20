// ============================================
// API Route: Suggestions d'ingrédients en temps réel
// Route: POST /api/suggestions
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getIngredientSuggestions, getLocalSuggestions } from '@/lib/suggestions';
import { mistralConfig } from '@/config/mistral.config';
import { aiRateLimiter } from '@/lib/utils';
import type { SuggestionRequest, SuggestionResponse } from '@/types';

// --------------------------------------------
// Handler POST pour les suggestions
// --------------------------------------------

export async function POST(request: NextRequest) {
  // Vérification si la fonctionnalité est activée
  if (!mistralConfig.features.enableSuggestions) {
    // Fallback sur les suggestions locales si désactivé
    try {
      const body = await request.json() as SuggestionRequest;
      const { partialInput } = body;

      const suggestions = getLocalSuggestions(partialInput || '');
      return NextResponse.json({ suggestions } as SuggestionResponse);
    } catch {
      return NextResponse.json({ suggestions: [] } as SuggestionResponse);
    }
  }

  try {
    // Rate limiting (plus permissif que pour la génération)
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = aiRateLimiter.check(`suggestions:${clientIp}`);

    if (!rateLimitResult.allowed) {
      // Pour les suggestions, on retourne un tableau vide plutôt qu'une erreur
      return NextResponse.json({ suggestions: [] } as SuggestionResponse);
    }

    // Parsing du body
    const body = await request.json() as SuggestionRequest;
    const { currentIngredients = [], partialInput } = body;

    // Validation de l'entrée
    if (!partialInput || partialInput.trim().length < 2) {
      return NextResponse.json({ suggestions: [] } as SuggestionResponse);
    }

    // Obtention des suggestions via le service
    const result = await getIngredientSuggestions(currentIngredients, partialInput);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300', // Cache côté client de 5 minutes
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      },
    });

  } catch (error) {
    console.error('[API Suggestions] Erreur:', error);

    // En cas d'erreur, on retourne un tableau vide (fail gracefully)
    return NextResponse.json({ suggestions: [] } as SuggestionResponse);
  }
}

// --------------------------------------------
// Handler GET pour les suggestions (alternative)
// --------------------------------------------

export async function GET(request: NextRequest) {
  // Extraction des paramètres de l'URL
  const searchParams = request.nextUrl.searchParams;
  const partialInput = searchParams.get('q') || '';
  const currentIngredients = searchParams.get('current')?.split(',').filter(Boolean) || [];

  // Vérification de la fonctionnalité
  if (!mistralConfig.features.enableSuggestions) {
    const suggestions = getLocalSuggestions(partialInput);
    return NextResponse.json({ suggestions } as SuggestionResponse);
  }

  // Validation
  if (partialInput.length < 2) {
    return NextResponse.json({ suggestions: [] } as SuggestionResponse);
  }

  try {
    const result = await getIngredientSuggestions(currentIngredients, partialInput);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    console.error('[API Suggestions GET] Erreur:', error);
    return NextResponse.json({ suggestions: [] } as SuggestionResponse);
  }
}

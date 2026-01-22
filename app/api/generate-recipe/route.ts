// ============================================
// API Route: Génération de recettes via Vision AI
// Route: POST /api/generate-recipe
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { mistralClient } from '@/lib/mistral';
import { mistralConfig } from '@/config/mistral.config';
import { aiRateLimiter } from '@/lib/utils';
import type {
  GenerateRecipeRequest,
  GenerateRecipeResponse,
  GeneratedRecipe,
  NutritionalInfo,
  DrinkPairing,
  FilterSelection
} from '@/types';

function formatFilterConstraints(filters?: FilterSelection): string {
  if (!filters) return '';

  const parts: string[] = [];
  if (filters.type) parts.push(`Type de plat: ${filters.type}`);
  if (filters.style) parts.push(`Style de cuisine: ${filters.style}`);
  if (filters.cuisson) parts.push(`Température/cuisson: ${filters.cuisson}`);
  if (filters.regime) parts.push(`Régime: ${filters.regime}`);
  if (filters.category) parts.push(`Catégorie: ${filters.category}`);

  return parts.length > 0 ? parts.join(' | ') : '';
}

// --------------------------------------------
// System Prompt pour la génération de recettes
// --------------------------------------------

const RECIPE_SYSTEM_PROMPT = `Tu es un chef cuisinier visionnaire de renommée mondiale, expert en création de recettes avant-gardistes et jamais vues auparavant. Tu combines l'audace de Ferran Adrià, la précision de Thomas Keller et la créativité de René Redzepi.

MISSION: Analyse l'image du plat fournie et crée une recette COMPLÈTEMENT ORIGINALE et JAMAIS RÉALISÉE AUPARAVANT qui correspond visuellement à ce que tu vois. Cette recette doit être innovante, surprenante et réalisable.

RÈGLES STRICTES:
1. La recette DOIT utiliser les ingrédients originaux fournis par l'utilisateur comme base
2. Tu peux ajouter des ingrédients de base de cuisine (sel, poivre, huile, herbes communes, etc.)
3. La recette doit être UNIQUE - imagine des combinaisons de saveurs inattendues
4. Chaque étape doit être détaillée et précise avec des temps de cuisson exacts
5. Le guide de dressage doit correspondre à la présentation visible dans l'image

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict):
{
  "recipe": {
    "title": "Nom créatif et évocateur du plat",
    "description": "Description poétique en 2-3 phrases qui fait saliver",
    "prepTime": <nombre en minutes>,
    "cookTime": <nombre en minutes>,
    "servings": <nombre de portions>,
    "difficulty": "facile" | "moyen" | "difficile" | "expert",
    "ingredients": [
      {
        "name": "nom de l'ingrédient",
        "quantity": "quantité",
        "unit": "unité (g, ml, pièce, etc.)",
        "isOriginal": true/false,
        "category": "principal" | "condiment" | "épice" | "garniture" | "sauce"
      }
    ],
    "instructions": [
      {
        "stepNumber": 1,
        "title": "Titre court de l'étape",
        "instruction": "Description détaillée de l'étape",
        "duration": <durée en minutes ou null>,
        "tips": "Conseil de chef optionnel"
      }
    ],
    "platingGuide": "Description détaillée du dressage pour reproduire la présentation de l'image",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "nutritionalInfo": {
    "calories": <nombre>,
    "protein": <grammes>,
    "carbohydrates": <grammes>,
    "fat": <grammes>,
    "fiber": <grammes>,
    "sodium": <mg>,
    "disclaimer": "Estimation basée sur les ingrédients standards. Valeurs approximatives."
  },
  "drinkPairings": [
    {
      "type": "vin" | "bière" | "cocktail" | "sans-alcool",
      "name": "Nom de la boisson",
      "description": "Description de la boisson",
      "reason": "Pourquoi cet accord fonctionne",
      "alternatives": ["alternative1", "alternative2"]
    }
  ]
}

IMPORTANT: 
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après
- Si tu ne peux pas identifier le plat dans l'image, retourne un objet avec "error": "description du problème"
- Sois CRÉATIF et AUDACIEUX dans tes propositions tout en restant réaliste`;

// --------------------------------------------
// Handler POST pour la génération de recettes
// --------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Vérification du rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = aiRateLimiter.check(`recipe:${clientIp}`);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Trop de requêtes. Veuillez patienter.',
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // 2. Parsing et validation du body
    const body: GenerateRecipeRequest = await request.json();
    const { imageUrl, originalIngredients, imageBase64, filters, additionalContext } = body;

    // Validation
    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Une URL d\'image ou une image en base64 est requise' },
        { status: 400 }
      );
    }

    if (!originalIngredients || originalIngredients.length === 0) {
      return NextResponse.json(
        { error: 'La liste des ingrédients originaux est requise' },
        { status: 400 }
      );
    }

    // 3. Construction du message utilisateur avec l'image
    const filterConstraints = formatFilterConstraints(filters);
    const userConstraintsBlock = [
      filterConstraints ? `Contraintes (obligatoires): ${filterConstraints}` : null,
      additionalContext && additionalContext.trim() ? `Demande utilisateur (obligatoire): ${additionalContext.trim()}` : null,
    ].filter(Boolean).join('\n');

    const userMessage = `Voici l'image d'un plat généré à partir de ces ingrédients fournis par l'utilisateur: ${originalIngredients.join(', ')}.

${userConstraintsBlock ? `${userConstraintsBlock}\n` : ''}

Analyse cette image et crée une recette UNIQUE et AVANT-GARDISTE qui:
1. Utilise OBLIGATOIREMENT tous les ingrédients listés ci-dessus
2. Correspond visuellement au plat dans l'image
3. Propose des techniques culinaires innovantes
4. Inclut un accord mets-boisson original

Contraintes supplémentaires à respecter STRICTEMENT si demandées:
- Si la demande mentionne "sans huile": n'ajoute aucune huile (y compris huile d'olive) et évite les cuissons nécessitant de l'huile
- Si la demande mentionne "sans gluten": n'ajoute aucun ingrédient contenant du gluten (blé, orge, seigle) et évite la contamination croisée
- Si la demande mentionne "sans lactose": évite les produits laitiers (lait, crème, beurre, fromages) et propose des alternatives

Sois créatif et audacieux!`;

    // 4. Préparation du contenu multimodal
    const imageContent = imageBase64
      ? { type: 'image_url' as const, imageUrl: { url: `data:image/jpeg;base64,${imageBase64}` } }
      : { type: 'image_url' as const, imageUrl: { url: imageUrl } };

    console.log('[API Recipe] Génération de recette pour:', originalIngredients);
    console.log('[API Recipe] Utilisation du modèle:', mistralConfig.models.vision);

    // 5. Appel à l'API Mistral avec le modèle vision (Pixtral)
    const response = await mistralClient.chat.complete({
      model: mistralConfig.models.vision,
      messages: [
        { role: 'system', content: RECIPE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: userMessage },
            imageContent
          ]
        },
      ],
      temperature: mistralConfig.recipeGeneration.temperature,
      maxTokens: mistralConfig.recipeGeneration.maxTokens,
      responseFormat: { type: 'json_object' },
    });

    // 6. Extraction et parsing de la réponse
    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Aucune réponse générée par le modèle');
    }

    const contentText = typeof content === 'string'
      ? content
      : content
          .map((chunk: unknown) => {
            if (chunk && typeof chunk === 'object' && 'text' in chunk) {
              return String((chunk as { text?: string }).text || '');
            }
            return '';
          })
          .join('');

    let parsedResponse: { error?: string } & Record<string, unknown>;
    try {
      parsedResponse = JSON.parse(contentText) as { error?: string } & Record<string, unknown>;
    } catch (parseError) {
      console.error('[API Recipe] Erreur de parsing JSON:', parseError);
      console.error('[API Recipe] Contenu reçu:', contentText.substring(0, 500));
      throw new Error('Erreur lors du parsing de la recette générée');
    }

    // 7. Vérification d'erreur dans la réponse
    if (parsedResponse.error) {
      return NextResponse.json(
        {
          error: 'Impossible d\'analyser l\'image',
          details: parsedResponse.error
        },
        { status: 422 }
      );
    }

    const recipe = parsedResponse.recipe as { title?: string } | undefined;

    // 8. Validation de la structure de la réponse
    if (!recipe?.title) {
      throw new Error('Structure de recette invalide');
    }

    // 9. Construction de la réponse finale
    const recipeResponse: GenerateRecipeResponse = {
      recipe: parsedResponse.recipe as GeneratedRecipe,
      nutritionalInfo: parsedResponse.nutritionalInfo as NutritionalInfo,
      drinkPairings: parsedResponse.drinkPairings as DrinkPairing[],
      model: mistralConfig.models.vision,
      tokensUsed: response.usage?.totalTokens || 0,
      generatedAt: new Date().toISOString(),
    };

    console.log('[API Recipe] Recette générée:', recipeResponse.recipe.title);

    return NextResponse.json(recipeResponse, { status: 200 });

  } catch (err) {
    console.error('[API Recipe] Erreur:', err);

    const error = err as unknown;
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

    return NextResponse.json(
      {
        error: 'Erreur lors de la génération de la recette',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------
// Handler GET pour vérifier le statut
// --------------------------------------------

export async function GET() {
  return NextResponse.json({
    available: !!process.env.MISTRAL_API_KEY,
    model: mistralConfig.models.vision,
    description: 'Vision-to-Recipe API utilisant Pixtral pour analyser les images et générer des recettes créatives',
  });
}

/**
 * API Route pour générer un prompt culinaire à partir d'ingrédients
 * Route: POST /api/generate
 */

import { NextResponse } from 'next/server';
import { mistralClient } from '@/lib/mistral';
import { mistralConfig } from '@/config/mistral.config';
import { formatIngredientsList } from '@/lib/utils';
import type { GeneratePromptRequest, GeneratePromptResponse } from '@/types';

const SYSTEM_PROMPT = "Tu es un chef expert et photographe culinaire. Ton but est de créer des descriptions visuelles alléchantes.";

export async function POST(request: Request) {
  try {
    // Parsing du body de la requête
    const body: GeneratePromptRequest = await request.json();
    const { ingredients, style = 'moderne et artistique', options } = body;

    // Validation des ingrédients
    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un ingrédient est requis' },
        { status: 400 }
      );
    }

    if (ingredients.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 ingrédients autorisés' },
        { status: 400 }
      );
    }

    // Construction du prompt utilisateur
    const ingredientsList = formatIngredientsList(ingredients);
    const userPrompt = `Crée une description visuelle ultra-détaillée pour un plat gastronomique 
original utilisant ces ingrédients : ${ingredientsList}. 
Le style de présentation doit être ${style}.`;

    // Configuration du modèle
    const model = options?.model || mistralConfig.models.promptGeneration;
    const temperature = options?.temperature ?? mistralConfig.generation.temperature;
    const maxTokens = options?.maxTokens ?? mistralConfig.generation.maxTokens;

    // Appel à l'API Mistral
    const response = await mistralClient.chat.complete({
      model: model as string,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: temperature,
      maxTokens: maxTokens,
    });

    // Extraction du contenu généré
    const generatedPrompt = response.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      throw new Error('Aucun prompt généré par le modèle');
    }

    // Conversion en string si nécessaire
    const promptText = typeof generatedPrompt === 'string'
      ? generatedPrompt
      : generatedPrompt
        .map((chunk: unknown) => {
          if (chunk && typeof chunk === 'object' && 'text' in chunk) {
            return String((chunk as { text?: string }).text || '');
          }
          return '';
        })
        .join('');

    // Construction de la réponse
    const responseData: GeneratePromptResponse = {
      prompt: promptText,
      ingredients,
      timestamp: Date.now(),
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Erreur lors de la génération du prompt:', error);

    return NextResponse.json(
      {
        error: 'Une erreur est survenue lors de la génération du prompt',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

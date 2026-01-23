// ============================================
// Service de génération d'images pour DreamDish
// Utilise Google Gemini API avec fallback Hugging Face
// ============================================

import type { GenerateImageResponse } from '@/types';

// --------------------------------------------
// Configuration
// --------------------------------------------
const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const IMAGEN_MODEL = 'gemini-2.5-flash-image';

const HUGGINGFACE_API_URL = 'https://router.huggingface.co/hf-inference';
const HUGGINGFACE_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';

// --------------------------------------------
// Génération d'images (Google Gemini avec fallback HuggingFace)
// --------------------------------------------

/**
 * Génère une image à partir d'un prompt
 * Essaie d'abord Google Gemini, puis Hugging Face en fallback
 */
export async function generateImage(
  prompt: string
): Promise<GenerateImageResponse> {
  // Enrichir et nettoyer le prompt pour de meilleurs résultats
  const cleanedPrompt = cleanPromptForImageGeneration(prompt);
  const enhancedPrompt = enhancePromptForFood(cleanedPrompt);

  console.log('[Image Generation] Prompt (100 chars):', enhancedPrompt.substring(0, 100) + '...');

  // Essayer Google Gemini d'abord
  const googleApiKey = process.env.GOOGLE_AI_API_KEY;
  if (googleApiKey) {
    try {
      console.log('[Image Generation] Tentative avec Google Gemini...');
      const imageBase64 = await callGoogleGeminiImageAPI(googleApiKey, enhancedPrompt);
      console.log('[Image Generation] Image générée avec succès via Google Gemini!');
      return {
        imageUrl: `data:image/png;base64,${imageBase64}`,
        prompt: enhancedPrompt,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.log('[Image Generation] Google Gemini échoué, tentative avec Hugging Face...');
      console.log('[Image Generation] Erreur Google:', error instanceof Error ? error.message : error);
    }
  }

  // Fallback vers Hugging Face
  const hfApiKey = process.env.HUGGINGFACE_API_KEY;
  if (hfApiKey) {
    try {
      console.log('[Image Generation] Tentative avec Hugging Face...');
      const imageBase64 = await callHuggingFaceAPI(hfApiKey, enhancedPrompt);
      console.log('[Image Generation] Image générée avec succès via Hugging Face!');
      return {
        imageUrl: `data:image/png;base64,${imageBase64}`,
        prompt: enhancedPrompt,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Image Generation] Hugging Face aussi échoué:', error);
      throw new Error('Impossible de générer l\'image. Veuillez réessayer plus tard.');
    }
  }

  throw new Error(
    'Aucune clé API configurée pour la génération d\'images. ' +
    'Ajoutez GOOGLE_AI_API_KEY ou HUGGINGFACE_API_KEY dans .env'
  );
}

/**
 * Appelle l'API Google Gemini pour générer une image
 */
async function callGoogleGeminiImageAPI(
  apiKey: string,
  prompt: string
): Promise<string> {
  console.log(`[Image Generation] Appel du modèle: ${IMAGEN_MODEL}`);

  const response = await fetch(
    `${GOOGLE_API_URL}/${IMAGEN_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate an image: ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['image', 'text'],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Google Gemini] Erreur ${response.status}:`, errorText);

    if (response.status === 429) {
      throw new Error('Quota Google Gemini dépassé. Basculement vers Hugging Face...');
    }
    if (response.status === 403) {
      throw new Error('Clé API Google non autorisée.');
    }

    throw new Error(`Erreur Google Gemini: ${response.status}`);
  }

  const data = await response.json();

  const candidates = data.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('Aucune image générée par Google Gemini.');
  }

  const parts = candidates[0].content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error('Format de réponse Google Gemini inattendu.');
  }

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return part.inlineData.data;
    }
  }

  throw new Error('Aucune image trouvée dans la réponse Google Gemini.');
}

/**
 * Appelle l'API Hugging Face Inference
 */
async function callHuggingFaceAPI(
  apiKey: string,
  prompt: string
): Promise<string> {
  console.log(`[Image Generation] Appel du modèle Hugging Face: ${HUGGINGFACE_MODEL}`);

  const response = await fetch(
    `${HUGGINGFACE_API_URL}/models/${HUGGINGFACE_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: 'blurry, bad quality, distorted, ugly, deformed, low resolution, text, watermark, signature',
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
        options: {
          wait_for_model: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Hugging Face] Erreur ${response.status}:`, errorText);

    if (response.status === 503) {
      throw new Error('Le modèle Hugging Face est en cours de chargement. Réessayez dans quelques secondes.');
    }

    throw new Error(`Erreur Hugging Face: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  return base64;
}

/**
 * Nettoie le prompt généré par Mistral pour la génération d'images
 */
function cleanPromptForImageGeneration(prompt: string): string {
  return prompt
    .replace(/\*\*[^*]+\*\*:?/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/^[-*•]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Enrichit le prompt avec des termes optimisés pour la photographie culinaire
 */
function enhancePromptForFood(prompt: string): string {
  const prefix = 'Professional food photography, gourmet dish,';
  const suffix = 'studio lighting, shallow depth of field, elegant plating, white porcelain plate, appetizing, 8k, photorealistic, food magazine cover';

  const mainPrompt = prompt.substring(0, 350);

  return `${prefix} ${mainPrompt}, ${suffix}`;
}

/**
 * Vérifie si la génération d'images est disponible
 */
export function isImageGenerationAvailable(): boolean {
  return Boolean(process.env.GOOGLE_AI_API_KEY || process.env.HUGGINGFACE_API_KEY);
}

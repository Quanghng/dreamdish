// ============================================
// Client Mistral AI pour DreamDish
// ============================================

import { Mistral } from '@mistralai/mistralai';
import { mistralConfig } from '@/config/mistral.config';
import { buildVisualPrompt } from '@/lib/prompts/builder';
import {
  handleMistralError,
  createAIError,
  ErrorCodes,
} from '@/lib/errors';
import type {
  GeneratePromptRequest,
  GeneratePromptResponse,
  CulinaryStyle,
  PresentationStyle,
  AIMetrics,
} from '@/types';

// --------------------------------------------
// Instance singleton du client Mistral
// --------------------------------------------
let mistralClient: Mistral | null = null;

/**
 * Obtient ou crée l'instance du client Mistral
 * Utilise le pattern singleton pour éviter les connexions multiples
 */
export function getMistralClient(): Mistral {
  if (!mistralClient) {
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      throw new Error(
        'La variable d\'environnement MISTRAL_API_KEY est manquante. ' +
        'Veuillez créer un fichier .env.local avec votre clé API Mistral.'
      );
    }

    mistralClient = new Mistral({ apiKey });
  }

  return mistralClient;
}

// --------------------------------------------
// Stockage des métriques en mémoire
// --------------------------------------------
const metricsStore: AIMetrics[] = [];
const MAX_METRICS = 1000;

/**
 * Enregistre les métriques d'une requête AI
 */
function logMetrics(metrics: Omit<AIMetrics, 'timestamp'>): void {
  const entry: AIMetrics = {
    ...metrics,
    timestamp: new Date().toISOString(),
  };

  metricsStore.push(entry);

  // Limite la taille du store
  if (metricsStore.length > MAX_METRICS) {
    metricsStore.shift();
  }

  // Log si activé dans la config
  if (mistralConfig.features.logRequests) {
    console.log('[AI Metrics]', JSON.stringify(entry));
  }
}

/**
 * Récupère les métriques récentes
 */
export function getRecentMetrics(count: number = 100): AIMetrics[] {
  return metricsStore.slice(-count);
}

/**
 * Calcule la latence moyenne des requêtes
 */
export function getAverageLatency(operation?: string): number {
  const filtered = operation
    ? metricsStore.filter(m => m.operation === operation)
    : metricsStore;

  if (filtered.length === 0) return 0;

  const total = filtered.reduce((sum, m) => sum + m.durationMs, 0);
  return Math.round(total / filtered.length);
}

/**
 * Calcule le taux de succès des requêtes
 */
export function getSuccessRate(operation?: string): number {
  const filtered = operation
    ? metricsStore.filter(m => m.operation === operation)
    : metricsStore;

  if (filtered.length === 0) return 1;

  const successful = filtered.filter(m => m.success).length;
  return Math.round((successful / filtered.length) * 100) / 100;
}

/**
 * Récupère les statistiques d'utilisation des tokens
 */
export function getTokenUsage(): { total: number; average: number } {
  const total = metricsStore.reduce((sum, m) => sum + m.tokensUsed, 0);
  return {
    total,
    average: metricsStore.length > 0 ? Math.round(total / metricsStore.length) : 0,
  };
}

// --------------------------------------------
// Fonction principale de génération de prompt
// --------------------------------------------

/**
 * Génère un prompt visuel à partir des ingrédients
 * @param request - Requête contenant les ingrédients et options
 * @returns Prompt généré avec métadonnées
 */
export async function generateVisualPrompt(
  request: GeneratePromptRequest
): Promise<GeneratePromptResponse> {
  const client = getMistralClient();
  const startTime = Date.now();

  // Extraction des paramètres avec valeurs par défaut
  const {
    ingredients,
    style = 'modern' as CulinaryStyle,
    presentation = 'artistic' as PresentationStyle,
    additionalContext,
  } = request;

  // Construction des prompts via le builder
  const { system, user } = buildVisualPrompt({
    ingredients,
    style,
    presentation,
    additionalContext,
  });

  try {
    // Appel à l'API Mistral
    const response = await client.chat.complete({
      model: mistralConfig.models.promptGeneration,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: mistralConfig.generation.temperature,
      maxTokens: mistralConfig.generation.maxTokens,
      topP: mistralConfig.generation.topP,
    });

    // Extraction du contenu généré
    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw createAIError(
        ErrorCodes.EMPTY_RESPONSE,
        'Aucun contenu dans la réponse de l\'AI',
        true
      );
    }

    // Conversion en string si nécessaire (gestion des différents types de contenu)
    let promptText: string;
    if (typeof content === 'string') {
      promptText = content;
    } else if (Array.isArray(content)) {
      // Extraction du texte des chunks de contenu
      promptText = content
        .filter((chunk): chunk is { type: 'text'; text: string } =>
          'type' in chunk && chunk.type === 'text' && 'text' in chunk
        )
        .map(chunk => chunk.text)
        .join('');
    } else {
      promptText = String(content);
    }

    const durationMs = Date.now() - startTime;
    const tokensUsed = response.usage?.totalTokens || 0;

    // Enregistrement des métriques
    logMetrics({
      operation: 'generateVisualPrompt',
      model: mistralConfig.models.promptGeneration,
      durationMs,
      tokensUsed,
      success: true,
    });

    return {
      prompt: promptText,
      model: mistralConfig.models.promptGeneration,
      tokensUsed,
      generatedAt: new Date().toISOString(),
    };

  } catch (error) {
    const durationMs = Date.now() - startTime;

    // Enregistrement des métriques d'erreur
    logMetrics({
      operation: 'generateVisualPrompt',
      model: mistralConfig.models.promptGeneration,
      durationMs,
      tokensUsed: 0,
      success: false,
      errorCode: error instanceof Error ? error.message : 'unknown',
    });

    // Conversion de l'erreur en format standardisé
    throw handleMistralError(error);
  }
}

// --------------------------------------------
// Fonction de vérification de la connexion
// --------------------------------------------

/**
 * Vérifie que la connexion à Mistral fonctionne
 * @returns true si la connexion est établie
 */
export async function checkMistralConnection(): Promise<boolean> {
  try {
    const client = getMistralClient();

    // Ping minimal avec le modèle le plus léger
    await client.chat.complete({
      model: mistralConfig.models.suggestions,
      messages: [{ role: 'user', content: 'ping' }],
      maxTokens: 1,
    });

    return true;
  } catch (error) {
    console.error('[Mistral] Erreur de connexion:', error);
    return false;
  }
}

// Export du type pour utilisation externe
export type { Mistral as MistralClient };

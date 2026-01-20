// ============================================
// API Route: Health Check et métriques
// Route: GET /api/health
// ============================================

import { NextResponse } from 'next/server';
import {
  checkMistralConnection,
  getRecentMetrics,
  getAverageLatency,
  getSuccessRate,
  getTokenUsage,
} from '@/lib/mistral';
import { mistralConfig } from '@/config/mistral.config';
import { getCacheStats } from '@/lib/suggestions';
import type { AIHealthStatus } from '@/types';

// --------------------------------------------
// Handler GET pour le health check
// --------------------------------------------

export async function GET() {
  const startTime = Date.now();

  // Exécution des vérifications
  const [mistralConnection] = await Promise.all([
    checkMistralConnection().catch(() => false),
  ]);

  // Vérification de la clé API
  const apiKeyValid = Boolean(process.env.MISTRAL_API_KEY);

  // Construction de l'objet de vérifications
  const checks = {
    mistralConnection,
    apiKeyValid,
    moderationEnabled: mistralConfig.features.enableModeration,
    suggestionsEnabled: mistralConfig.features.enableSuggestions,
  };

  // Récupération des métriques
  const tokenUsage = getTokenUsage();
  const recentMetrics = getRecentMetrics(10);
  const cacheStats = getCacheStats();

  const metrics = {
    averageLatency: getAverageLatency(),
    successRate: getSuccessRate(),
    tokenUsage,
    recentRequests: recentMetrics.length,
    suggestionsCache: cacheStats,
  };

  // Détermination du statut global
  let status: AIHealthStatus['status'] = 'healthy';

  if (!apiKeyValid) {
    status = 'unhealthy';
  } else if (!mistralConnection) {
    status = 'degraded';
  }

  // Construction de la réponse
  const healthResponse: AIHealthStatus = {
    status,
    checks,
    metrics,
    timestamp: new Date().toISOString(),
  };

  // Code HTTP basé sur le statut
  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  return NextResponse.json(healthResponse, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  });
}

// --------------------------------------------
// Handler HEAD pour ping rapide
// --------------------------------------------

export async function HEAD() {
  const apiKeyValid = Boolean(process.env.MISTRAL_API_KEY);

  return new NextResponse(null, {
    status: apiKeyValid ? 200 : 503,
  });
}

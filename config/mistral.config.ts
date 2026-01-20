// ============================================
// Configuration Mistral AI pour DreamDish
// ============================================

/**
 * Configuration centralisée pour l'intégration Mistral AI
 * Contient les modèles, paramètres de génération, et options de fonctionnalités
 */
export const mistralConfig = {
  // --------------------------------------------
  // Sélection des modèles
  // --------------------------------------------
  models: {
    // Modèle principal pour la génération de prompts - le plus performant
    promptGeneration: process.env.MISTRAL_MODEL_LARGE || 'mistral-large-latest',

    // Modèle pour la modération de contenu (using small model, moderation-specific model doesn't exist)
    moderation: process.env.MISTRAL_MODEL_MODERATION || 'mistral-small-latest',

    // Modèle rapide pour les suggestions en temps réel
    suggestions: process.env.MISTRAL_MODEL_SMALL || 'mistral-small-latest',
  },

  // --------------------------------------------
  // Paramètres de génération (prompts visuels)
  // --------------------------------------------
  generation: {
    temperature: 0.8,        // Élevé pour plus de créativité
    maxTokens: 2048,         // Suffisant pour des prompts détaillés
    topP: 0.95,              // Échantillonnage nucleus
    presencePenalty: 0.1,    // Légère pénalité pour éviter les répétitions
    frequencyPenalty: 0.1,   // Légère pénalité sur la fréquence
  },

  // --------------------------------------------
  // Paramètres pour les suggestions (plus rapide, moins créatif)
  // --------------------------------------------
  suggestions: {
    temperature: 0.3,        // Bas pour des réponses cohérentes
    maxTokens: 256,          // Court pour la rapidité
    topP: 0.9,
  },

  // --------------------------------------------
  // Limitation de débit (rate limiting)
  // --------------------------------------------
  rateLimiting: {
    maxRequestsPerMinute: parseInt(process.env.MISTRAL_MAX_REQUESTS_PER_MINUTE || '60'),
    maxTokensPerRequest: parseInt(process.env.MISTRAL_MAX_TOKENS_PER_REQUEST || '4096'),
  },

  // --------------------------------------------
  // Configuration des tentatives de réessai
  // --------------------------------------------
  retry: {
    maxRetries: 3,              // Nombre maximum de tentatives
    initialDelayMs: 1000,       // Délai initial (1 seconde)
    maxDelayMs: 10000,          // Délai maximum (10 secondes)
    backoffMultiplier: 2,       // Multiplicateur pour le backoff exponentiel
  },

  // --------------------------------------------
  // Drapeaux de fonctionnalités (feature flags)
  // --------------------------------------------
  features: {
    enableModeration: process.env.ENABLE_MODERATION === 'true',
    enableSuggestions: process.env.ENABLE_SUGGESTIONS === 'true',
    enableImageGeneration: process.env.ENABLE_IMAGE_GENERATION === 'true',
    logRequests: process.env.LOG_AI_REQUESTS === 'true',
  },
} as const;

// --------------------------------------------
// Configuration pour la génération d'images
// --------------------------------------------
export const imageConfig = {
  // Fournisseur d'images (replicate, openai, etc.)
  provider: process.env.IMAGE_PROVIDER || 'replicate',

  // Modèle Stable Diffusion via Replicate
  replicate: {
    model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    // Paramètres par défaut pour les images
    defaults: {
      width: 768,
      height: 768,
      num_outputs: 1,
      scheduler: 'K_EULER',
      num_inference_steps: 50,
      guidance_scale: 7.5,
    },
  },
} as const;

// Type exporté pour la configuration
export type MistralConfig = typeof mistralConfig;
export type ImageConfig = typeof imageConfig;

// --------------------------------------------
// Descriptions des styles culinaires
// --------------------------------------------
export const culinaryStyleDescriptions: Record<string, string> = {
  modern: 'Présentation minimaliste contemporaine avec des techniques modernes',
  classic: 'Présentation classique française avec élégance traditionnelle',
  fusion: 'Fusion de cuisines du monde avec présentation innovante',
  molecular: 'Gastronomie moléculaire avec textures surprenantes',
  rustic: 'Style rustique raffiné avec produits du terroir',
};

// --------------------------------------------
// Descriptions des styles de présentation
// --------------------------------------------
export const presentationStyleDescriptions: Record<string, string> = {
  minimalist: 'Assiette épurée, espace négatif important, focus sur les ingrédients',
  elaborate: 'Composition complexe avec multiple éléments et garnitures',
  artistic: 'Présentation artistique abstraite, couleurs vives, formes géométriques',
  traditional: 'Disposition classique respectant les codes de la haute gastronomie',
};
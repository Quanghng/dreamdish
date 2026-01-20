/**
 * Configuration des modèles Mistral AI
 */

import { MistralModel } from '@/types';

// Configuration par défaut pour chaque modèle
export const MISTRAL_CONFIG = {
  // Modèle pour génération de prompts créatifs
  PROMPT_GENERATION: {
    model: MistralModel.LARGE,
    temperature: 0.7, // Plus de créativité
    maxTokens: 1000,
  },
  
  // Modèle pour la modération de contenu
  MODERATION: {
    model: MistralModel.MODERATION,
    temperature: 0,
    maxTokens: 100,
  },
  
  // Modèle pour suggestions rapides
  SUGGESTIONS: {
    model: MistralModel.SMALL,
    temperature: 0.5,
    maxTokens: 200,
  },
} as const;

// Prompt système pour la génération de descriptions culinaires
export const SYSTEM_PROMPT = `Tu es un chef étoilé et artiste culinaire expert. 
Ta mission est de créer des descriptions visuelles ultra-détaillées de plats gastronomiques 
à partir d'une liste d'ingrédients. 

Tes descriptions doivent être :
- Visuellement riches et évocatrices
- Modernes et artistiques dans leur présentation
- Précises sur les techniques de dressage
- Inspirantes pour la génération d'images

Format attendu : Une description narrative de 3-4 phrases maximum.`;

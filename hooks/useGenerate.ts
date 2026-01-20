// ============================================
// Hook useGenerate pour DreamDish
// Gère la génération de prompts visuels et d'images via l'API
// ============================================

import { useState, useCallback } from 'react';
import type {
  CulinaryStyle,
  PresentationStyle,
  GenerateFullResponse
} from '@/types';

interface UseGenerateOptions {
  /** Style culinaire par défaut */
  defaultStyle?: CulinaryStyle;
  /** Style de présentation par défaut */
  defaultPresentation?: PresentationStyle;
}

interface UseGenerateReturn {
  /** Résultat de la génération */
  result: GenerateFullResponse | null;
  /** État de chargement */
  isLoading: boolean;
  /** Message d'erreur éventuel */
  error: string | null;
  /** Fonction pour générer un prompt et une image */
  generate: (
    ingredients: string[],
    options?: {
      style?: CulinaryStyle;
      presentation?: PresentationStyle;
      additionalContext?: string;
    }
  ) => Promise<GenerateFullResponse | null>;
  /** Fonction pour réinitialiser l'état */
  reset: () => void;
}

/**
 * Hook pour générer des prompts visuels et des images via l'API
 * 
 * @param options - Options de configuration
 * @returns État et fonctions de génération
 */
export function useGenerate(options: UseGenerateOptions = {}): UseGenerateReturn {
  const {
    defaultStyle = 'modern',
    defaultPresentation = 'artistic'
  } = options;

  const [result, setResult] = useState<GenerateFullResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Génère un prompt visuel et une image à partir des ingrédients
   */
  const generate = useCallback(async (
    ingredients: string[],
    genOptions?: {
      style?: CulinaryStyle;
      presentation?: PresentationStyle;
      additionalContext?: string;
    }
  ): Promise<GenerateFullResponse | null> => {
    // Validation des ingrédients
    if (!ingredients || ingredients.length === 0) {
      setError('Veuillez sélectionner au moins un ingrédient');
      return null;
    }

    if (ingredients.length > 15) {
      setError('Maximum 15 ingrédients autorisés');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          style: genOptions?.style || defaultStyle,
          presentation: genOptions?.presentation || defaultPresentation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Gestion des erreurs spécifiques
        if (response.status === 429) {
          throw new Error(data.error || 'Trop de requêtes. Veuillez patienter.');
        }
        if (response.status === 422) {
          throw new Error(data.reason || 'Contenu non autorisé détecté.');
        }
        if (response.status === 503) {
          throw new Error(data.error || 'Service de génération d\'images non disponible.');
        }
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setResult(data);
      return data;
    } catch (err) {
      console.error('[useGenerate] Erreur:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [defaultStyle, defaultPresentation]);

  /**
   * Réinitialise l'état du hook
   */
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    result,
    isLoading,
    error,
    generate,
    reset,
  };
}

export default useGenerate;

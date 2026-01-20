// ============================================
// Hook useRecipe pour DreamDish
// Gère la génération de recettes via Vision AI
// ============================================

import { useState, useCallback } from 'react';
import type {
  GenerateRecipeResponse,
  GeneratedRecipe,
  NutritionalInfo,
  DrinkPairing,
  CookbookEntry
} from '@/types';

interface UseRecipeReturn {
  /** Résultat de la génération de recette */
  recipeResult: GenerateRecipeResponse | null;
  /** État de chargement */
  isLoading: boolean;
  /** Message d'erreur éventuel */
  error: string | null;
  /** Fonction pour générer une recette à partir d'une image */
  generateRecipe: (
    imageUrl: string,
    originalIngredients: string[]
  ) => Promise<GenerateRecipeResponse | null>;
  /** Fonction pour réinitialiser l'état */
  reset: () => void;
  /** Livre de recettes sauvegardé */
  cookbook: CookbookEntry[];
  /** Sauvegarder une recette dans le livre */
  saveToCoookbook: (
    recipe: GeneratedRecipe,
    imageUrl: string,
    originalIngredients: string[],
    nutritionalInfo?: NutritionalInfo,
    drinkPairings?: DrinkPairing[]
  ) => Promise<CookbookEntry>;
  /** Supprimer une recette du livre */
  removeFromCookbook: (id: string) => void;
  /** Mettre à jour les notes d'une recette */
  updateRecipeNotes: (id: string, notes: string) => void;
  /** Mettre à jour la note d'une recette */
  updateRecipeRating: (id: string, rating: number) => void;
  /** Mettre à jour la catégorie d'une recette */
  updateRecipeCategory: (id: string, category: string) => void;
  /** Basculer le favori d'une recette */
  toggleFavorite: (id: string) => void;
  /** Recharger les recettes du livre */
  fetchCookbook: () => Promise<void>;
}

/**
 * Hook pour générer des recettes à partir d'images via l'API Vision
 * Inclut la gestion du livre de recettes local
 */
export function useRecipe(): UseRecipeReturn {
  const [recipeResult, setRecipeResult] = useState<GenerateRecipeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cookbook, setCookbook] = useState<CookbookEntry[]>([]);

  const fetchCookbook = useCallback(async () => {
    const response = await fetch('/api/user/cookbook');
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    setCookbook(Array.isArray(data) ? data : []);
  }, []);

  /**
   * Génère une recette à partir d'une image et des ingrédients originaux
   */
  const generateRecipe = useCallback(async (
    imageUrl: string,
    originalIngredients: string[]
  ): Promise<GenerateRecipeResponse | null> => {
    if (!imageUrl) {
      setError('Une image est requise pour générer la recette');
      return null;
    }

    if (!originalIngredients || originalIngredients.length === 0) {
      setError('Les ingrédients originaux sont requis');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setRecipeResult(null);

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          originalIngredients,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(data.error || 'Trop de requêtes. Veuillez patienter.');
        }
        if (response.status === 422) {
          throw new Error(data.details || 'Impossible d\'analyser l\'image.');
        }
        throw new Error(data.error || 'Erreur lors de la génération de la recette');
      }

      setRecipeResult(data);
      return data;
    } catch (err) {
      console.error('[useRecipe] Erreur:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Réinitialise l'état du hook
   */
  const reset = useCallback(() => {
    setRecipeResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * Sauvegarde une recette dans le livre de recettes
   */
  const saveToCoookbook = useCallback(async (
    recipe: GeneratedRecipe,
    imageUrl: string,
    originalIngredients: string[],
    nutritionalInfo?: NutritionalInfo,
    drinkPairings?: DrinkPairing[]
  ): Promise<CookbookEntry> => {
    const response = await fetch('/api/user/cookbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipe,
        imageUrl,
        originalIngredients,
        nutritionalInfo,
        drinkPairings,
      }),
    });

    if (!response.ok) {
      throw new Error('Impossible de sauvegarder la recette.');
    }
    const entry = await response.json();
    await fetchCookbook();
    return entry as CookbookEntry;
  }, [fetchCookbook]);

  /**
   * Supprime une recette du livre
   */
  const removeFromCookbook = useCallback(async (id: string) => {
    await fetch(`/api/user/cookbook/${id}`, { method: 'DELETE' });
    await fetchCookbook();
  }, [fetchCookbook]);

  /**
   * Met à jour les notes d'une recette
   */
  const updateRecipeNotes = useCallback(async (id: string, notes: string) => {
    await fetch(`/api/user/cookbook/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    await fetchCookbook();
  }, [fetchCookbook]);

  /**
   * Met à jour la note d'une recette (1-5 étoiles)
   */
  const updateRecipeRating = useCallback(async (id: string, rating: number) => {
    await fetch(`/api/user/cookbook/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: Math.min(5, Math.max(1, rating)) }),
    });
    await fetchCookbook();
  }, [fetchCookbook]);

  /**
   * Met à jour la catégorie d'une recette
   */
  const updateRecipeCategory = useCallback(async (id: string, category: string) => {
    await fetch(`/api/user/cookbook/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });
    await fetchCookbook();
  }, [fetchCookbook]);

  /**
   * Bascule le statut favori d'une recette
   */
  const toggleFavorite = useCallback(async (id: string) => {
    const entry = cookbook.find(item => item.id === id);
    await fetch(`/api/user/cookbook/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: !(entry?.isFavorite ?? false) }),
    });
    await fetchCookbook();
  }, [cookbook, fetchCookbook]);

  return {
    recipeResult,
    isLoading,
    error,
    generateRecipe,
    reset,
    cookbook,
    saveToCoookbook,
    removeFromCookbook,
    updateRecipeNotes,
    updateRecipeRating,
    updateRecipeCategory,
    toggleFavorite,
    fetchCookbook,
  };
}

export default useRecipe;

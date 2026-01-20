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

// Clé de stockage local pour le livre de recettes
const COOKBOOK_STORAGE_KEY = 'dreamdish_cookbook';

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
  ) => CookbookEntry;
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
}

/**
 * Hook pour générer des recettes à partir d'images via l'API Vision
 * Inclut la gestion du livre de recettes local
 */
export function useRecipe(): UseRecipeReturn {
  const [recipeResult, setRecipeResult] = useState<GenerateRecipeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cookbook, setCookbook] = useState<CookbookEntry[]>(() => {
    // Charger le livre de recettes depuis le localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(COOKBOOK_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  /**
   * Sauvegarde le livre de recettes dans le localStorage
   */
  const saveCookbook = useCallback((entries: CookbookEntry[]) => {
    setCookbook(entries);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKBOOK_STORAGE_KEY, JSON.stringify(entries));
    }
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
  const saveToCoookbook = useCallback((
    recipe: GeneratedRecipe,
    imageUrl: string,
    originalIngredients: string[],
    nutritionalInfo?: NutritionalInfo,
    drinkPairings?: DrinkPairing[]
  ): CookbookEntry => {
    const entry: CookbookEntry = {
      id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipe,
      imageUrl,
      originalIngredients,
      nutritionalInfo,
      drinkPairings,
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };

    const newCookbook = [entry, ...cookbook];
    saveCookbook(newCookbook);
    return entry;
  }, [cookbook, saveCookbook]);

  /**
   * Supprime une recette du livre
   */
  const removeFromCookbook = useCallback((id: string) => {
    const newCookbook = cookbook.filter(entry => entry.id !== id);
    saveCookbook(newCookbook);
  }, [cookbook, saveCookbook]);

  /**
   * Met à jour les notes d'une recette
   */
  const updateRecipeNotes = useCallback((id: string, notes: string) => {
    const newCookbook = cookbook.map(entry =>
      entry.id === id ? { ...entry, notes } : entry
    );
    saveCookbook(newCookbook);
  }, [cookbook, saveCookbook]);

  /**
   * Met à jour la note d'une recette (1-5 étoiles)
   */
  const updateRecipeRating = useCallback((id: string, rating: number) => {
    const newCookbook = cookbook.map(entry =>
      entry.id === id ? { ...entry, rating: Math.min(5, Math.max(1, rating)) } : entry
    );
    saveCookbook(newCookbook);
  }, [cookbook, saveCookbook]);

  /**
   * Met à jour la catégorie d'une recette
   */
  const updateRecipeCategory = useCallback((id: string, category: string) => {
    const newCookbook = cookbook.map(entry =>
      entry.id === id ? { ...entry, category } : entry
    );
    saveCookbook(newCookbook);
  }, [cookbook, saveCookbook]);

  /**
   * Bascule le statut favori d'une recette
   */
  const toggleFavorite = useCallback((id: string) => {
    const newCookbook = cookbook.map(entry =>
      entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
    );
    saveCookbook(newCookbook);
  }, [cookbook, saveCookbook]);

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
  };
}

export default useRecipe;

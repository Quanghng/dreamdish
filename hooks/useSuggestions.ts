// ============================================
// Hook useSuggestions pour DreamDish
// Gère les suggestions d'ingrédients en temps réel
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface UseSuggestionsOptions {
  /** Délai de debounce en ms (défaut: 300) */
  debounceDelay?: number;
  /** Nombre minimum de caractères pour déclencher la recherche */
  minChars?: number;
}

interface UseSuggestionsReturn {
  /** Liste des suggestions */
  suggestions: string[];
  /** État de chargement */
  isLoading: boolean;
  /** Message d'erreur éventuel */
  error: string | null;
  /** Fonction pour vider les suggestions */
  clearSuggestions: () => void;
}

/**
 * Hook pour obtenir des suggestions d'ingrédients en temps réel
 * 
 * @param partialInput - Texte partiel entré par l'utilisateur
 * @param currentIngredients - Ingrédients déjà sélectionnés
 * @param options - Options de configuration
 * @returns Suggestions et état
 */
export function useSuggestions(
  partialInput: string,
  currentIngredients: string[] = [],
  options: UseSuggestionsOptions = {}
): UseSuggestionsReturn {
  const { debounceDelay = 300, minChars = 2 } = options;

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce de l'input pour éviter trop d'appels API
  const debouncedInput = useDebounce(partialInput, debounceDelay);

  // Use a ref to store currentIngredients to avoid re-creating the callback
  const currentIngredientsRef = useRef(currentIngredients);
  currentIngredientsRef.current = currentIngredients;

  // Stable serialized version of ingredients for dependency comparison
  const ingredientsKey = JSON.stringify(currentIngredients);

  // Fonction pour récupérer les suggestions
  const fetchSuggestions = useCallback(async () => {
    // Ne pas chercher si l'input est trop court
    if (!debouncedInput || debouncedInput.trim().length < minChars) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentIngredients: currentIngredientsRef.current,
          partialInput: debouncedInput.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('[useSuggestions] Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedInput, ingredientsKey, minChars]);

  // Effet pour déclencher la recherche
  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Fonction pour vider les suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    clearSuggestions,
  };
}

export default useSuggestions;

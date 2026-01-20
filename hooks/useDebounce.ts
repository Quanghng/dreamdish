// ============================================
// Hook useDebounce pour DreamDish
// Retarde l'exécution d'une valeur pour optimiser les appels API
// ============================================

import { useState, useEffect } from 'react';

/**
 * Hook qui retarde la mise à jour d'une valeur
 * Utile pour éviter les appels API excessifs lors de la saisie
 * 
 * @param value - Valeur à debouncer
 * @param delay - Délai en millisecondes (défaut: 300ms)
 * @returns Valeur debouncée
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crée un timer qui met à jour la valeur après le délai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoie le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

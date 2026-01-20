/**
 * Fonctions utilitaires pour l'application
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Combine les classes CSS avec clsx
 * Utile pour Tailwind CSS avec conditions
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formate une liste d'ingrédients en phrase
 * Ex: ["tomate", "basilic", "mozzarella"] => "tomate, basilic et mozzarella"
 */
export function formatIngredientsList(ingredients: string[]): string {
  if (ingredients.length === 0) return '';
  if (ingredients.length === 1) return ingredients[0];
  if (ingredients.length === 2) return `${ingredients[0]} et ${ingredients[1]}`;
  
  const allButLast = ingredients.slice(0, -1).join(', ');
  const last = ingredients[ingredients.length - 1];
  return `${allButLast} et ${last}`;
}

/**
 * Valide si une clé API est correctement formatée
 */
export function isValidApiKey(key: string): boolean {
  return key.length > 0 && !key.includes('votre_clé');
}

/**
 * Tronque un texte à une longueur maximale
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

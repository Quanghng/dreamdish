import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function normalizeIngredient(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function extractIngredientNames(originalIngredients: unknown, recipe: unknown): string[] {
  const names: string[] = [];

  if (Array.isArray(originalIngredients)) {
    for (const item of originalIngredients) {
      if (typeof item === 'string' && item.trim()) names.push(item.trim());
    }
  }

  if (names.length === 0 && recipe && typeof recipe === 'object' && 'ingredients' in recipe) {
    const ingredients = (recipe as { ingredients?: unknown }).ingredients;
    if (Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        if (ing && typeof ing === 'object' && 'name' in ing) {
          const n = (ing as { name?: unknown }).name;
          if (typeof n === 'string' && n.trim()) names.push(n.trim());
        }
      }
    }
  }

  return names;
}

export async function GET() {
  const sampleSize = 500;

  const recentEntries = await prisma.cookbookEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: sampleSize,
    select: {
      originalIngredients: true,
      recipe: true,
    },
  });

  const counts = new Map<string, { display: string; count: number }>();
  for (const entry of recentEntries) {
    const ingredientNames = extractIngredientNames(entry.originalIngredients, entry.recipe);
    for (const name of ingredientNames) {
      const key = normalizeIngredient(name);
      if (!key) continue;
      const current = counts.get(key);
      if (current) {
        current.count += 1;
      } else {
        counts.set(key, { display: name, count: 1 });
      }
    }
  }

  let top: { name: string; count: number } | null = null;
  for (const v of counts.values()) {
    if (!top || v.count > top.count) top = { name: v.display, count: v.count };
  }

  return NextResponse.json({
    sampleSize,
    topIngredient: top,
  });
}

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import StatsClient from './StatsClient';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

function getRecipeTitle(recipe: unknown): string {
  if (recipe && typeof recipe === 'object' && 'title' in recipe) {
    const title = (recipe as { title?: unknown }).title;
    if (typeof title === 'string' && title.trim()) return title.trim();
  }
  return 'Plat sans titre';
}

function getUserDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
}): string {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (fullName) return fullName;
  if (user.name && user.name.trim()) return user.name.trim();
  return user.email;
}

function normalizeIngredient(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slugifyIngredient(value: string, opts?: { lower?: boolean }): string {
  const lower = opts?.lower ?? true;
  const cleaned = stripDiacritics(value)
    .replace(/['’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const withHyphens = cleaned
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

  return lower ? withHyphens.toLowerCase() : withHyphens;
}

function resolveIngredientImageUrl(name: string): string | null {
  const dir = path.join(process.cwd(), 'public', 'img', 'ingredients');

  const slugLower = slugifyIngredient(name, { lower: true });
  const slugOriginalCase = slugifyIngredient(name, { lower: false });
  const slugCapitalized = slugLower ? `${slugLower[0].toUpperCase()}${slugLower.slice(1)}` : slugLower;

  const candidates = [
    `${slugLower}.webp`,
    `${slugOriginalCase}.webp`,
    `${slugCapitalized}.webp`,
  ];

  for (const file of candidates) {
    if (!file || file === '.webp') continue;
    const full = path.join(dir, file);
    if (fs.existsSync(full)) return `/img/ingredients/${file}`;
  }

  return null;
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

function buildSeedIngredients(entry: { originalIngredients: unknown; recipe: unknown }): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  const push = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(cleaned);
  };

  // Priorité aux ingrédients originaux (base user)
  if (Array.isArray(entry.originalIngredients)) {
    for (const item of entry.originalIngredients) {
      if (typeof item === 'string') push(item);
    }
  }

  // Puis compléter avec tous les ingrédients de la recette
  if (entry.recipe && typeof entry.recipe === 'object' && 'ingredients' in entry.recipe) {
    const ingredients = (entry.recipe as { ingredients?: unknown }).ingredients;
    if (Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        if (ing && typeof ing === 'object' && 'name' in ing) {
          const n = (ing as { name?: unknown }).name;
          if (typeof n === 'string') push(n);
        }
      }
    }
  }

  // Cap pour rester compatible avec la génération (limite côté image: 15)
  return result.slice(0, 15);
}

export default async function StatsPage() {
  // session récupérée au cas où on voudrait conditionner certaines infos, mais non obligatoire
  await getServerSession(authOptions);

  const sampleSize = 500;

  const [topLiked, topCommented, recentEntries] = await Promise.all([
    prisma.cookbookEntry.findFirst({
      orderBy: { likes: { _count: 'desc' } },
      select: {
        id: true,
        imageUrl: true,
        recipe: true,
        category: true,
        originalIngredients: true,
        user: {
          select: {
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: { select: { likes: true } },
      },
    }),
    prisma.cookbookEntry.findFirst({
      orderBy: { comments: { _count: 'desc' } },
      select: {
        id: true,
        imageUrl: true,
        recipe: true,
        category: true,
        originalIngredients: true,
        user: {
          select: {
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: { select: { comments: true } },
      },
    }),
    prisma.cookbookEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: sampleSize,
      select: {
        originalIngredients: true,
        recipe: true,
      },
    }),
  ]);

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

  let topIngredient: { name: string; count: number; imageUrl?: string } | null = null;
  for (const v of counts.values()) {
    if (!topIngredient || v.count > topIngredient.count) {
      topIngredient = { name: v.display, count: v.count };
    }
  }

  if (topIngredient) {
    const imageUrl = resolveIngredientImageUrl(topIngredient.name);
    if (imageUrl) topIngredient.imageUrl = imageUrl;
  }

  const serializeEntry = (
    entry: typeof topLiked,
    count: number
  ) => {
    if (!entry) return null;

    const authorName = getUserDisplayName(entry.user);
    const authorAvatar =
      entry.user.avatarUrl && !entry.user.avatarUrl.startsWith('http') ? entry.user.avatarUrl : '👤';

    return {
      id: entry.id,
      title: getRecipeTitle(entry.recipe),
      imageUrl: entry.imageUrl,
      authorName,
      authorAvatar,
      category: entry.category,
      seedIngredients: buildSeedIngredients(entry),
      count,
    };
  };

  return (
    <StatsClient
      sampleSize={sampleSize}
      topLiked={serializeEntry(topLiked, topLiked?._count.likes ?? 0)}
      topCommented={serializeEntry(topCommented, topCommented?._count.comments ?? 0)}
      topIngredient={topIngredient}
    />
  );
}

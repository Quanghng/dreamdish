'use client';

import { useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserPanel from '../components/UserPanel';
import CommunityEntryCard from './CommunityEntryCard';
import CommunityCategoryFilter from './CommunityCategoryFilter';
import { useRecipe } from '@/hooks/useRecipe';

type CommunityEntry = {
  id: string;
  recipe: unknown;
  imageUrl: string;
  originalIngredients: unknown;
  createdAt: string;
  category: string | null;
  user: {
    email: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  likesCount: number;
  commentsCount: number;
};

type CommunauteClientProps = {
  entries: CommunityEntry[];
  categories: string[];
  selectedCategory: string;
  likedEntryIds: string[];
  uncategorizedToken: string;
  canFilterMine: boolean;
  isMineSelected: boolean;
};

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

function normalizeIngredientName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const normalized = normalizeIngredientName(item);
    if (normalized) out.push(normalized);
  }
  return out;
}

function readRecipeIngredients(recipe: unknown): string[] {
  if (!recipe || typeof recipe !== 'object') return [];

  const ingredients = (recipe as { ingredients?: unknown }).ingredients;
  if (!Array.isArray(ingredients)) return [];

  const out: string[] = [];
  for (const item of ingredients) {
    if (typeof item === 'string') {
      const normalized = normalizeIngredientName(item);
      if (normalized) out.push(normalized);
      continue;
    }

    if (item && typeof item === 'object') {
      const name = (item as { name?: unknown }).name;
      const normalized = normalizeIngredientName(name);
      if (normalized) out.push(normalized);
    }
  }
  return out;
}

function buildSeedIngredients(entry: { originalIngredients: unknown; recipe: unknown }): string[] {
  const fromOriginal = readStringArray(entry.originalIngredients);
  const fromRecipe = readRecipeIngredients(entry.recipe);
  const merged = [...fromOriginal, ...fromRecipe];

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of merged) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= 15) break;
  }

  return out;
}

export default function CommunauteClient({
  entries,
  categories,
  selectedCategory,
  likedEntryIds,
  uncategorizedToken,
  canFilterMine,
  isMineSelected,
}: CommunauteClientProps) {
  const { cookbook, updateRecipeCategory, fetchCookbook } = useRecipe();
  const likedSet = useMemo(() => new Set(likedEntryIds), [likedEntryIds]);

  return (
    <UserPanel
      cookbook={cookbook}
      updateRecipeCategory={updateRecipeCategory}
      fetchCookbook={fetchCookbook}
      renderNavbar={({ onUserClick, userAvatar, isAuthenticated }) => (
        <Navbar onUserClick={onUserClick} userAvatar={userAvatar} isAuthenticated={isAuthenticated} />
      )}
    >
      <div className="min-h-screen bg-linear-to-b from-amber-50 via-orange-50 to-white">
        <main className="pt-28 sm:pt-32 pb-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-amber-950">Communauté</h1>
            <p className="mt-3 text-amber-700 text-sm sm:text-base">
              Découvrez les plats créés par tous les utilisateurs.
            </p>

            <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-between gap-4">
              <CommunityCategoryFilter
                categories={categories}
                selected={selectedCategory}
                uncategorizedToken={uncategorizedToken}
                canFilterMine={canFilterMine}
                isMineSelected={isMineSelected}
              />
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-amber-600">
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-3 py-1 font-semibold text-amber-800">
                  {entries.length} plat{entries.length > 1 ? 's' : ''}
                </span>
                <span className="text-amber-400">•</span>
                <span>
                  {selectedCategory === 'Tous' ? 'Toutes les catégories' : `Catégorie: ${selectedCategory}`}
                </span>
              </div>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-amber-100 bg-white/70 p-10 text-center text-amber-800">
              Aucun plat enregistré pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry, index) => {
                const title = getRecipeTitle(entry.recipe);
                const author = getUserDisplayName(entry.user);
                const createdAt = new Date(entry.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                });

                const authorAvatar =
                  entry.user.avatarUrl && !entry.user.avatarUrl.startsWith('http')
                    ? entry.user.avatarUrl
                    : '👤';

                return (
                  <CommunityEntryCard
                    key={entry.id}
                    entryId={entry.id}
                    imageUrl={entry.imageUrl}
                    title={title}
                    index={index}
                    author={author}
                    authorAvatar={authorAvatar}
                    createdAtLabel={createdAt}
                    category={entry.category}
                    initialLikesCount={entry.likesCount}
                    initialCommentsCount={entry.commentsCount}
                    initialLiked={likedSet.has(entry.id)}
                    seedIngredients={buildSeedIngredients(entry)}
                  />
                );
              })}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </UserPanel>
  );
}

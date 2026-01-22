'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserPanel from '../components/UserPanel';
import { useRecipe } from '@/hooks/useRecipe';
import type { CookbookEntry } from '@/types';

function buildSeedIngredients(entry: CookbookEntry): string[] {
  const fromOriginal = Array.isArray(entry.originalIngredients)
    ? entry.originalIngredients
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => v)
    : [];

  const fromRecipe = Array.isArray(entry.recipe?.ingredients)
    ? entry.recipe.ingredients
        .map((ing) => (typeof ing?.name === 'string' ? ing.name.trim() : ''))
        .filter((v) => v)
    : [];

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

export default function MesCreationsClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user?.id);

  const { cookbook, updateRecipeCategory, fetchCookbook } = useRecipe();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasLoadedOnce(false);
      return;
    }

    setIsLoading(true);
    fetchCookbook()
      .catch(() => undefined)
      .finally(() => {
        setIsLoading(false);
        setHasLoadedOnce(true);
      });
  }, [isAuthenticated, fetchCookbook]);

  const entries = useMemo(() => cookbook, [cookbook]);

  return (
    <UserPanel
      cookbook={cookbook}
      updateRecipeCategory={updateRecipeCategory}
      fetchCookbook={fetchCookbook}
      renderNavbar={({ onUserClick, userAvatar, isAuthenticated: authed }) => (
        <Navbar onUserClick={onUserClick} userAvatar={userAvatar} isAuthenticated={authed} />
      )}
    >
      <div className="min-h-screen bg-linear-to-b from-amber-50 via-orange-50 to-white">
        <main className="pt-28 sm:pt-32 pb-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-amber-950">Mes créations</h1>
            <p className="mt-3 text-amber-700 text-sm sm:text-base">
              Retrouvez toutes vos recettes enregistrées.
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="rounded-2xl border border-amber-100 bg-white/70 p-10 text-center text-amber-800">
              Connectez-vous pour voir vos créations.
            </div>
          ) : isLoading && !hasLoadedOnce ? (
            <div className="rounded-2xl border border-amber-100 bg-white/70 p-10 text-center text-amber-800">
              Chargement de vos créations…
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-amber-100 bg-white/70 p-10 text-center text-amber-800">
              Aucune création enregistrée pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry) => {
                const likesCount = typeof entry.likesCount === 'number' ? entry.likesCount : 0;
                const commentsCount = typeof entry.commentsCount === 'number' ? entry.commentsCount : 0;
                const category = entry.category;
                const seedIngredients = buildSeedIngredients(entry);
                const seedHref =
                  seedIngredients.length > 0
                    ? `/?seedIngredients=${seedIngredients.map(encodeURIComponent).join('|')}`
                    : null;

                return (
                  <div
                    key={entry.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/communaute/${entry.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/communaute/${entry.id}`);
                      }
                    }}
                    className="rounded-3xl bg-white/80 backdrop-blur-md border border-amber-100 shadow-lg p-5 cursor-pointer hover:shadow-xl hover:border-amber-200 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={entry.imageUrl}
                        alt={entry.recipe.title}
                        className="h-20 w-20 rounded-2xl object-cover border border-amber-100"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-amber-950 line-clamp-2">{entry.recipe.title}</div>
                        <div className="mt-1 text-xs text-amber-700 line-clamp-2">{entry.recipe.description}</div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 border border-pink-200 px-3 py-1 font-semibold text-pink-700">
                            <span>❤️</span>
                            <span>{likesCount}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 font-semibold text-amber-800">
                            <span>💬</span>
                            <span>{commentsCount}</span>
                          </span>
                          {seedHref ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(seedHref);
                              }}
                              className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                            >
                              Générer avec
                            </button>
                          ) : null}
                          {category ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-3 py-1 font-semibold">
                              {category}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 font-semibold">
                              Sans catégorie
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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

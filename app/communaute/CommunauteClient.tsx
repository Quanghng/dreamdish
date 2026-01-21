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
};

type CommunauteClientProps = {
  entries: CommunityEntry[];
  categories: string[];
  selectedCategory: string;
  likedEntryIds: string[];
  uncategorizedToken: string;
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

export default function CommunauteClient({
  entries,
  categories,
  selectedCategory,
  likedEntryIds,
  uncategorizedToken
}: CommunauteClientProps) {
  const { cookbook, updateRecipeCategory, fetchCookbook } = useRecipe();
  const likedSet = useMemo(() => new Set(likedEntryIds), [likedEntryIds]);

  return (
    <UserPanel
      cookbook={cookbook}
      updateRecipeCategory={updateRecipeCategory}
      fetchCookbook={fetchCookbook}
      renderNavbar={({ onUserClick, userAvatar }) => (
        <Navbar onUserClick={onUserClick} userAvatar={userAvatar} />
      )}
    >
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
        <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-amber-900">Communauté</h1>
            <p className="mt-3 text-amber-700">
              Découvrez les plats créés par tous les utilisateurs.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <CommunityCategoryFilter
                categories={categories}
                selected={selectedCategory}
                uncategorizedToken={uncategorizedToken}
              />
              <div className="flex flex-wrap items-center gap-2 text-sm text-amber-600">
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
                    initialLiked={likedSet.has(entry.id)}
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

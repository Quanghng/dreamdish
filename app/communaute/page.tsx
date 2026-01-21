import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import CommunityEntryCard from './CommunityEntryCard';
import CommunityCategoryFilter from './CommunityCategoryFilter';

const COMMUNITY_CATEGORY_OPTIONS = ['Rapide', 'Healthy', 'Famille', 'Festif', 'Comfort', 'Créatif'] as const;
const UNCATEGORIZED_TOKEN = '__none__';

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

export default async function CommunautePage(props: { searchParams?: Promise<{ category?: string }> | { category?: string } }) {
  const resolvedSearchParams =
    props.searchParams && typeof (props.searchParams as Promise<unknown>)?.then === 'function'
      ? await (props.searchParams as Promise<{ category?: string }>)
      : (props.searchParams as { category?: string } | undefined);
  const rawCategory = resolvedSearchParams?.category;
  const selectedCategory = rawCategory === UNCATEGORIZED_TOKEN ? 'Sans catégorie' : rawCategory || 'Tous';

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const entries = await prisma.cookbookEntry.findMany({
    where: selectedCategory === 'Tous'
      ? undefined
      : selectedCategory === 'Sans catégorie'
        ? { category: null }
        : { category: selectedCategory },
    orderBy: { createdAt: 'desc' },
    take: 60,
    include: {
      user: {
        select: {
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  const categoryRows = await prisma.cookbookEntry.findMany({
    where: { category: { not: null } },
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' },
  });
  const categoriesFromDb = categoryRows.map((row) => row.category).filter(Boolean) as string[];
  const categories = Array.from(new Set([...COMMUNITY_CATEGORY_OPTIONS, ...categoriesFromDb]));

  const likedEntryIds = new Set<string>();
  if (userId && entries.length > 0) {
    const likes = await prisma.cookbookLike.findMany({
      where: { userId, entryId: { in: entries.map(entry => entry.id) } },
      select: { entryId: true },
    });
    for (const like of likes) likedEntryIds.add(like.entryId);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      <Navbar />

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
              uncategorizedToken={UNCATEGORIZED_TOKEN}
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
                  initialLikesCount={entry._count.likes}
                  initialLiked={likedEntryIds.has(entry.id)}
                />
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import CommunauteClient from './CommunauteClient';

const COMMUNITY_CATEGORY_OPTIONS = ['Rapide', 'Healthy', 'Famille', 'Festif', 'Comfort', 'Créatif'] as const;
const UNCATEGORIZED_TOKEN = '__none__';

export const dynamic = 'force-dynamic';

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

  const serializedEntries = entries.map(entry => ({
    id: entry.id,
    recipe: entry.recipe,
    imageUrl: entry.imageUrl,
    createdAt: entry.createdAt.toISOString(),
    category: entry.category,
    user: {
      email: entry.user.email,
      name: entry.user.name,
      firstName: entry.user.firstName,
      lastName: entry.user.lastName,
      avatarUrl: entry.user.avatarUrl,
    },
    likesCount: entry._count.likes,
  }));

  return (
    <CommunauteClient
      entries={serializedEntries}
      categories={categories}
      selectedCategory={selectedCategory}
      likedEntryIds={Array.from(likedEntryIds)}
      uncategorizedToken={UNCATEGORIZED_TOKEN}
    />
  );
}

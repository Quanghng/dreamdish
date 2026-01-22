import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import RecipeDetailClient from './RecipeDetailClient';

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

export default async function CommunityEntryDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const entryId = params.id;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const entry = await prisma.cookbookEntry.findUnique({
    where: { id: entryId },
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
        select: { likes: true },
      },
    },
  });

  if (!entry) {
    return (
      <div className="min-h-screen bg-linear-to-b from-amber-50 via-orange-50 to-white">
        <main className="pt-32 pb-24 max-w-3xl mx-auto px-6">
          <div className="rounded-2xl border border-amber-100 bg-white/70 p-10 text-center text-amber-800">
            Plat introuvable.
          </div>
        </main>
      </div>
    );
  }

  const title = getRecipeTitle(entry.recipe);
  const author = getUserDisplayName(entry.user);
  const createdAtLabel = new Date(entry.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });

  const authorAvatar =
    entry.user.avatarUrl && !entry.user.avatarUrl.startsWith('http') ? entry.user.avatarUrl : '👤';

  const liked =
    userId
      ? Boolean(
          await prisma.cookbookLike.findUnique({
            where: { entryId_userId: { entryId: entry.id, userId } },
            select: { id: true },
          })
        )
      : false;

  return (
    <RecipeDetailClient
      entryId={entry.id}
      recipe={entry.recipe as any}
      imageUrl={entry.imageUrl}
      originalIngredients={entry.originalIngredients as any}
      nutritionalInfo={(entry.nutritionalInfo as any) ?? undefined}
      drinkPairings={(entry.drinkPairings as any) ?? undefined}
      author={author}
      authorAvatar={authorAvatar}
      createdAtLabel={createdAtLabel}
      initialLikesCount={entry._count.likes}
      initialLiked={liked}
    />
  );
}

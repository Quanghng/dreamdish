import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const entries = await prisma.cookbookEntry.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  const withLikesCount = entries.map((entry) => ({
    ...entry,
    likesCount: entry._count.likes,
  }));

  return NextResponse.json(withLikesCount);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await request.json();
  const {
    recipe,
    imageUrl,
    originalIngredients,
    nutritionalInfo,
    drinkPairings,
    notes,
    rating,
    isFavorite,
    category,
  } = body || {};

  if (!recipe || !imageUrl || !originalIngredients) {
    return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
  }

  const entry = await prisma.cookbookEntry.create({
    data: {
      userId: session.user.id,
      recipe,
      imageUrl,
      originalIngredients,
      nutritionalInfo: nutritionalInfo ?? null,
      drinkPairings: drinkPairings ?? null,
      notes: notes ?? null,
      rating: rating ?? null,
      isFavorite: Boolean(isFavorite),
      category: category ?? null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

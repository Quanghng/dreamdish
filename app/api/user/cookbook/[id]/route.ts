import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await request.json();
  const { notes, rating, isFavorite, category } = body || {};

  const entry = await prisma.cookbookEntry.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: {
      notes: notes ?? undefined,
      rating: rating ?? undefined,
      isFavorite: typeof isFavorite === 'boolean' ? isFavorite : undefined,
      category: category ?? undefined,
    },
  });

  if (entry.count === 0) {
    return NextResponse.json({ error: 'Recette introuvable.' }, { status: 404 });
  }

  const updated = await prisma.cookbookEntry.findUnique({ where: { id: params.id } });
  return NextResponse.json({ id });;
}

export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const entry = await prisma.cookbookEntry.deleteMany({
    where: { id: params.id, userId: session.user.id },
  });

  if (entry.count === 0) {
    return NextResponse.json({ error: 'Recette introuvable.' }, { status: 404 });
  }

  return NextResponse.json({ id });
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const entryId = params.id;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const likesCount = await prisma.cookbookLike.count({ where: { entryId } });

  if (!userId) {
    return NextResponse.json({ likesCount, liked: false });
  }

  const existing = await prisma.cookbookLike.findUnique({
    where: { entryId_userId: { entryId, userId } },
    select: { id: true },
  });

  return NextResponse.json({ likesCount, liked: Boolean(existing) });
}

export async function POST(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const entryId = params.id;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const entryExists = await prisma.cookbookEntry.findUnique({
    where: { id: entryId },
    select: { id: true },
  });

  if (!entryExists) {
    return NextResponse.json({ error: 'Plat introuvable.' }, { status: 404 });
  }

  const existing = await prisma.cookbookLike.findUnique({
    where: { entryId_userId: { entryId, userId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.cookbookLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.cookbookLike.create({ data: { entryId, userId } });
  }

  const likesCount = await prisma.cookbookLike.count({ where: { entryId } });
  return NextResponse.json({ liked: !existing, likesCount });
}

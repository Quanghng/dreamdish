import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const MAX_COMMENT_LENGTH = 300;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const params =
    context.params && typeof (context.params as Promise<unknown>)?.then === 'function'
      ? await (context.params as Promise<{ id: string }>)
      : (context.params as { id: string });

  const entryId = params.id;

  const comments = await prisma.cookbookComment.findMany({
    where: { entryId },
    orderBy: { createdAt: 'desc' },
    take: 100,
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
    },
  });

  return NextResponse.json({
    count: comments.length,
    comments: comments.map((c) => ({
      id: c.id,
      entryId: c.entryId,
      userId: c.userId,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
    })),
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const params =
    context.params && typeof (context.params as Promise<unknown>)?.then === 'function'
      ? await (context.params as Promise<{ id: string }>)
      : (context.params as { id: string });

  const entryId = params.id;

  const body = await request.json().catch(() => ({}));
  const content = typeof body?.content === 'string' ? body.content.trim() : '';

  if (!content) {
    return NextResponse.json({ error: 'Commentaire vide.' }, { status: 400 });
  }

  if (content.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json(
      { error: `Commentaire trop long (max ${MAX_COMMENT_LENGTH} caractères).` },
      { status: 400 }
    );
  }

  const created = await prisma.cookbookComment.create({
    data: {
      entryId,
      userId: session.user.id,
      content,
    },
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
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      entryId: created.entryId,
      userId: created.userId,
      content: created.content,
      createdAt: created.createdAt.toISOString(),
      user: created.user,
    },
    { status: 201 }
  );
}

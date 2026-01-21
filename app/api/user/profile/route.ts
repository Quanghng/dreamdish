import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const DEFAULT_CATEGORIES = ['Rapide', 'Healthy', 'Famille', 'Festif', 'Comfort', 'Créatif'];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      preferences: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
  }

  let parsedPreferences: Record<string, unknown> = { categories: DEFAULT_CATEGORIES };
  if (user.preferences) {
    try {
      parsedPreferences = JSON.parse(user.preferences);
    } catch {
      parsedPreferences = { categories: DEFAULT_CATEGORIES };
    }
  }

  return NextResponse.json({
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatarUrl: user.avatarUrl || '',
    preferences: parsedPreferences,
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await request.json();
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : undefined;
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : undefined;
  const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl : undefined;
  const preferences = typeof body.preferences === 'object' && body.preferences ? body.preferences : undefined;
  const name = `${firstName || ''} ${lastName || ''}`.trim() || undefined;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      name: name ?? null,
      avatarUrl: avatarUrl ?? null,
      image: avatarUrl ?? null,
      preferences: preferences ? JSON.stringify(preferences) : null,
    },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      preferences: true,
    },
  });

  let parsedPreferences: Record<string, unknown> = { categories: DEFAULT_CATEGORIES };
  if (user.preferences) {
    try {
      parsedPreferences = JSON.parse(user.preferences);
    } catch {
      parsedPreferences = { categories: DEFAULT_CATEGORIES };
    }
  }

  return NextResponse.json({
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatarUrl: user.avatarUrl || '',
    preferences: parsedPreferences,
  });
}

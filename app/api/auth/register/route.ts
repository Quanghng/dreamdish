import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const DEFAULT_CATEGORIES = ['Rapide', 'Healthy', 'Famille', 'Festif', 'Comfort', 'Créatif'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
    const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl : '';
    const preferences = typeof body.preferences === 'object' && body.preferences ? body.preferences : {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const name = `${firstName} ${lastName}`.trim() || undefined;
    const mergedPreferences = {
      categories: Array.isArray(preferences.categories) ? preferences.categories : DEFAULT_CATEGORIES,
      ...preferences,
    };

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        name,
        avatarUrl: avatarUrl || null,
        image: avatarUrl || null,
        preferences: JSON.stringify(mergedPreferences),
      },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    console.error('[auth/register] error', error);
    return NextResponse.json({ error: 'Erreur lors de la création du compte.' }, { status: 500 });
  }
}

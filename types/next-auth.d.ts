import type { DefaultSession, DefaultUser } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      avatarUrl?: string | null;
      // Allow flexible types here to handle parsed JSON
      preferences?: Record<string, unknown> | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    // Allow string here because Prisma might return raw JSON string
    // or we might pass it as a string to the token
    preferences?: string | Record<string, unknown> | null;
    passwordHash?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    preferences?: string | Record<string, unknown> | null;
  }
}
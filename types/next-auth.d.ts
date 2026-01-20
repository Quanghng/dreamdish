import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      avatarUrl?: string | null;
      preferences?: Record<string, unknown>;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    preferences?: Record<string, unknown> | null;
    passwordHash?: string | null;
  }
}

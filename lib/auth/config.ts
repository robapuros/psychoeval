import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db/client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña requeridos');
        }

        const professional = await db.professional.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!professional) {
          throw new Error('Email o contraseña incorrectos');
        }

        const isValid = await compare(credentials.password, professional.passwordHash);

        if (!isValid) {
          throw new Error('Email o contraseña incorrectos');
        }

        return {
          id: professional.id,
          email: professional.email,
          name: professional.name,
          role: professional.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'PROFESSIONAL';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

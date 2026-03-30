import { PrismaClient } from '@prisma/client';

// PrismaClient singleton pattern for Next.js
// Prevents multiple instances in development (hot reload)
// Gracefully handles missing DATABASE_URL during build time

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only initialize if DATABASE_URL exists (runtime), not during build
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, skipping Prisma initialization');
    return null as any; // Type workaround for build
  }
  
  // NOTE: If you see "prepared statement already exists" errors in production:
  // This is a known issue with Prisma + Vercel + direct PostgreSQL connections.
  // Solution: Use a pooled connection (pgbouncer).
  // See VERCEL-FIX-REQUIRED.md for detailed instructions.
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production' && db) {
  globalForPrisma.prisma = db;
}

export default db;

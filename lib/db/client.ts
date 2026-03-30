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
  
  // FIX: Disable prepared statements for pgbouncer transaction mode
  // Supabase pooler (port 6543) doesn't support prepared statements
  // Solution: Add pgbouncer=true AND statement_cache_size=0 to URL
  let databaseUrl = process.env.DATABASE_URL;
  
  // If using Supabase pooler or pgbouncer, ensure proper params
  if (databaseUrl.includes('pooler.supabase.com') || databaseUrl.includes('pgbouncer=true')) {
    console.log('[prisma] Detected pgbouncer connection - disabling prepared statements');
    
    const url = new URL(databaseUrl.replace('postgresql://', 'http://'));
    
    // Add required parameters for pgbouncer transaction mode
    if (!url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }
    if (!url.searchParams.has('statement_cache_size')) {
      url.searchParams.set('statement_cache_size', '0');
    }
    
    databaseUrl = url.toString().replace('http://', 'postgresql://');
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production' && db) {
  globalForPrisma.prisma = db;
}

export default db;

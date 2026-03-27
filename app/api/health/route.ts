import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const health: any = {
    timestamp: new Date().toISOString(),
    environment: {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
    },
    database: {
      status: 'unknown',
      error: null,
    },
  };

  // Test database connection
  try {
    if (!db) {
      health.database.status = '❌ DB client not initialized';
      health.database.error = 'DATABASE_URL missing at initialization';
    } else {
      await db.$connect();
      const professionalCount = await db.professional.count();
      health.database.status = '✅ Connected';
      health.database.professionalCount = professionalCount;
      await db.$disconnect();
    }
  } catch (error: any) {
    health.database.status = '❌ Connection failed';
    health.database.error = error.message;
  }

  return NextResponse.json(health, { status: 200 });
}

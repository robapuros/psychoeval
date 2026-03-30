import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/health/db
 * Simple database health check
 */
export async function GET() {
  console.log('[/api/health/db] Health check initiated');
  
  try {
    console.log('[/api/health/db] Testing Prisma connection...');
    
    // Simple query to test connection
    const professionalCount = await prisma.professional.count();
    const patientCount = await prisma.patient.count();
    const assessmentCount = await prisma.assessment.count();
    
    console.log('[/api/health/db] Query successful:', {
      professionals: professionalCount,
      patients: patientCount,
      assessments: assessmentCount,
    });
    
    return NextResponse.json({
      status: 'ok',
      database: {
        connected: true,
        counts: {
          professionals: professionalCount,
          patients: patientCount,
          assessments: assessmentCount,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/health/db] Error:', error);
    console.error('[/api/health/db] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      {
        status: 'error',
        database: {
          connected: false,
          error: String(error),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

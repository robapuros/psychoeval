import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/patients/diagnose
 * Diagnostic endpoint to debug /api/patients issues
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    // Step 1: Check session
    console.log('[diagnose] Step 1: Checking session...');
    try {
      const session = await getServerSession(authOptions);
      diagnostics.checks.session = {
        status: 'ok',
        hasSession: !!session,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
        userRole: session?.user?.role || null,
      };
      console.log('[diagnose] Session:', diagnostics.checks.session);
    } catch (error) {
      diagnostics.checks.session = {
        status: 'error',
        error: String(error),
      };
      console.error('[diagnose] Session error:', error);
    }

    // Step 2: Check Prisma connection
    console.log('[diagnose] Step 2: Checking Prisma...');
    try {
      const count = await prisma.patient.count();
      diagnostics.checks.prisma = {
        status: 'ok',
        totalPatients: count,
      };
      console.log('[diagnose] Prisma OK, patients:', count);
    } catch (error) {
      diagnostics.checks.prisma = {
        status: 'error',
        error: String(error),
      };
      console.error('[diagnose] Prisma error:', error);
    }

    // Step 3: Try simple query (no includes)
    if (diagnostics.checks.session?.userId) {
      console.log('[diagnose] Step 3: Trying simple query...');
      try {
        const patients = await prisma.patient.findMany({
          where: { professionalId: diagnostics.checks.session.userId },
          take: 5,
        });
        diagnostics.checks.simpleQuery = {
          status: 'ok',
          count: patients.length,
          patients: patients.map((p: any) => ({ id: p.id, name: p.fullName })),
        };
        console.log('[diagnose] Simple query OK:', patients.length);
      } catch (error) {
        diagnostics.checks.simpleQuery = {
          status: 'error',
          error: String(error),
        };
        console.error('[diagnose] Simple query error:', error);
      }

      // Step 4: Try with assessments include
      console.log('[diagnose] Step 4: Trying with includes...');
      try {
        const patients = await prisma.patient.findMany({
          where: { professionalId: diagnostics.checks.session.userId },
          include: {
            assessments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          take: 5,
        });
        diagnostics.checks.withIncludes = {
          status: 'ok',
          count: patients.length,
        };
        console.log('[diagnose] With includes OK:', patients.length);
      } catch (error) {
        diagnostics.checks.withIncludes = {
          status: 'error',
          error: String(error),
        };
        console.error('[diagnose] With includes error:', error);
      }

      // Step 5: Try with _count
      console.log('[diagnose] Step 5: Trying with _count...');
      try {
        const patients = await prisma.patient.findMany({
          where: { professionalId: diagnostics.checks.session.userId },
          include: {
            _count: {
              select: {
                assessments: true,
              },
            },
          },
          take: 5,
        });
        diagnostics.checks.withCount = {
          status: 'ok',
          count: patients.length,
        };
        console.log('[diagnose] With count OK:', patients.length);
      } catch (error) {
        diagnostics.checks.withCount = {
          status: 'error',
          error: String(error),
        };
        console.error('[diagnose] With count error:', error);
      }

      // Step 6: Try full query (like /api/patients)
      console.log('[diagnose] Step 6: Trying full query...');
      try {
        const patients = await prisma.patient.findMany({
          where: { professionalId: diagnostics.checks.session.userId },
          include: {
            assessments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                token: true,
                instrumentType: true,
                status: true,
                score: true,
                severity: true,
                completedAt: true,
                hasCriticalAlert: true,
              },
            },
            _count: {
              select: {
                assessments: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        diagnostics.checks.fullQuery = {
          status: 'ok',
          count: patients.length,
        };
        console.log('[diagnose] Full query OK:', patients.length);
      } catch (error) {
        diagnostics.checks.fullQuery = {
          status: 'error',
          error: String(error),
          stack: error instanceof Error ? error.stack : undefined,
        };
        console.error('[diagnose] Full query error:', error);
      }
    }

    diagnostics.summary = {
      allChecksPass: Object.values(diagnostics.checks).every((c: any) => c.status === 'ok'),
      failedChecks: Object.entries(diagnostics.checks)
        .filter(([_, v]: any) => v.status === 'error')
        .map(([k, _]) => k),
    };

    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error('[diagnose] Fatal error:', error);
    return NextResponse.json(
      {
        ...diagnostics,
        fatalError: {
          message: String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 }
    );
  }
}

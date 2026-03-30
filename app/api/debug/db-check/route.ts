import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug/db-check
 * Check database state (professionals and their patients)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Get all professionals with their patient counts
    const professionals = await prisma.professional.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        _count: {
          select: {
            patients: true,
          },
        },
      },
    });

    // Get all patients
    const allPatients = await prisma.patient.findMany({
      select: {
        id: true,
        fullName: true,
        professionalId: true,
        professional: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      session: {
        authenticated: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userRole: session?.user?.role,
      },
      database: {
        totalProfessionals: professionals.length,
        professionals: professionals.map((p: any) => ({
          id: p.id,
          email: p.email,
          name: p.name,
          role: p.role,
          patientCount: p._count.patients,
        })),
        totalPatients: allPatients.length,
        patients: allPatients.map((p: any) => ({
          id: p.id,
          name: p.fullName,
          professionalEmail: p.professional.email,
        })),
      },
    });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json(
      {
        error: 'Database check failed',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

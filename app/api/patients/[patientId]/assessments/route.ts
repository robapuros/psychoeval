import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/patients/[patientId]/assessments
 * Obtiene todas las evaluaciones de un paciente (historial completo)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Solo profesionales pueden acceder' },
        { status: 403 }
      );
    }

    const { patientId } = params;

    // Verificar que el paciente pertenece al profesional
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        fullName: true,
        professionalId: true,
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    if (patient.professionalId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para ver este paciente' },
        { status: 403 }
      );
    }

    // Obtener todas las evaluaciones del paciente
    const assessments = await prisma.assessment.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        token: true,
        instrumentType: true,
        status: true,
        score: true,
        severity: true,
        hasCriticalAlert: true,
        criticalItems: true,
        createdAt: true,
        completedAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({
      patient: {
        id: patient.id,
        fullName: patient.fullName,
      },
      assessments,
    });
  } catch (error) {
    console.error('Error fetching patient assessments:', error);
    return NextResponse.json(
      { error: 'Error al obtener evaluaciones' },
      { status: 500 }
    );
  }
}

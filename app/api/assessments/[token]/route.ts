import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import phq9Data from '@/lib/instruments/phq9.json';
import gad7Data from '@/lib/instruments/gad7.json';
import pcl5Data from '@/lib/instruments/pcl5.json';
import auditData from '@/lib/instruments/audit.json';
import mecData from '@/lib/instruments/mec.json';

/**
 * GET /api/assessments/[token]
 * Obtiene los datos del cuestionario para el token dado
 * Acceso público (no requiere autenticación)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Buscar evaluación por token
    const assessment = await prisma.assessment.findUnique({
      where: { token },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Enlace de evaluación no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya fue completada
    if (assessment.status === 'completed') {
      return NextResponse.json(
        { error: 'Esta evaluación ya ha sido completada' },
        { status: 410 }
      );
    }

    // Verificar si expiró
    if (assessment.expiresAt && new Date() > assessment.expiresAt) {
      return NextResponse.json(
        { error: 'Este enlace ha expirado. Contacta con tu profesional para obtener uno nuevo' },
        { status: 410 }
      );
    }

    // Obtener datos del instrumento
    let instrumentData;
    switch (assessment.instrumentType) {
      case 'PHQ9':
        instrumentData = phq9Data;
        break;
      case 'GAD7':
        instrumentData = gad7Data;
        break;
      case 'PCL5':
        instrumentData = pcl5Data;
        break;
      case 'AUDIT':
        instrumentData = auditData;
        break;
      case 'MEC':
        instrumentData = mecData;
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de instrumento desconocido' },
          { status: 500 }
        );
    }

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        token: assessment.token,
        instrumentType: assessment.instrumentType,
        status: assessment.status,
        patient: assessment.patient,
        professional: assessment.professional,
        expiresAt: assessment.expiresAt?.toISOString(),
      },
      instrument: instrumentData,
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Error al obtener evaluación' },
      { status: 500 }
    );
  }
}

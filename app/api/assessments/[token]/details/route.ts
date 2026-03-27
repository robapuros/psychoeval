import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import phq9Data from '@/lib/instruments/phq9.json';
import gad7Data from '@/lib/instruments/gad7.json';
import pcl5Data from '@/lib/instruments/pcl5.json';
import auditData from '@/lib/instruments/audit.json';
import mecData from '@/lib/instruments/mec.json';

/**
 * GET /api/assessments/[token]/details
 * Obtiene detalles completos de una evaluación (solo profesional que la creó)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
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

    const { token } = params;

    // Buscar evaluación
    const assessment = await prisma.assessment.findUnique({
      where: { token },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
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
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el profesional sea el propietario
    if (assessment.professionalId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para ver esta evaluación' },
        { status: 403 }
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

    // Enriquecer respuestas con texto de preguntas
    const enrichedResponses = assessment.responses
      ? (assessment.responses as Array<{ questionNumber: number; value: number }>).map((response) => {
          // MEC tiene estructura diferente (sections en lugar de questions directas)
          let question: any = null;
          let responseOptions: any = null;

          if ('sections' in instrumentData) {
            // Para MEC: buscar en secciones
            for (const section of (instrumentData as any).sections) {
              question = section.items?.find((item: any) => item.number === response.questionNumber);
              if (question) break;
            }
          } else {
            // Para otros instrumentos: buscar directamente
            question = (instrumentData as any).questions?.find(
              (q: any) => q.number === response.questionNumber
            );
          }
          
          // Obtener opciones de respuesta (pueden ser específicas de la pregunta o globales)
          responseOptions = (question as any)?.responseOptions || (instrumentData as any).responseOptions;
          const selectedOption = responseOptions?.find((opt: any) => opt.value === response.value);

          return {
            questionNumber: response.questionNumber,
            questionText: question?.text || '',
            value: response.value,
            valueLabel: selectedOption?.label || String(response.value),
            category: (question as any)?.category || '',
            critical: (question as any)?.critical || false,
          };
        })
      : [];

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        token: assessment.token,
        instrumentType: assessment.instrumentType,
        status: assessment.status,
        score: assessment.score,
        severity: assessment.severity,
        hasCriticalAlert: assessment.hasCriticalAlert,
        criticalItems: assessment.criticalItems,
        createdAt: assessment.createdAt.toISOString(),
        completedAt: assessment.completedAt?.toISOString(),
        expiresAt: assessment.expiresAt?.toISOString(),
        patient: assessment.patient,
        professional: assessment.professional,
        responses: enrichedResponses,
      },
      instrument: {
        id: instrumentData.id,
        name: instrumentData.name,
        shortName: instrumentData.shortName,
        category: instrumentData.category,
        description: instrumentData.description,
        scoring: instrumentData.scoring,
      },
    });
  } catch (error) {
    console.error('Error fetching assessment details:', error);
    return NextResponse.json(
      { error: 'Error al obtener detalles de evaluación' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreInstrument, type QuestionResponse } from '@/lib/scoring';

/**
 * POST /api/assessments/[token]/submit
 * Envía las respuestas del cuestionario y calcula puntuación
 * Acceso público (no requiere autenticación)
 * 
 * Body: {
 *   responses: Array<{ questionNumber: number; value: number }>
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const { responses } = body;

    // Validar que se enviaron respuestas
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'Se requieren respuestas' },
        { status: 400 }
      );
    }

    // Buscar evaluación
    const assessment = await prisma.assessment.findUnique({
      where: { token },
      include: {
        patient: true,
        professional: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Enlace de evaluación no encontrado' },
        { status: 404 }
      );
    }

    // Verificar estado
    if (assessment.status === 'completed') {
      return NextResponse.json(
        { error: 'Esta evaluación ya ha sido completada' },
        { status: 400 }
      );
    }

    // Verificar expiración
    if (assessment.expiresAt && new Date() > assessment.expiresAt) {
      return NextResponse.json(
        { error: 'Este enlace ha expirado' },
        { status: 410 }
      );
    }

    // Validar número de respuestas según el instrumento
    const expectedCounts: Record<string, number> = {
      PHQ9: 9,
      GAD7: 7,
      PCL5: 20,
      AUDIT: 10,
      MEC: 30, // Aproximado, MEC tiene estructura especial
    };

    const expectedCount = expectedCounts[assessment.instrumentType];
    if (responses.length !== expectedCount) {
      return NextResponse.json(
        {
          error: `Se esperaban ${expectedCount} respuestas para ${assessment.instrumentType}, se recibieron ${responses.length}`,
        },
        { status: 400 }
      );
    }

    // Calcular puntuación
    let scoringResult;
    try {
      scoringResult = scoreInstrument(
        assessment.instrumentType as any,
        responses as QuestionResponse[]
      );
    } catch (error: any) {
      return NextResponse.json(
        { error: `Error al calcular puntuación: ${error.message}` },
        { status: 400 }
      );
    }

    // Detectar ítems críticos (ej. ideación suicida en PHQ-9)
    const criticalItems: number[] = [];
    let hasCriticalAlert = false;

    if (assessment.instrumentType === 'PHQ9') {
      // Pregunta 9: ideación suicida
      const q9 = responses.find((r: any) => r.questionNumber === 9);
      if (q9 && q9.value >= 1) {
        criticalItems.push(9);
        hasCriticalAlert = true;
      }
    }

    // Actualizar evaluación en base de datos
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        responses: responses,
        score: scoringResult.totalScore,
        severity: scoringResult.severity,
        hasCriticalAlert,
        criticalItems: criticalItems.length > 0 ? criticalItems : undefined,
      },
    });

    // Aquí se podría enviar email al profesional
    // TODO: Implementar notificaciones por email con Resend

    return NextResponse.json({
      success: true,
      result: {
        totalScore: scoringResult.totalScore,
        severity: scoringResult.severity,
        severityLabel: scoringResult.severityLabel,
        recommendation: scoringResult.recommendation,
        hasCriticalAlert,
        criticalItems,
      },
      message: hasCriticalAlert
        ? '⚠️ Tu profesional ha sido notificado sobre respuestas que requieren atención inmediata.'
        : 'Evaluación completada. Tu profesional revisará los resultados.',
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Error al enviar evaluación' },
      { status: 500 }
    );
  }
}

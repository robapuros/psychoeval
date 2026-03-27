import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreInstrument, type QuestionResponse } from '@/lib/scoring';
import {
  sendAssessmentCompleted,
  sendCriticalAlert,
  getSeverityColor,
  getCriticalAlertMessage,
} from '@/lib/email/send';
import phq9Data from '@/lib/instruments/phq9.json';
import gad7Data from '@/lib/instruments/gad7.json';
import pcl5Data from '@/lib/instruments/pcl5.json';
import auditData from '@/lib/instruments/audit.json';
import mecData from '@/lib/instruments/mec.json';

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

    // Obtener información del instrumento
    const instrumentMap: Record<string, any> = {
      PHQ9: phq9Data,
      GAD7: gad7Data,
      PCL5: pcl5Data,
      AUDIT: auditData,
      MEC: mecData,
    };
    const instrumentData = instrumentMap[assessment.instrumentType];
    const maxScore = instrumentData.scoring.range.max;

    // Construir URL de resultados
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resultsUrl = `${baseUrl}/dashboard/patients/${assessment.patientId}/assessments/${token}`;

    // Enviar notificaciones por email al profesional
    if (assessment.professional.email && process.env.RESEND_API_KEY) {
      try {
        // Enviar notificación de evaluación completada
        await sendAssessmentCompleted({
          to: assessment.professional.email,
          professionalName: assessment.professional.name || 'Profesional',
          patientName: assessment.patient.fullName,
          instrumentName: instrumentData.name,
          score: scoringResult.totalScore,
          maxScore,
          severity: scoringResult.severity,
          severityColor: getSeverityColor(scoringResult.severity),
          hasCriticalAlert,
          resultsUrl,
        });
        console.log(
          `✅ Completion email sent to ${assessment.professional.email} for assessment ${token}`
        );

        // Si hay alerta crítica, enviar email urgente adicional
        if (hasCriticalAlert) {
          await sendCriticalAlert({
            to: assessment.professional.email,
            professionalName: assessment.professional.name || 'Profesional',
            patientName: assessment.patient.fullName,
            patientEmail: assessment.patient.email || undefined,
            patientPhone: assessment.patient.phone || undefined,
            instrumentName: instrumentData.name,
            criticalItems,
            alertMessage: getCriticalAlertMessage(assessment.instrumentType, criticalItems),
            resultsUrl,
          });
          console.log(
            `🚨 Critical alert email sent to ${assessment.professional.email} for assessment ${token}`
          );
        }
      } catch (emailError) {
        console.error('Failed to send email notifications:', emailError);
        // No lanzar error, la evaluación ya fue guardada
      }
    }

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

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { sendPatientInvitation } from '@/lib/email/send';
import phq9Data from '@/lib/instruments/phq9.json';
import gad7Data from '@/lib/instruments/gad7.json';
import pcl5Data from '@/lib/instruments/pcl5.json';
import auditData from '@/lib/instruments/audit.json';
import mecData from '@/lib/instruments/mec.json';

/**
 * POST /api/assessments/generate
 * Genera un enlace único de evaluación para un paciente
 * 
 * Body: {
 *   patientId: string;
 *   instrumentType: 'PHQ9' | 'GAD7' | 'PCL5' | 'AUDIT' | 'MEC';
 *   expiresInDays?: number (default: 7);
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo profesionales pueden generar enlaces
    if (session.user.role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Solo profesionales pueden generar enlaces de evaluación' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { patientId, instrumentType, expiresInDays = 7 } = body;

    // Validar datos requeridos
    if (!patientId || !instrumentType) {
      return NextResponse.json(
        { error: 'patientId y instrumentType son requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de instrumento
    const validInstruments = ['PHQ9', 'GAD7', 'PCL5', 'AUDIT', 'MEC'];
    if (!validInstruments.includes(instrumentType)) {
      return NextResponse.json(
        { error: `Instrumento inválido. Debe ser uno de: ${validInstruments.join(', ')}` },
        { status: 400 }
      );
    }

    // Verificar que el paciente existe y pertenece al profesional
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { professional: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    if (patient.professionalId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para crear evaluaciones para este paciente' },
        { status: 403 }
      );
    }

    // Generar token único (URL-safe)
    const token = nanoid(32);

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Crear evaluación en base de datos
    const assessment = await prisma.assessment.create({
      data: {
        token,
        instrumentType,
        patientId,
        professionalId: session.user.id,
        expiresAt,
        status: 'pending',
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Construir URL del cuestionario
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const assessmentUrl = `${baseUrl}/assess/${token}`;

    // Obtener información del instrumento para el email
    const instrumentMap: Record<string, any> = {
      PHQ9: phq9Data,
      GAD7: gad7Data,
      PCL5: pcl5Data,
      AUDIT: auditData,
      MEC: mecData,
    };
    const instrumentData = instrumentMap[instrumentType];

    // Enviar email al paciente si tiene dirección de correo
    let emailSent = false;
    if (patient.email && process.env.RESEND_API_KEY) {
      try {
        await sendPatientInvitation({
          to: patient.email,
          patientName: patient.fullName,
          professionalName: patient.professional.name || 'Su profesional de salud',
          instrumentName: instrumentData.name,
          assessmentUrl,
          expiresAt: assessment.expiresAt.toISOString(),
        });
        emailSent = true;
        console.log(`✅ Email sent to ${patient.email} for assessment ${token}`);
      } catch (emailError) {
        console.error('Failed to send patient invitation email:', emailError);
        // No lanzar error, continuar con la respuesta
        // El enlace sigue siendo válido aunque el email falle
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      assessment: {
        id: assessment.id,
        token: assessment.token,
        url: assessmentUrl,
        instrumentType: assessment.instrumentType,
        patient: assessment.patient,
        expiresAt: assessment.expiresAt.toISOString(),
        status: assessment.status,
      },
    });
  } catch (error) {
    console.error('Error generating assessment:', error);
    return NextResponse.json(
      { error: 'Error al generar enlace de evaluación' },
      { status: 500 }
    );
  }
}

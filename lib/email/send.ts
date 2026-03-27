import { resend, emailConfig } from './resend';
import PatientInvitationEmail from '@/emails/patient-invitation';
import AssessmentCompletedEmail from '@/emails/assessment-completed';
import CriticalAlertEmail from '@/emails/critical-alert';

interface SendPatientInvitationParams {
  to: string;
  patientName: string;
  professionalName: string;
  instrumentName: string;
  assessmentUrl: string;
  expiresAt: string;
}

interface SendAssessmentCompletedParams {
  to: string;
  professionalName: string;
  patientName: string;
  instrumentName: string;
  score: number;
  maxScore: number;
  severity: string;
  severityColor: string;
  hasCriticalAlert: boolean;
  resultsUrl: string;
}

interface SendCriticalAlertParams {
  to: string;
  professionalName: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  instrumentName: string;
  criticalItems: number[];
  alertMessage: string;
  resultsUrl: string;
}

/**
 * Send patient invitation email with assessment link
 */
export async function sendPatientInvitation(params: SendPatientInvitationParams) {
  if (!resend) {
    throw new Error('Resend is not configured. Set RESEND_API_KEY environment variable.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: params.to,
      subject: `📋 Cuestionario de evaluación - ${params.instrumentName}`,
      react: PatientInvitationEmail({
        patientName: params.patientName,
        professionalName: params.professionalName,
        instrumentName: params.instrumentName,
        assessmentUrl: params.assessmentUrl,
        expiresAt: params.expiresAt,
      }),
    });

    if (error) {
      console.error('Error sending patient invitation:', error);
      throw error;
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('Failed to send patient invitation:', error);
    throw error;
  }
}

/**
 * Send assessment completed notification to professional
 */
export async function sendAssessmentCompleted(params: SendAssessmentCompletedParams) {
  if (!resend) {
    throw new Error('Resend is not configured. Set RESEND_API_KEY environment variable.');
  }

  try {
    const subject = params.hasCriticalAlert
      ? `⚠️ ALERTA: ${params.patientName} - ${params.instrumentName} completado`
      : `✅ ${params.patientName} ha completado ${params.instrumentName}`;

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: params.to,
      subject,
      react: AssessmentCompletedEmail({
        professionalName: params.professionalName,
        patientName: params.patientName,
        instrumentName: params.instrumentName,
        score: params.score,
        maxScore: params.maxScore,
        severity: params.severity,
        severityColor: params.severityColor,
        hasCriticalAlert: params.hasCriticalAlert,
        resultsUrl: params.resultsUrl,
      }),
    });

    if (error) {
      console.error('Error sending assessment completed:', error);
      throw error;
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('Failed to send assessment completed:', error);
    throw error;
  }
}

/**
 * Send critical alert email to professional (urgent)
 */
export async function sendCriticalAlert(params: SendCriticalAlertParams) {
  if (!resend) {
    throw new Error('Resend is not configured. Set RESEND_API_KEY environment variable.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: params.to,
      subject: `🚨 ALERTA CRÍTICA: ${params.patientName} - ${params.instrumentName}`,
      react: CriticalAlertEmail({
        professionalName: params.professionalName,
        patientName: params.patientName,
        patientEmail: params.patientEmail,
        patientPhone: params.patientPhone,
        instrumentName: params.instrumentName,
        criticalItems: params.criticalItems,
        alertMessage: params.alertMessage,
        resultsUrl: params.resultsUrl,
      }),
    });

    if (error) {
      console.error('Error sending critical alert:', error);
      throw error;
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('Failed to send critical alert:', error);
    throw error;
  }
}

/**
 * Get severity color for email styling
 */
export function getSeverityColor(severity: string): string {
  const severityMap: Record<string, string> = {
    'Mínima': '#3B6D11',
    'Normal': '#3B6D11',
    'Leve': '#BA7517',
    'Moderada': '#BA7517',
    'Moderadamente severa': '#BA7517',
    'Severa': '#E24B4A',
    'Muy severa': '#A32D2D',
    'Extremadamente severa': '#A32D2D',
  };

  return severityMap[severity] || '#185FA5';
}

/**
 * Get critical alert message based on instrument type
 */
export function getCriticalAlertMessage(
  instrumentType: string,
  criticalItems: number[]
): string {
  if (instrumentType === 'PHQ9' && criticalItems.includes(9)) {
    return 'El paciente ha reportado pensamientos de que estaría mejor muerto/a o de hacerse daño de alguna manera. Se recomienda evaluación inmediata del riesgo suicida.';
  }

  // Add more instrument-specific messages as needed
  return 'Se ha detectado una respuesta que requiere atención clínica inmediata.';
}

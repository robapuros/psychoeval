import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface CriticalAlertEmailProps {
  professionalName: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  instrumentName: string;
  criticalItems: number[];
  alertMessage: string;
  resultsUrl: string;
}

export const CriticalAlertEmail = ({
  professionalName,
  patientName,
  patientEmail,
  patientPhone,
  instrumentName,
  criticalItems,
  alertMessage,
  resultsUrl,
}: CriticalAlertEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        🚨 ALERTA CRÍTICA: {patientName} - {instrumentName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={urgentBanner}>
            <Text style={urgentText}>🚨 ALERTA CRÍTICA</Text>
          </Section>

          <Heading style={h1}>Atención Inmediata Requerida</Heading>
          
          <Text style={text}>
            <strong>{professionalName}</strong>,
          </Text>
          
          <Text style={text}>
            Se ha detectado una respuesta crítica en el cuestionario <strong>{instrumentName}</strong>{' '}
            completado por <strong>{patientName}</strong>.
          </Text>

          <Section style={alertBox}>
            <Text style={alertTitle}>Detalles de la Alerta</Text>
            <Text style={alertText}>{alertMessage}</Text>
            
            <Section style={itemsBox}>
              <Text style={alertText}>
                <strong>Ítem(s) crítico(s):</strong> {criticalItems.join(', ')}
              </Text>
            </Section>
          </Section>

          <Section style={contactBox}>
            <Text style={contactTitle}>Información de Contacto del Paciente</Text>
            <Text style={contactText}>
              <strong>Nombre:</strong> {patientName}
            </Text>
            {patientEmail && (
              <Text style={contactText}>
                <strong>Email:</strong> {patientEmail}
              </Text>
            )}
            {patientPhone && (
              <Text style={contactText}>
                <strong>Teléfono:</strong> {patientPhone}
              </Text>
            )}
          </Section>

          <Section style={recommendationBox}>
            <Text style={recommendationTitle}>⚠️ Recomendaciones Inmediatas</Text>
            <Text style={recommendationText}>
              • Contactar al paciente lo antes posible
            </Text>
            <Text style={recommendationText}>
              • Evaluar riesgo inmediato en persona o por teléfono
            </Text>
            <Text style={recommendationText}>
              • Considerar derivación a urgencias si es necesario
            </Text>
            <Text style={recommendationText}>
              • Documentar todas las acciones tomadas
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={resultsUrl}>
              Ver resultados completos
            </Button>
          </Section>

          <Text style={disclaimerText}>
            <strong>Nota importante:</strong> Este es un sistema automatizado de alerta. 
            La evaluación clínica completa debe realizarse por el profesional responsable. 
            En caso de emergencia, contactar inmediatamente con servicios de urgencias.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} PsicoEvalúa - Evaluaciones Psicológicas
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

CriticalAlertEmail.PreviewProps = {
  professionalName: 'Dr. Carlos Rodríguez',
  patientName: 'Ana García',
  patientEmail: 'ana.garcia@email.com',
  patientPhone: '+34 600 123 456',
  instrumentName: 'PHQ-9 - Cuestionario de Salud del Paciente',
  criticalItems: [9],
  alertMessage:
    'El paciente ha reportado pensamientos de que estaría mejor muerto/a o de hacerse daño de alguna manera. Se recomienda evaluación inmediata del riesgo suicida.',
  resultsUrl: 'https://psicoevalua.com/dashboard/patients/123/assessments/abc',
} as CriticalAlertEmailProps;

export default CriticalAlertEmail;

// Styles
const main = {
  backgroundColor: '#F7F6F3',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
};

const urgentBanner = {
  backgroundColor: '#A32D2D',
  padding: '16px',
  borderRadius: '12px 12px 0 0',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const urgentText = {
  color: '#FFFFFF',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const h1 = {
  color: '#A32D2D',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  padding: '0',
  lineHeight: '1.2',
};

const text = {
  color: '#1A1917',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const alertBox = {
  backgroundColor: '#FCEBEB',
  border: '3px solid #E24B4A',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const alertTitle = {
  color: '#A32D2D',
  fontSize: '18px',
  fontWeight: 'bold',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const alertText = {
  color: '#A32D2D',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const itemsBox = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E24B4A',
  borderRadius: '8px',
  padding: '12px',
  margin: '16px 0 0',
};

const contactBox = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
};

const contactTitle = {
  color: '#1A1917',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const contactText = {
  color: '#1A1917',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
};

const recommendationBox = {
  backgroundColor: '#FFF9F4',
  border: '2px solid #BA7517',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
};

const recommendationTitle = {
  color: '#854F0B',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const recommendationText = {
  color: '#854F0B',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#A32D2D',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const disclaimerText = {
  color: '#888780',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '8px',
};

const footer = {
  color: '#888780',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
  borderTop: '1px solid rgba(0,0,0,0.08)',
  paddingTop: '20px',
};

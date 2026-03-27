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

interface AssessmentCompletedEmailProps {
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

export const AssessmentCompletedEmail = ({
  professionalName,
  patientName,
  instrumentName,
  score,
  maxScore,
  severity,
  severityColor,
  hasCriticalAlert,
  resultsUrl,
}: AssessmentCompletedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {patientName} ha completado el cuestionario {instrumentName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>PsicoEvalúa</Heading>
          
          <Text style={text}>Hola {professionalName},</Text>
          
          <Text style={text}>
            <strong>{patientName}</strong> ha completado el cuestionario{' '}
            <strong>{instrumentName}</strong>.
          </Text>

          {hasCriticalAlert && (
            <Section style={alertBox}>
              <Text style={alertTitle}>⚠️ Alerta Crítica Detectada</Text>
              <Text style={alertText}>
                Se ha detectado una respuesta que requiere atención clínica inmediata. 
                Por favor revisa los resultados detallados lo antes posible.
              </Text>
            </Section>
          )}

          <Section style={resultsBox}>
            <Text style={resultsLabel}>Puntuación</Text>
            <Text style={resultsScore}>
              {score} / {maxScore}
            </Text>
            <Section
              style={{
                ...severityBadge,
                backgroundColor: `${severityColor}20`,
                borderColor: severityColor,
              }}
            >
              <Text
                style={{
                  ...severityText,
                  color: severityColor,
                }}
              >
                {severity}
              </Text>
            </Section>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={resultsUrl}>
              Ver resultados completos
            </Button>
          </Section>

          <Text style={smallText}>
            Los resultados detallados incluyen las respuestas del paciente ítem por ítem 
            y las recomendaciones clínicas basadas en la puntuación obtenida.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} PsicoEvalúa - Evaluaciones Psicológicas
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

AssessmentCompletedEmail.PreviewProps = {
  professionalName: 'Dr. Carlos Rodríguez',
  patientName: 'Ana García',
  instrumentName: 'PHQ-9 - Cuestionario de Salud del Paciente',
  score: 18,
  maxScore: 27,
  severity: 'Moderadamente severa',
  severityColor: '#BA7517',
  hasCriticalAlert: false,
  resultsUrl: 'https://psicoevalua.com/dashboard/patients/123/assessments/abc',
} as AssessmentCompletedEmailProps;

export default AssessmentCompletedEmail;

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

const h1 = {
  color: '#185FA5',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 30px',
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
  border: '2px solid #E24B4A',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
};

const alertTitle = {
  color: '#A32D2D',
  fontSize: '18px',
  fontWeight: 'bold',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const alertText = {
  color: '#A32D2D',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const resultsBox = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const resultsLabel = {
  color: '#888780',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const resultsScore = {
  color: '#1A1917',
  fontSize: '36px',
  fontWeight: 'bold',
  lineHeight: '1.2',
  margin: '0 0 16px',
};

const severityBadge = {
  display: 'inline-block',
  padding: '8px 16px',
  borderRadius: '8px',
  border: '2px solid',
  margin: '0 auto',
};

const severityText = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#185FA5',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const smallText = {
  color: '#888780',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '16px 0',
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

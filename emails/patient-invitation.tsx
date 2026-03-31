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

interface PatientInvitationEmailProps {
  patientName: string;
  professionalName: string;
  instrumentName: string;
  assessmentUrl: string;
  expiresAt: string;
}

export const PatientInvitationEmail = ({
  patientName,
  professionalName,
  instrumentName,
  assessmentUrl,
  expiresAt,
}: PatientInvitationEmailProps) => {
  const expiryDate = new Date(expiresAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>
        {professionalName} te ha enviado un cuestionario de evaluación
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>PsicoEvalúa</Heading>
          
          <Text style={text}>Hola {patientName},</Text>
          
          <Text style={text}>
            <strong>{professionalName}</strong> te ha enviado un cuestionario de evaluación 
            para completar: <strong>{instrumentName}</strong>.
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              📋 <strong>Cuestionario:</strong> {instrumentName}
            </Text>
            <Text style={infoText}>
              ⏱️ <strong>Tiempo estimado:</strong> 5-10 minutos
            </Text>
            <Text style={infoText}>
              📅 <strong>Válido hasta:</strong> {expiryDate}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={assessmentUrl}>
              Completar cuestionario
            </Button>
          </Section>

          <Text style={smallText}>
            <strong>Importante:</strong> Este enlace es personal e intransferible. 
            Puedes completar el cuestionario en cualquier momento antes de la fecha de vencimiento.
          </Text>

          <Text style={smallText}>
            Si no solicitaste este cuestionario o crees que este mensaje llegó por error, 
            puedes ignorarlo de forma segura.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} PsicoEvalúa - Evaluaciones Psicológicas
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

PatientInvitationEmail.PreviewProps = {
  patientName: 'Ana García',
  professionalName: 'Dr. Carlos Rodríguez',
  instrumentName: 'PHQ-9 - Cuestionario de Salud del Paciente',
  assessmentUrl: 'https://psicosnap.com/assess/abc123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
} as PatientInvitationEmailProps;

export default PatientInvitationEmail;

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

const infoBox = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
};

const infoText = {
  color: '#1A1917',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
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

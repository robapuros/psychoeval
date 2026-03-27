import { Resend } from 'resend';

// Initialize Resend only if API key is available
// This allows builds to succeed even without the key
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email sender configuration
export const emailConfig = {
  from: 'PsicoEvalúa <noreply@psicoevalua.com>',
  replyTo: 'contacto@psicoevalua.com',
};

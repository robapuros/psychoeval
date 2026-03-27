import type { ScoringResult, QuestionResponse } from './types';

/**
 * Calcula puntuación GAD-7 (Ansiedad)
 * Rango: 0-21 puntos
 */
export function scoreGAD7(responses: QuestionResponse[]): ScoringResult {
  if (responses.length !== 7) {
    throw new Error('GAD-7 requires exactly 7 responses');
  }

  // Validar que todas las respuestas estén en rango 0-3
  const invalidResponses = responses.filter(r => r.value < 0 || r.value > 3);
  if (invalidResponses.length > 0) {
    throw new Error(`Invalid response values. GAD-7 responses must be between 0-3`);
  }

  // Calcular puntuación total
  const totalScore = responses.reduce((sum, response) => sum + response.value, 0);

  // Determinar severidad
  let severity: string;
  let severityLabel: string;
  let recommendation: string;

  if (totalScore <= 4) {
    severity = 'Mínima';
    severityLabel = 'Ansiedad mínima';
    recommendation = 'No requiere intervención';
  } else if (totalScore <= 9) {
    severity = 'Leve';
    severityLabel = 'Ansiedad leve';
    recommendation = 'Seguimiento, técnicas de relajación';
  } else if (totalScore <= 14) {
    severity = 'Moderada';
    severityLabel = 'Ansiedad moderada';
    recommendation = 'Probable TAG, considerar tratamiento';
  } else {
    severity = 'Severa';
    severityLabel = 'Ansiedad severa';
    recommendation = 'TAG activo, tratamiento recomendado';
  }

  return {
    totalScore,
    minScore: 0,
    maxScore: 21,
    severity,
    severityLabel,
    recommendation,
  };
}

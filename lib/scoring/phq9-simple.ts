import type { ScoringResult, QuestionResponse } from './types';

export interface PHQ9Result extends ScoringResult {
  hasCriticalItem: boolean;
  criticalItems: number[];
}

/**
 * Calcula puntuación PHQ-9 (Depresión)
 * Rango: 0-27 puntos
 */
export function scorePHQ9(responses: QuestionResponse[]): PHQ9Result {
  if (responses.length !== 9) {
    throw new Error('PHQ-9 requires exactly 9 responses');
  }

  // Validar que todas las respuestas estén en rango 0-3
  const invalidResponses = responses.filter(r => r.value < 0 || r.value > 3);
  if (invalidResponses.length > 0) {
    throw new Error(`Invalid response values. PHQ-9 responses must be between 0-3`);
  }

  // Calcular puntuación total
  const totalScore = responses.reduce((sum, response) => sum + response.value, 0);

  // Determinar severidad
  let severity: string;
  let severityLabel: string;
  let recommendation: string;

  if (totalScore <= 4) {
    severity = 'Mínima';
    severityLabel = 'Sin depresión o depresión mínima';
    recommendation = 'No requiere intervención';
  } else if (totalScore <= 9) {
    severity = 'Leve';
    severityLabel = 'Depresión leve';
    recommendation = 'Seguimiento, considerar psicoterapia';
  } else if (totalScore <= 14) {
    severity = 'Moderada';
    severityLabel = 'Depresión moderada';
    recommendation = 'Psicoterapia y/o farmacoterapia';
  } else if (totalScore <= 19) {
    severity = 'Moderadamente severa';
    severityLabel = 'Depresión moderadamente severa';
    recommendation = 'Tratamiento activo con psicoterapia y farmacoterapia';
  } else {
    severity = 'Severa';
    severityLabel = 'Depresión severa';
    recommendation = 'Tratamiento inmediato, considerar intervención intensiva';
  }

  // Detectar ítems críticos (pregunta 9: ideación suicida)
  const criticalItems: number[] = [];
  const q9 = responses.find(r => r.questionNumber === 9);
  const hasCriticalItem = q9 ? q9.value >= 1 : false;
  
  if (hasCriticalItem) {
    criticalItems.push(9);
    recommendation += ' | ⚠️ ALERTA: Ideación suicida detectada. Requiere evaluación inmediata.';
  }

  return {
    totalScore,
    minScore: 0,
    maxScore: 27,
    severity,
    severityLabel,
    recommendation,
    hasCriticalItem,
    criticalItems,
  };
}

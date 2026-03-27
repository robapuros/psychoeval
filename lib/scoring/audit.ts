import type { ScoringResult, QuestionResponse } from './types';

export interface AUDITSubscores {
  consumo: number;
  dependencia: number;
  consecuencias: number;
}

export interface AUDITResult extends ScoringResult {
  subscores: AUDITSubscores;
  riskLevel: 'bajo' | 'riesgo' | 'perjudicial' | 'dependencia';
}

/**
 * Calcula puntuación AUDIT (Consumo de Alcohol)
 * Rango: 0-40 puntos
 * OMS - Organización Mundial de la Salud
 */
export function scoreAUDIT(responses: QuestionResponse[]): AUDITResult {
  if (responses.length !== 10) {
    throw new Error('AUDIT requires exactly 10 responses');
  }

  // Validar rangos específicos por pregunta
  // Preguntas 1-8: 0-4
  // Preguntas 9-10: 0, 2, 4
  responses.slice(0, 8).forEach((r, index) => {
    if (r.value < 0 || r.value > 4) {
      throw new Error(`Question ${index + 1}: value must be between 0-4`);
    }
  });

  responses.slice(8, 10).forEach((r, index) => {
    if (![0, 2, 4].includes(r.value)) {
      throw new Error(`Question ${index + 9}: value must be 0, 2, or 4`);
    }
  });

  // Calcular puntuación total
  const totalScore = responses.reduce((sum, response) => sum + response.value, 0);

  // Calcular subpuntuaciones
  const subscores: AUDITSubscores = {
    consumo: responses.slice(0, 3).reduce((sum, r) => sum + r.value, 0),         // Preguntas 1-3
    dependencia: responses.slice(3, 6).reduce((sum, r) => sum + r.value, 0),     // Preguntas 4-6
    consecuencias: responses.slice(6, 10).reduce((sum, r) => sum + r.value, 0),  // Preguntas 7-10
  };

  // Determinar nivel de riesgo y severidad
  let riskLevel: 'bajo' | 'riesgo' | 'perjudicial' | 'dependencia';
  let severity: string;
  let severityLabel: string;
  let recommendation: string;

  if (totalScore <= 7) {
    riskLevel = 'bajo';
    severity = 'Bajo riesgo';
    severityLabel = 'Consumo de bajo riesgo';
    recommendation = 'Educación sobre consumo responsable';
  } else if (totalScore <= 15) {
    riskLevel = 'riesgo';
    severity = 'Riesgo';
    severityLabel = 'Consumo de riesgo';
    recommendation = 'Consejo breve y educación sobre reducción';
  } else if (totalScore <= 19) {
    riskLevel = 'perjudicial';
    severity = 'Consumo perjudicial';
    severityLabel = 'Consumo perjudicial';
    recommendation = 'Intervención breve y seguimiento';
  } else {
    riskLevel = 'dependencia';
    severity = 'Dependencia';
    severityLabel = 'Posible dependencia alcohólica';
    recommendation = 'Derivación a especialista para evaluación y tratamiento';
  }

  return {
    totalScore,
    minScore: 0,
    maxScore: 40,
    severity,
    severityLabel,
    recommendation,
    subscores,
    riskLevel,
  };
}

/**
 * Determinar puntos de corte específicos por género
 * Las mujeres metabolizan el alcohol de forma diferente
 */
export function getGenderSpecificInterpretation(
  score: number,
  gender?: 'male' | 'female'
): string {
  if (!gender) {
    return score >= 8 ? 'Consumo de riesgo o superior' : 'Consumo de bajo riesgo';
  }

  const cutoff = gender === 'female' ? 7 : 8;
  
  if (score < cutoff) {
    return 'Consumo de bajo riesgo';
  } else if (score <= 15) {
    return 'Consumo de riesgo';
  } else if (score <= 19) {
    return 'Consumo perjudicial';
  } else {
    return 'Posible dependencia';
  }
}

/**
 * Valida respuestas de AUDIT
 */
export function validateAUDITResponses(responses: QuestionResponse[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (responses.length !== 10) {
    errors.push(`Se requieren exactamente 10 respuestas, se recibieron ${responses.length}`);
  }

  // Preguntas 1-8: rango 0-4
  responses.slice(0, 8).forEach((response, index) => {
    if (response.value < 0 || response.value > 4) {
      errors.push(`Pregunta ${index + 1}: valor ${response.value} fuera de rango (0-4)`);
    }
  });

  // Preguntas 9-10: solo 0, 2, 4
  responses.slice(8, 10).forEach((response, index) => {
    if (![0, 2, 4].includes(response.value)) {
      errors.push(`Pregunta ${index + 9}: valor ${response.value} inválido (debe ser 0, 2 o 4)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

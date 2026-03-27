import type { ScoringResult, QuestionResponse } from './types';

export interface PCL5ClusterScores {
  reexperimentacion: number;
  evitacion: number;
  cognicion_emocion: number;
  hiperactivacion: number;
}

export interface PCL5Result extends ScoringResult {
  clusterScores: PCL5ClusterScores;
  meetsDSMCriteria: boolean;
  diagnosticDetails: string[];
}

/**
 * Calcula puntuación PCL-5 (TEPT)
 * Rango: 0-80 puntos
 * Basado en DSM-5
 */
export function scorePCL5(responses: QuestionResponse[]): PCL5Result {
  if (responses.length !== 20) {
    throw new Error('PCL-5 requires exactly 20 responses');
  }

  // Validar que todas las respuestas estén en rango 0-4
  const invalidResponses = responses.filter(r => r.value < 0 || r.value > 4);
  if (invalidResponses.length > 0) {
    throw new Error(`Invalid response values. PCL-5 responses must be between 0-4`);
  }

  // Calcular puntuación total
  const totalScore = responses.reduce((sum, response) => sum + response.value, 0);

  // Calcular puntuaciones por cluster (DSM-5)
  const clusterScores: PCL5ClusterScores = {
    reexperimentacion: responses.slice(0, 5).reduce((sum, r) => sum + r.value, 0), // Items 1-5
    evitacion: responses.slice(5, 7).reduce((sum, r) => sum + r.value, 0),          // Items 6-7
    cognicion_emocion: responses.slice(7, 14).reduce((sum, r) => sum + r.value, 0), // Items 8-14
    hiperactivacion: responses.slice(14, 20).reduce((sum, r) => sum + r.value, 0),  // Items 15-20
  };

  // Determinar severidad
  let severity: string;
  let severityLabel: string;
  let recommendation: string;

  if (totalScore <= 30) {
    severity = 'Sin TEPT';
    severityLabel = 'Sin síntomas significativos de TEPT';
    recommendation = 'No requiere intervención especializada';
  } else if (totalScore <= 45) {
    severity = 'TEPT probable';
    severityLabel = 'Probable TEPT, síntomas moderados';
    recommendation = 'Evaluación clínica recomendada';
  } else {
    severity = 'TEPT severo';
    severityLabel = 'TEPT severo, síntomas intensos';
    recommendation = 'Tratamiento especializado urgente';
  }

  // Evaluar criterios diagnósticos DSM-5
  // Para diagnóstico provisional: al menos 1 síntoma ≥2 en cluster B, 1 en C, 2 en D, 2 en E
  const diagnosticDetails: string[] = [];
  
  const criteriaB = responses.slice(0, 5).filter(r => r.value >= 2).length >= 1;
  const criteriaC = responses.slice(5, 7).filter(r => r.value >= 2).length >= 1;
  const criteriaD = responses.slice(7, 14).filter(r => r.value >= 2).length >= 2;
  const criteriaE = responses.slice(14, 20).filter(r => r.value >= 2).length >= 2;

  diagnosticDetails.push(`Criterio B (Reexperimentación): ${criteriaB ? '✓ Cumple' : '✗ No cumple'}`);
  diagnosticDetails.push(`Criterio C (Evitación): ${criteriaC ? '✓ Cumple' : '✗ No cumple'}`);
  diagnosticDetails.push(`Criterio D (Cognición/Emoción): ${criteriaD ? '✓ Cumple' : '✗ No cumple'}`);
  diagnosticDetails.push(`Criterio E (Hiperactivación): ${criteriaE ? '✓ Cumple' : '✗ No cumple'}`);

  const meetsDSMCriteria = criteriaB && criteriaC && criteriaD && criteriaE;

  if (meetsDSMCriteria) {
    diagnosticDetails.push('⚠️ Cumple criterios DSM-5 para TEPT provisional');
  }

  return {
    totalScore,
    minScore: 0,
    maxScore: 80,
    severity,
    severityLabel,
    recommendation,
    clusterScores,
    meetsDSMCriteria,
    diagnosticDetails,
  };
}

/**
 * Valida respuestas de PCL-5
 */
export function validatePCL5Responses(responses: QuestionResponse[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (responses.length !== 20) {
    errors.push(`Se requieren exactamente 20 respuestas, se recibieron ${responses.length}`);
  }

  responses.forEach((response, index) => {
    if (response.value < 0 || response.value > 4) {
      errors.push(`Pregunta ${index + 1}: valor ${response.value} fuera de rango (0-4)`);
    }
    if (response.questionNumber !== index + 1) {
      errors.push(`Pregunta ${index + 1}: número de pregunta incorrecto`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

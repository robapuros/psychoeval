import type { ScoringResult } from './types';

export interface MECResponse {
  sectionName: string;
  itemNumber: number;
  points: number;
  maxPoints: number;
  notes?: string;
}

export interface MECSectionScores {
  orientacionTemporal: number;
  orientacionEspacial: number;
  memoriaInmediata: number;
  atencionCalculo: number;
  memoriaDiferida: number;
  lenguajeConstruccion: number;
}

export interface MECResult extends ScoringResult {
  sectionScores: MECSectionScores;
  adjustedForAge?: string;
  adjustedForEducation?: string;
  isNormalForDemographics: boolean;
  limitations: string[];
}

/**
 * Calcula puntuación MEC (Mini Examen Cognoscitivo)
 * Rango: 0-30 puntos
 * IMPORTANTE: Este test NO es auto-administrable, requiere aplicación por profesional
 */
export function scoreMEC(responses: MECResponse[]): MECResult {
  // Calcular puntuaciones por sección
  const sectionScores: MECSectionScores = {
    orientacionTemporal: 0,
    orientacionEspacial: 0,
    memoriaInmediata: 0,
    atencionCalculo: 0,
    memoriaDiferida: 0,
    lenguajeConstruccion: 0,
  };

  responses.forEach(response => {
    switch (response.sectionName) {
      case 'Orientación Temporal':
        sectionScores.orientacionTemporal += response.points;
        break;
      case 'Orientación Espacial':
        sectionScores.orientacionEspacial += response.points;
        break;
      case 'Memoria Inmediata (Fijación)':
        sectionScores.memoriaInmediata += response.points;
        break;
      case 'Atención y Cálculo':
        sectionScores.atencionCalculo += response.points;
        break;
      case 'Memoria Diferida (Recuerdo)':
        sectionScores.memoriaDiferida += response.points;
        break;
      case 'Lenguaje y Construcción':
        sectionScores.lenguajeConstruccion += response.points;
        break;
    }
  });

  // Calcular puntuación total
  const totalScore = Object.values(sectionScores).reduce((sum, score) => sum + score, 0);

  // Determinar severidad (sin ajustes demográficos)
  let severity: string;
  let severityLabel: string;
  let recommendation: string;

  if (totalScore >= 27) {
    severity = 'Normal';
    severityLabel = 'Sin deterioro cognitivo';
    recommendation = 'No requiere intervención';
  } else if (totalScore >= 24) {
    severity = 'Dudoso';
    severityLabel = 'Deterioro cognitivo dudoso';
    recommendation = 'Reevaluar en 6 meses, considerar otras pruebas';
  } else if (totalScore >= 20) {
    severity = 'Leve';
    severityLabel = 'Deterioro cognitivo leve';
    recommendation = 'Evaluación neuropsicológica completa';
  } else if (totalScore >= 10) {
    severity = 'Moderado';
    severityLabel = 'Deterioro cognitivo moderado';
    recommendation = 'Derivación a neurología, valorar inicio de tratamiento';
  } else {
    severity = 'Severo';
    severityLabel = 'Deterioro cognitivo severo';
    recommendation = 'Evaluación especializada urgente, soporte familiar';
  }

  const limitations = [
    'No es diagnóstico definitivo, es instrumento de cribado',
    'Requiere administración por profesional entrenado',
    'Puede estar influido por nivel educativo, edad y estado emocional',
    'No detecta deterioro cognitivo muy leve',
    'Complementar con historia clínica y otras pruebas',
  ];

  return {
    totalScore,
    minScore: 0,
    maxScore: 30,
    severity,
    severityLabel,
    recommendation,
    sectionScores,
    isNormalForDemographics: totalScore >= 24, // Valor por defecto, ajustar según edad/educación
    limitations,
  };
}

/**
 * Ajustar interpretación según edad del paciente
 */
export function adjustForAge(score: number, age: number): { adjusted: boolean; interpretation: string } {
  if (age < 65) {
    return { adjusted: false, interpretation: 'Punto de corte estándar: 24' };
  } else if (age < 80) {
    const isNormal = score >= 24;
    return {
      adjusted: true,
      interpretation: isNormal ? 'Normal para edad 65-79' : 'Bajo lo esperado para edad 65-79',
    };
  } else {
    const isNormal = score >= 23;
    return {
      adjusted: true,
      interpretation: isNormal ? 'Normal para edad 80+' : 'Bajo lo esperado para edad 80+',
    };
  }
}

/**
 * Ajustar interpretación según nivel educativo
 */
export function adjustForEducation(
  score: number,
  education: 'sin_estudios' | 'primaria' | 'secundaria_superior'
): { cutoff: number; interpretation: string } {
  const cutoffs = {
    sin_estudios: 23,
    primaria: 24,
    secundaria_superior: 27,
  };

  const cutoff = cutoffs[education];
  const isNormal = score >= cutoff;

  return {
    cutoff,
    interpretation: isNormal
      ? `Normal para nivel educativo (≥${cutoff})`
      : `Bajo lo esperado para nivel educativo (<${cutoff})`,
  };
}

/**
 * Interpretación completa con ajustes demográficos
 */
export function getComprehensiveInterpretation(
  score: number,
  age?: number,
  education?: 'sin_estudios' | 'primaria' | 'secundaria_superior'
): string {
  const parts: string[] = [`Puntuación total: ${score}/30`];

  if (age) {
    const ageAdj = adjustForAge(score, age);
    if (ageAdj.adjusted) {
      parts.push(ageAdj.interpretation);
    }
  }

  if (education) {
    const eduAdj = adjustForEducation(score, education);
    parts.push(eduAdj.interpretation);
  }

  if (!age && !education) {
    parts.push('Se recomienda considerar edad y nivel educativo para interpretación precisa');
  }

  return parts.join(' | ');
}

/**
 * Valida que se hayan completado todas las secciones del MEC
 */
export function validateMECResponses(responses: MECResponse[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const expectedSections = {
    'Orientación Temporal': 5,
    'Orientación Espacial': 5,
    'Memoria Inmediata (Fijación)': 3,
    'Atención y Cálculo': 5,
    'Memoria Diferida (Recuerdo)': 3,
    'Lenguaje y Construcción': 9,
  };

  // Verificar que todas las secciones estén presentes
  Object.entries(expectedSections).forEach(([section, maxScore]) => {
    const sectionResponses = responses.filter(r => r.sectionName === section);
    const sectionTotal = sectionResponses.reduce((sum, r) => sum + r.points, 0);

    if (sectionResponses.length === 0) {
      errors.push(`Falta la sección: ${section}`);
    } else if (sectionTotal > maxScore) {
      errors.push(`Sección "${section}": puntuación ${sectionTotal} excede máximo ${maxScore}`);
    }
  });

  // Verificar puntuación total
  const totalScore = responses.reduce((sum, r) => sum + r.points, 0);
  if (totalScore > 30) {
    errors.push(`Puntuación total ${totalScore} excede máximo 30`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

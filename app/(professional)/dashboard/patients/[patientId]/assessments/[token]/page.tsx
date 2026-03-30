'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface Response {
  questionNumber: number;
  questionText: string;
  value: number;
  valueLabel: string;
  category: string;
  critical: boolean;
}

interface Assessment {
  id: string;
  token: string;
  instrumentType: string;
  status: string;
  score: number | null;
  severity: string | null;
  hasCriticalAlert: boolean;
  criticalItems: number[];
  createdAt: string;
  completedAt: string | null;
  patient: {
    id: string;
    fullName: string;
  };
  responses: Response[];
}

interface Instrument {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  scoring: any;
  questions: any[];
  responseOptions?: Array<{ value: number; label: string }>;
}

export default function AssessmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { token } = params;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResponses, setShowResponses] = useState(false);

  useEffect(() => {
    loadAssessment();
  }, [token]);

  async function loadAssessment() {
    try {
      const response = await fetch(`/api/assessments/${token}/details`);
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al cargar evaluación');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAssessment(data.assessment);
      setInstrument(data.instrument);
      setLoading(false);
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-[12px] text-[#888780]">Cargando evaluación...</div>
      </div>
    );
  }

  if (error || !assessment || !instrument) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[12px] text-[#888780] mb-4">{error || 'Evaluación no encontrada'}</p>
          <button
            onClick={() => router.push('/dashboard/patients')}
            className="px-4 py-2 text-[11px] font-semibold border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
          >
            ← Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  if (assessment.status !== 'COMPLETED') {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[12px] text-[#888780] mb-4">Esta evaluación aún no ha sido completada</p>
          <button
            onClick={() => router.push('/dashboard/patients')}
            className="px-4 py-2 text-[11px] font-semibold border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
          >
            ← Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const severityInfo = instrument.scoring.interpretation?.find(
    (level: any) =>
      assessment.score !== null &&
      assessment.score >= level.min &&
      assessment.score <= level.max
  );

  // Calcular percentil (simplificado)
  const percentile = assessment.score 
    ? Math.round((assessment.score / instrument.scoring.range.max) * 100)
    : 0;

  // Agrupar respuestas por categoría
  const categoryScores: Record<string, { name: string; score: number; max: number }> = {};
  
  if (assessment.responses.length > 0 && instrument.questions) {
    // Mapeo de categorías a nombres legibles
    const categoryNames: Record<string, string> = {
      anhedonia: 'Anhedonia',
      estado_animo: 'Estado de ánimo',
      sueño: 'Sueño',
      energia: 'Energía',
      apetito: 'Apetito',
      autoestima: 'Autoestima',
      concentracion: 'Concentración',
      psicomotor: 'Actividad psicomotora',
      ideacion_suicida: 'Ideación (Ítem 9)'
    };

    assessment.responses.forEach((response) => {
      const question = instrument.questions.find(q => q.number === response.questionNumber);
      if (question && question.category) {
        if (!categoryScores[question.category]) {
          categoryScores[question.category] = {
            name: categoryNames[question.category] || question.category,
            score: 0,
            max: 0
          };
        }
        categoryScores[question.category].score += response.value;
        categoryScores[question.category].max += 3; // max por pregunta es 3
      }
    });
  }

  // Encontrar respuesta crítica
  const criticalResponse = assessment.responses.find(
    r => r.critical && r.value > 0
  );

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <DashboardHeader 
        title={`${instrument.shortName} - ${assessment.patient.fullName}`}
        userEmail={session?.user?.email}
      />

      <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-3 sm:space-y-6">
        {/* Botón de volver */}
        <button
          onClick={() => router.push(`/dashboard/patients/${assessment.patient.id}`)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] sm:text-[11px] font-medium text-[#185FA5] hover:text-[#0C447C] transition-colors"
        >
          ← Volver
        </button>

        {/* Puntuación Total Card */}
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.1)] p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-2">
            <h1 className="text-[36px] sm:text-[48px] font-bold tracking-tight leading-none">
              {assessment.score}/<span className="text-[24px] sm:text-[32px] text-[#888780]">{instrument.scoring.range.max}</span>
            </h1>
            <div className="flex flex-col">
              <span 
                className="text-[16px] sm:text-[20px] font-bold mb-0.5 sm:mb-1"
                style={{ color: severityInfo?.color || '#1A1917' }}
              >
                {severityInfo?.severity || assessment.severity}
              </span>
              <span className="text-[11px] sm:text-[12px] text-[#888780]">
                Percentil {percentile}
              </span>
            </div>
          </div>
          
          <p className="text-[10px] sm:text-[11px] text-[#888780] mb-3 sm:mb-4">
            Completado el {assessment.completedAt
              ? new Date(assessment.completedAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </p>

          {/* Alerta Crítica */}
          {assessment.hasCriticalAlert && criticalResponse && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-5 bg-[#FCEBEB] border-l-4 border-[#E24B4A] rounded-lg">
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <div className="w-10 h-10 bg-[#E24B4A] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[#A32D2D] mb-2 flex items-center gap-2">
                    🚨 ALERTA CRÍTICA: Ideación suicida detectada
                  </p>
                  <div className="bg-white bg-opacity-70 rounded p-3 mb-3">
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                      ÍTEM {criticalResponse.questionNumber}
                    </p>
                    <p className="text-[11px] text-[#1A1917] mb-2">
                      "{criticalResponse.questionText}"
                    </p>
                    <p className="text-[10px] font-semibold text-[#A32D2D]">
                      Respuesta del paciente: {criticalResponse.valueLabel}
                    </p>
                  </div>
                  <div className="bg-[#A32D2D] bg-opacity-10 rounded p-3 border border-[#A32D2D] border-opacity-30">
                    <p className="text-[11px] font-bold text-[#A32D2D] mb-1">
                      ⚡ Acción requerida
                    </p>
                    <p className="text-[10px] text-[#A32D2D] leading-relaxed">
                      Se requiere <strong>evaluación inmediata del riesgo suicida</strong>. Considere:
                    </p>
                    <ul className="mt-2 space-y-1 text-[10px] text-[#A32D2D]">
                      <li className="flex items-start gap-1">
                        <span>•</span>
                        <span>Contacto telefónico en las próximas 24 horas</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span>•</span>
                        <span>Evaluación presencial urgente si es posible</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span>•</span>
                        <span>Derivación a emergencias si hay riesgo inminente</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Perfil por Áreas */}
        {Object.keys(categoryScores).length > 0 && (
          <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.1)] p-6">
            <h2 className="text-[14px] font-bold mb-4">Perfil por áreas</h2>
            <div className="space-y-3">
              {Object.entries(categoryScores).map(([key, data]) => {
                const percentage = (data.score / data.max) * 100;
                const isIdeacion = key === 'ideacion_suicida';
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-medium ${isIdeacion && data.score > 0 ? 'text-[#A32D2D]' : 'text-[#1A1917]'}`}>
                        {data.name}
                      </span>
                      <span className="text-[11px] font-mono text-[#888780]">
                        {data.score}/{data.max}
                      </span>
                    </div>
                    <div className="w-full bg-[#F1EFE8] rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isIdeacion && data.score > 0
                            ? 'bg-[#E24B4A]'
                            : 'bg-[#185FA5]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Baremo de Interpretación */}
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.1)] p-6">
          <h2 className="text-[14px] font-bold mb-4">Baremo de interpretación</h2>
          
          {/* Escala visual */}
          <div className="relative mb-6">
            <div className="flex h-10 rounded overflow-hidden">
              {instrument.scoring.interpretation.map((level: any, index: number) => {
                const width = ((level.max - level.min + 1) / (instrument.scoring.range.max + 1)) * 100;
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-center text-[9px] font-bold text-white border-r border-white last:border-r-0"
                    style={{
                      width: `${width}%`,
                      backgroundColor: level.color
                    }}
                  >
                    {level.min}-{level.max}
                  </div>
                );
              })}
            </div>
            
            {/* Indicador de puntuación actual */}
            {assessment.score !== null && (
              <div
                className="absolute top-0 h-10 flex items-center"
                style={{
                  left: `${(assessment.score / instrument.scoring.range.max) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="w-1 h-full bg-black"></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap">
                  {assessment.score}
                </div>
              </div>
            )}
          </div>

          {/* Leyenda */}
          <div className="space-y-2">
            {instrument.scoring.interpretation.map((level: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className="w-4 h-4 rounded flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: level.color }}
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-semibold">
                      {level.severity}
                    </span>
                    <span className="text-[10px] text-[#888780] font-mono">
                      ({level.min}-{level.max} puntos)
                    </span>
                  </div>
                  <p className="text-[10px] text-[#888780] mt-0.5">
                    {level.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Respuestas Detalladas (Colapsable) */}
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.1)] overflow-hidden">
          <button
            onClick={() => setShowResponses(!showResponses)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F7F6F3] transition-colors"
          >
            <h2 className="text-[14px] font-bold">
              Respuestas detalladas ({assessment.responses.length})
            </h2>
            <svg
              className={`w-5 h-5 transition-transform ${showResponses ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showResponses && (
            <div className="border-t border-[rgba(0,0,0,0.1)] divide-y divide-[rgba(0,0,0,0.08)]">
              {assessment.responses.map((response) => {
                // Obtener opciones de respuesta (pueden ser específicas de la pregunta o globales)
                const question = instrument.questions.find(q => q.number === response.questionNumber);
                const responseOptions = (question as any)?.responseOptions || instrument.responseOptions || [];
                
                return (
                  <div
                    key={response.questionNumber}
                    className={`px-6 py-4 ${
                      response.critical && response.value > 0 ? 'bg-[#FFF9F9]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#185FA5] text-white text-[11px] font-bold flex items-center justify-center">
                        {response.questionNumber}
                      </span>
                      <div className="flex-1">
                        <p className="text-[11px] font-medium text-[#1A1917] mb-3">
                          {response.questionText}
                          {response.critical && (
                            <span className="ml-2 text-[#E24B4A]">⚠️</span>
                          )}
                        </p>
                        
                        {/* Mostrar todas las opciones con la seleccionada destacada */}
                        <div className="space-y-2">
                          {responseOptions.map((option: any) => {
                            const isSelected = option.value === response.value;
                            
                            return (
                              <div
                                key={option.value}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                  isSelected
                                    ? response.critical && response.value > 0
                                      ? 'border-[#E24B4A] bg-[#FCEBEB]'
                                      : 'border-[#185FA5] bg-[#EFF5FB]'
                                    : 'border-[rgba(0,0,0,0.08)] bg-white'
                                }`}
                              >
                                <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  isSelected
                                    ? response.critical && response.value > 0
                                      ? 'border-[#E24B4A] bg-[#E24B4A]'
                                      : 'border-[#185FA5] bg-[#185FA5]'
                                    : 'border-[rgba(0,0,0,0.2)] bg-white'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 16 16">
                                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className={`text-[10px] font-medium ${
                                    isSelected
                                      ? response.critical && response.value > 0
                                        ? 'text-[#A32D2D]'
                                        : 'text-[#185FA5]'
                                      : 'text-[#888780]'
                                  }`}>
                                    {option.label}
                                  </span>
                                </div>
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                                  isSelected
                                    ? response.critical && response.value > 0
                                      ? 'bg-[#A32D2D] text-white'
                                      : 'bg-[#185FA5] text-white'
                                    : 'bg-[#F1EFE8] text-[#888780]'
                                }`}>
                                  {option.value}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => router.push(`/dashboard/patients/${assessment.patient.id}`)}
            className="flex-1 px-4 py-2.5 sm:py-3 text-[11px] sm:text-[12px] font-semibold border border-[rgba(0,0,0,0.13)] rounded-lg hover:bg-[#F1EFE8] transition-colors"
          >
            ← Volver al paciente
          </button>
          <button
            onClick={() => alert('Exportar a PDF (próximamente)')}
            className="flex-1 px-4 py-2.5 sm:py-3 text-[11px] sm:text-[12px] font-semibold bg-[#185FA5] text-white rounded-lg hover:bg-[#0C447C] transition-colors"
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

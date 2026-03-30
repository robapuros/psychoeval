'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
  const [showResponses, setShowResponses] = useState(true);

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

  const scorePercentage = assessment.score
    ? (assessment.score / instrument.scoring.range.max) * 100
    : 0;

  const severityInfo = instrument.scoring.interpretation?.find(
    (level: any) =>
      assessment.score !== null &&
      assessment.score >= level.min &&
      assessment.score <= level.max
  );

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Topbar */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-4 h-[42px] flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard/patients')}
          className="text-[12px] font-semibold text-[#185FA5] hover:text-[#0C447C] transition-colors"
        >
          ← Pacientes
        </button>
        <span className="text-[10px] uppercase tracking-wide font-semibold text-[#888780]">
          Resultados de Evaluación
        </span>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-[18px] font-bold tracking-tight mb-1">
                {assessment.patient.fullName}
              </h1>
              <p className="text-[11px] text-[#888780]">
                {instrument.name} ({instrument.shortName})
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Completado
              </p>
              <p className="text-[11px] font-semibold">
                {assessment.completedAt
                  ? new Date(assessment.completedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Score Display */}
          <div className="border-t border-[rgba(0,0,0,0.08)] pt-4">
            <div className="flex items-center gap-6">
              {/* Score Circle */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F1EFE8"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={severityInfo?.color || '#185FA5'}
                    strokeWidth="8"
                    strokeDasharray={`${scorePercentage * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[28px] font-bold tracking-tight">
                    {assessment.score}
                  </span>
                  <span className="text-[10px] text-[#888780] font-mono">
                    / {instrument.scoring.range.max}
                  </span>
                </div>
              </div>

              {/* Interpretation */}
              <div className="flex-1">
                <div className="mb-3">
                  <p className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                    Severidad
                  </p>
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                    style={{
                      backgroundColor: `${severityInfo?.color}20`,
                      color: severityInfo?.color,
                    }}
                  >
                    {assessment.hasCriticalAlert && '⚠️ '}
                    {severityInfo?.label || assessment.severity}
                  </span>
                </div>
                
                <div>
                  <p className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                    Recomendación Clínica
                  </p>
                  <p className="text-[11px] text-[#1A1917] leading-relaxed">
                    {severityInfo?.action || 'Consultar interpretación del manual'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Alert */}
          {assessment.hasCriticalAlert && (
            <div className="mt-4 p-4 bg-[#FCEBEB] border border-[#E24B4A] rounded-lg">
              <p className="text-[11px] font-semibold text-[#A32D2D] mb-1">
                ⚠️ ALERTA: Ítem crítico detectado
              </p>
              <p className="text-[10px] text-[#A32D2D]">
                {assessment.instrumentType === 'PHQ9' && assessment.criticalItems?.includes(9)
                  ? 'El paciente ha reportado pensamientos de que estaría mejor muerto/a o de hacerse daño. Se recomienda evaluación inmediata del riesgo suicida.'
                  : 'Se ha detectado una respuesta que requiere atención clínica inmediata.'}
              </p>
            </div>
          )}
        </div>

        {/* Responses Card */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm overflow-hidden">
          <button
            onClick={() => setShowResponses(!showResponses)}
            className="w-full px-4 py-3 bg-[#F1EFE8] border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between hover:bg-[#E8E6DF] transition-colors"
          >
            <h2 className="text-[12px] font-bold tracking-tight">
              Respuestas Detalladas ({assessment.responses.length})
            </h2>
            <svg
              className={`w-4 h-4 transition-transform ${showResponses ? 'rotate-180' : ''}`}
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
            <div className="divide-y divide-[rgba(0,0,0,0.08)]">
              {assessment.responses.map((response) => (
                <div
                  key={response.questionNumber}
                  className={`px-4 py-3 ${
                    response.critical && response.value > 0 ? 'bg-[#FFF9F9]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#185FA5] text-white text-[11px] font-bold flex items-center justify-center">
                      {response.questionNumber}
                    </span>
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold text-[#1A1917] mb-2">
                        {response.questionText}
                        {response.critical && (
                          <span className="ml-2 text-[#E24B4A]">⚠️</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#888780] uppercase tracking-wide">
                          Respuesta:
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold ${
                            response.critical && response.value > 0
                              ? 'bg-[#FCEBEB] text-[#A32D2D]'
                              : 'bg-[#F1EFE8] text-[#5F5E5A]'
                          }`}
                        >
                          {response.valueLabel} ({response.value})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/dashboard/patients')}
            className="flex-1 px-4 py-2 text-[11px] font-semibold border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
          >
            ← Volver al dashboard
          </button>
          <button
            onClick={() => alert('Exportar a PDF (próximamente)')}
            className="flex-1 px-4 py-2 text-[11px] font-semibold bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

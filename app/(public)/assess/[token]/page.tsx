'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  number: number;
  text: string;
  category?: string;
  responseOptions?: Array<{ value: number; label: string }>;
  note?: string;
}

interface Instrument {
  id: string;
  name: string;
  shortName: string;
  category: string;
  instructions: string;
  timeEstimate: string;
  responseOptions?: Array<{ value: number; label: string }>;
  questions: Question[];
}

interface Assessment {
  id: string;
  token: string;
  instrumentType: string;
  status: string;
  patient: {
    id: string;
    fullName: string;
  };
  professional: {
    id: string;
    name: string;
    specialty?: string;
  };
}

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos de la evaluación
  useEffect(() => {
    async function loadAssessment() {
      try {
        const response = await fetch(`/api/assessments/${token}`);
        
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
        setError('Error de conexión. Por favor, intenta de nuevo.');
        setLoading(false);
      }
    }

    loadAssessment();
  }, [token]);

  // Manejar respuesta
  const handleResponse = (value: number) => {
    if (!instrument) return;

    const questionNumber = currentQuestion + 1;
    setResponses({ ...responses, [questionNumber]: value });

    // Avanzar a la siguiente pregunta
    if (currentQuestion < instrument.questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  // Enviar cuestionario
  const handleSubmit = async () => {
    if (!instrument || Object.keys(responses).length !== instrument.questions.length) {
      alert('Por favor, responde todas las preguntas antes de enviar.');
      return;
    }

    setSubmitting(true);

    try {
      const responsesArray = Object.entries(responses).map(([questionNumber, value]) => ({
        questionNumber: parseInt(questionNumber),
        value,
      }));

      const response = await fetch(`/api/assessments/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: responsesArray }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error al enviar evaluación');
        setSubmitting(false);
        return;
      }

      // Redirigir a página de confirmación
      router.push(`/assess/${token}/complete`);
    } catch (err) {
      alert('Error de conexión. Por favor, intenta de nuevo.');
      setSubmitting(false);
    }
  };

  // Volver a pregunta anterior
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#185FA5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[12px] text-[#888780]">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment || !instrument) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] p-4">
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-[#FCEAEA] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[24px]">⚠️</span>
          </div>
          <h1 className="text-[18px] font-bold tracking-tight text-[#1A1917] mb-2">
            {error || 'Evaluación no encontrada'}
          </h1>
          <p className="text-[11px] text-[#888780] leading-relaxed">
            Si crees que esto es un error, contacta con tu profesional.
          </p>
        </div>
      </div>
    );
  }

  // Pantalla de instrucciones preliminares
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-lg p-4 sm:p-8">
            {/* Logo/Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#185FA5] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h1 className="text-[18px] sm:text-[24px] font-bold text-[#1A1917] mb-1 sm:mb-2">
                {instrument.name}
              </h1>
              <p className="text-[11px] sm:text-[12px] text-[#888780]">
                Evaluación enviada por {assessment.professional.name}
              </p>
            </div>

            {/* Instrucciones */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="bg-[#EFF5FB] border border-[#185FA5] rounded-lg p-4">
                <h2 className="text-[14px] font-bold text-[#185FA5] mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Antes de comenzar
                </h2>
                <ul className="space-y-2 text-[11px] text-[#1A1917]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#185FA5] font-bold">•</span>
                    <span>Busca un <strong>lugar tranquilo y cómodo</strong> donde puedas concentrarte sin distracciones.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#185FA5] font-bold">•</span>
                    <span>Tómate tu <strong>tiempo para reflexionar</strong> sobre cada pregunta antes de responder.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#185FA5] font-bold">•</span>
                    <span>No hay respuestas correctas o incorrectas, responde con <strong>honestidad</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#185FA5] font-bold">•</span>
                    <span>El cuestionario tomará aproximadamente <strong>{instrument.timeEstimate}</strong>.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#F1EFE8] rounded-lg p-4">
                <p className="text-[11px] text-[#888780] leading-relaxed">
                  <strong className="text-[#1A1917]">Instrucciones:</strong> {instrument.instructions}
                </p>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-[#888780]">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {instrument.timeEstimate}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {instrument.questions.length} preguntas
                </div>
              </div>
            </div>

            {/* Botón para comenzar */}
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full px-6 py-4 bg-[#185FA5] text-white text-[14px] font-bold rounded-lg hover:bg-[#0C447C] transition-colors flex items-center justify-center gap-2"
            >
              Comenzar evaluación
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <p className="text-[9px] text-center text-[#888780] mt-4">
              Tus respuestas son confidenciales y solo serán compartidas con tu profesional.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const question = instrument.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / instrument.questions.length) * 100;
  const isLastQuestion = currentQuestion === instrument.questions.length - 1;
  const allAnswered = Object.keys(responses).length === instrument.questions.length;

  // Determinar opciones de respuesta (pueden ser específicas de la pregunta o globales)
  const responseOptions = question.responseOptions || instrument.responseOptions || [];

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)] p-3 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-[12px] sm:text-[14px] font-bold text-[#1A1917] truncate">{instrument.shortName}</h1>
              <p className="text-[9px] sm:text-[10px] text-[#888780] truncate">{assessment.professional.name}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="text-[8px] sm:text-[10px] uppercase tracking-wide font-semibold text-[#888780]">PROGRESO</p>
              <p className="text-[12px] sm:text-[14px] font-bold text-[#185FA5]">
                {currentQuestion + 1} / {instrument.questions.length}
              </p>
            </div>
          </div>
          {/* Barra de progreso */}
          <div className="w-full bg-[#F1EFE8] rounded-full h-1.5 sm:h-2">
            <div
              className="bg-[#185FA5] h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pregunta */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-4 sm:p-8">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-3 sm:mb-4">
              PREGUNTA {currentQuestion + 1}
            </p>
            <h2 className="text-[15px] sm:text-[18px] font-bold text-[#1A1917] leading-snug mb-4 sm:mb-6">
              {question.text}
            </h2>

            {question.note && (
              <p className="text-[10px] sm:text-[11px] text-[#888780] bg-[#F1EFE8] rounded-lg p-2.5 sm:p-3 mb-4 sm:mb-6">
                💡 {question.note}
              </p>
            )}

            <div className="space-y-2 sm:space-y-3">
              {responseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-[11px] sm:text-[12px] font-medium ${
                    responses[currentQuestion + 1] === option.value
                      ? 'border-[#185FA5] bg-[#EFF5FB] text-[#185FA5]'
                      : 'border-[rgba(0,0,0,0.08)] bg-white text-[#1A1917] hover:border-[#185FA5] hover:bg-[#F7F6F3]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className="flex items-center justify-between mt-3 sm:mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] font-semibold text-[#888780] hover:text-[#1A1917] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            {allAnswered && isLastQuestion && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#185FA5] text-white text-[11px] sm:text-[12px] font-semibold rounded-md hover:bg-[#0C447C] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : '✓ Finalizar'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer - fuera del contenedor flex-1 para que se posicione abajo */}
      <div className="w-full text-center py-4 px-4">
        <p className="text-[10px] text-[#888780]">
          <a
            href="/licencias"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#185FA5] transition-colors"
          >
            Instrumentos y Licencias
          </a>
          {' • '}
          PsicoEvalúa © 2026
        </p>
      </div>
    </div>
  );
}

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

  const question = instrument.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / instrument.questions.length) * 100;
  const isLastQuestion = currentQuestion === instrument.questions.length - 1;
  const allAnswered = Object.keys(responses).length === instrument.questions.length;

  // Determinar opciones de respuesta (pueden ser específicas de la pregunta o globales)
  const responseOptions = question.responseOptions || instrument.responseOptions || [];

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)] p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-[14px] font-bold text-[#1A1917]">{instrument.shortName}</h1>
              <p className="text-[10px] text-[#888780]">{assessment.professional.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780]">PROGRESO</p>
              <p className="text-[14px] font-bold text-[#185FA5]">
                {currentQuestion + 1} / {instrument.questions.length}
              </p>
            </div>
          </div>
          {/* Barra de progreso */}
          <div className="w-full bg-[#F1EFE8] rounded-full h-2">
            <div
              className="bg-[#185FA5] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pregunta */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-8">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-4">
              PREGUNTA {currentQuestion + 1}
            </p>
            <h2 className="text-[18px] font-bold text-[#1A1917] leading-snug mb-6">
              {question.text}
            </h2>

            {question.note && (
              <p className="text-[11px] text-[#888780] bg-[#F1EFE8] rounded-lg p-3 mb-6">
                💡 {question.note}
              </p>
            )}

            <div className="space-y-3">
              {responseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-[12px] font-medium ${
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
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 text-[11px] font-semibold text-[#888780] hover:text-[#1A1917] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            {allAnswered && isLastQuestion && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-[#185FA5] text-white text-[12px] font-semibold rounded-md hover:bg-[#0C447C] transition-colors disabled:opacity-50"
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

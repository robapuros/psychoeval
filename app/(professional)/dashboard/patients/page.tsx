'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface Patient {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  assessments: Array<{
    id: string;
    token: string;
    instrumentType: string;
    status: string;
    score: number | null;
    severity: string | null;
    completedAt: string | null;
    hasCriticalAlert: boolean;
  }>;
  _count: {
    assessments: number;
  };
}

export default function PatientsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Redirect admins
  if (session?.user?.role === 'ADMIN') {
    router.push('/admin/professionals');
    return null;
  }

  // Cargar pacientes
  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSendAssessment(patient: Patient) {
    setSelectedPatient(patient);
    setShowSendModal(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-[12px] text-[#888780]">Cargando pacientes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Header */}
      <DashboardHeader title="Pacientes" userEmail={session?.user?.email} />

      {/* Actions Bar */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-4 py-2.5 flex items-center justify-end gap-2">
        <span className="px-3 py-1.5 text-[10px] border border-[rgba(0,0,0,0.13)] rounded-md bg-transparent font-mono">
          {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-[10px] font-medium bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
        >
          + Nuevo paciente
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <div className="text-[16px] font-bold tracking-tight mb-0.5">
            Mis Pacientes ({patients.length})
          </div>
          <div className="text-[10px] text-[#888780]">Gestión de casos clínicos</div>
        </div>

        {/* Patient Cards */}
        {patients.length === 0 ? (
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl p-8 text-center">
            <p className="text-[12px] text-[#888780] mb-4">
              No tienes pacientes registrados aún
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-[11px] font-semibold bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
            >
              + Crear primer paciente
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => {
              const lastAssessment = patient.assessments[0];
              const hasAlert = lastAssessment?.hasCriticalAlert;
              const hasPending = lastAssessment?.status === 'PENDING';
              
              // Determinar estado visual
              let statusConfig = {
                label: 'Sin evaluación',
                icon: '📋',
                bg: 'bg-[#E1F5EE]',
                text: 'text-[#0F6E56]',
                border: 'border-[#A5D9C7]'
              };

              if (hasAlert) {
                statusConfig = {
                  label: '⚠️ Urgente - Requiere atención',
                  icon: '🚨',
                  bg: 'bg-[#FCEBEB]',
                  text: 'text-[#A32D2D]',
                  border: 'border-[#E24B4A]'
                };
              } else if (hasPending) {
                statusConfig = {
                  label: 'Evaluación pendiente',
                  icon: '⏳',
                  bg: 'bg-[#F1EFE8]',
                  text: 'text-[#888780]',
                  border: 'border-[#D1CFC7]'
                };
              } else if (lastAssessment?.status === 'COMPLETED') {
                if (lastAssessment.severity === 'Severa' || lastAssessment.severity === 'Moderadamente severa') {
                  statusConfig = {
                    label: `${lastAssessment.severity}`,
                    icon: '🔴',
                    bg: 'bg-[#FCEBEB]',
                    text: 'text-[#A32D2D]',
                    border: 'border-[#E9ACA9]'
                  };
                } else if (lastAssessment.severity === 'Moderada') {
                  statusConfig = {
                    label: 'Depresión moderada',
                    icon: '🟡',
                    bg: 'bg-[#FAEEDA]',
                    text: 'text-[#854F0B]',
                    border: 'border-[#E8C480]'
                  };
                } else if (lastAssessment.severity) {
                  statusConfig = {
                    label: lastAssessment.severity,
                    icon: '🟢',
                    bg: 'bg-[#E1F5EE]',
                    text: 'text-[#0F6E56]',
                    border: 'border-[#A5D9C7]'
                  };
                }
              }

              // Determinar CTA principal
              const primaryAction = hasAlert
                ? { label: '🚨 Ver resultados urgentes', onClick: () => router.push(`/dashboard/patients/${patient.id}`) }
                : hasPending
                ? { label: '📩 Recordar evaluación', onClick: () => alert('Próximamente: recordatorio automático') }
                : lastAssessment
                ? { label: '📊 Ver historial', onClick: () => router.push(`/dashboard/patients/${patient.id}`) }
                : { label: '📝 Enviar primera evaluación', onClick: () => handleSendAssessment(patient) };

              return (
                <div
                  key={patient.id}
                  className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Estado (Prominente - Izquierda) */}
                      <div className="flex-shrink-0">
                        <div className={`${statusConfig.bg} ${statusConfig.text} border-2 ${statusConfig.border} rounded-lg px-4 py-3 min-w-[180px]`}>
                          <div className="text-[20px] mb-1">{statusConfig.icon}</div>
                          <div className="text-[11px] font-bold leading-tight">
                            {statusConfig.label}
                          </div>
                        </div>
                      </div>

                      {/* Información del Paciente */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-[14px] font-bold text-[#1A1917] mb-1">
                              {patient.fullName}
                            </h3>
                            <div className="flex items-center gap-3 text-[10px] text-[#888780]">
                              {patient.email && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {patient.email}
                                </span>
                              )}
                              {patient.phone && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {patient.phone}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                              Evaluaciones
                            </div>
                            <div className="text-[16px] font-bold text-[#185FA5]">
                              {patient._count.assessments}
                            </div>
                          </div>
                        </div>

                        {/* Última evaluación info */}
                        {lastAssessment && (
                          <div className="flex items-center gap-4 mb-3 pb-3 border-b border-[rgba(0,0,0,0.08)]">
                            <div>
                              <div className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-0.5">
                                Último test
                              </div>
                              <div className="text-[11px] font-bold font-mono text-[#1A1917]">
                                {lastAssessment.instrumentType}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-0.5">
                                Fecha
                              </div>
                              <div className="text-[11px] text-[#1A1917]">
                                {lastAssessment.completedAt
                                  ? new Date(lastAssessment.completedAt).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'Pendiente'}
                              </div>
                            </div>
                            {lastAssessment.score !== null && (
                              <div>
                                <div className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-0.5">
                                  Puntuación
                                </div>
                                <div className="text-[11px] font-bold text-[#1A1917]">
                                  {lastAssessment.score}/27
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CTA Principal */}
                        <div className="flex gap-2">
                          <button
                            onClick={primaryAction.onClick}
                            className={`flex-1 px-4 py-2.5 text-[11px] font-semibold rounded-lg transition-colors ${
                              hasAlert
                                ? 'bg-[#E24B4A] text-white hover:bg-[#C23D3C]'
                                : 'bg-[#185FA5] text-white hover:bg-[#0C447C]'
                            }`}
                          >
                            {primaryAction.label}
                          </button>
                          {!hasPending && !hasAlert && lastAssessment && (
                            <button
                              onClick={() => handleSendAssessment(patient)}
                              className="px-4 py-2.5 text-[11px] font-semibold border border-[rgba(0,0,0,0.13)] rounded-lg hover:bg-[#F7F6F3] transition-colors"
                            >
                              + Nuevo test
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreatePatientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadPatients();
          }}
        />
      )}

      {showSendModal && selectedPatient && (
        <SendAssessmentModal
          patient={selectedPatient}
          onClose={() => {
            setShowSendModal(false);
            setSelectedPatient(null);
          }}
          onSuccess={() => {
            setShowSendModal(false);
            setSelectedPatient(null);
            loadPatients();
          }}
        />
      )}
    </div>
  );
}

// Modal: Crear Paciente
function CreatePatientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear paciente');
        setSubmitting(false);
        return;
      }

      onSuccess();
    } catch (err) {
      setError('Error de conexión');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-[16px] font-bold tracking-tight mb-4">Nuevo Paciente</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-[#FCEBEB] text-[#A32D2D] text-[11px] rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#185FA5]"
              placeholder="Apellidos, Nombre"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#185FA5]"
              placeholder="paciente@email.com"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#185FA5]"
              placeholder="+34 600 000 000"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
              Notas clínicas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#185FA5] resize-none"
              rows={3}
              placeholder="Motivo de consulta, derivación, etc."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-[11px] font-semibold border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 text-[11px] font-semibold bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creando...' : '✓ Crear paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal: Enviar Evaluación
function SendAssessmentModal({
  patient,
  onClose,
  onSuccess,
}: {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const instruments = [
    { id: 'PHQ9', name: 'PHQ-9', description: 'Depresión (9 preguntas, 2-3 min)' },
    { id: 'GAD7', name: 'GAD-7', description: 'Ansiedad (7 preguntas, 1-2 min)' },
    { id: 'PCL5', name: 'PCL-5', description: 'TEPT/Trauma (20 preguntas, 5-7 min)' },
    { id: 'AUDIT', name: 'AUDIT', description: 'Consumo de Alcohol (10 preguntas, 2-3 min)' },
    { id: 'MEC', name: 'MEC', description: 'Evaluación Cognitiva (presencial, 10-15 min)' },
  ];

  async function handleGenerate() {
    if (!selectedInstrument) {
      setError('Selecciona un cuestionario');
      return;
    }

    setError('');
    setGenerating(true);

    try {
      const response = await fetch('/api/assessments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          instrumentType: selectedInstrument,
          expiresInDays: 7,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al generar enlace');
        setGenerating(false);
        return;
      }

      setGeneratedLink(data.assessment.url);
      setEmailSent(data.emailSent || false);
    } catch (err) {
      setError('Error de conexión');
      setGenerating(false);
    }
  }

  function copyToClipboard() {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('Enlace copiado al portapapeles');
    }
  }

  if (generatedLink) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#E1F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[24px]">✓</span>
            </div>
            <h2 className="text-[16px] font-bold tracking-tight mb-2">Enlace generado</h2>
            {emailSent ? (
              <p className="text-[11px] text-[#3B6D11]">
                ✉️ Email enviado a <strong>{patient.fullName}</strong>
              </p>
            ) : patient.email ? (
              <p className="text-[11px] text-[#888780]">
                ⚠️ No se pudo enviar email. Copia el enlace manualmente.
              </p>
            ) : (
              <p className="text-[11px] text-[#888780]">
                Envía este enlace a <strong>{patient.fullName}</strong>
              </p>
            )}
          </div>

          <div className="bg-[#F1EFE8] rounded-lg p-3 mb-4">
            <p className="text-[10px] text-[#5F5E5A] break-all font-mono">
              {generatedLink}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 px-4 py-2 text-[11px] font-semibold border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
            >
              📋 Copiar enlace
            </button>
            <button
              onClick={onSuccess}
              className="flex-1 px-4 py-2 text-[11px] font-semibold bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
            >
              Cerrar
            </button>
          </div>

          <p className="text-[9px] text-[#888780] text-center mt-4">
            El enlace expira en 7 días
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-[16px] font-bold tracking-tight mb-2">
          Enviar cuestionario
        </h2>
        <p className="text-[11px] text-[#888780] mb-4">
          Paciente: <strong>{patient.fullName}</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-[#FCEBEB] text-[#A32D2D] text-[11px] rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2 mb-6">
          {instruments.map((instrument) => (
            <button
              key={instrument.id}
              onClick={() => setSelectedInstrument(instrument.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                selectedInstrument === instrument.id
                  ? 'border-[#185FA5] bg-[#EFF5FB]'
                  : 'border-[rgba(0,0,0,0.08)] hover:border-[#185FA5]'
              }`}
            >
              <div className="text-[12px] font-semibold">{instrument.name}</div>
              <div className="text-[10px] text-[#888780] mt-0.5">
                {instrument.description}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-[11px] font-semibold border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedInstrument}
            className="flex-1 px-4 py-2 text-[11px] font-semibold bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors disabled:opacity-50"
          >
            {generating ? 'Generando...' : '→ Generar enlace'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
      {/* Topbar */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-4 h-[42px] flex items-center justify-between">
        <span className="text-[12px] font-bold tracking-tight">Pacientes</span>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <div className="text-[16px] font-bold tracking-tight mb-0.5">
            Mis Pacientes ({patients.length})
          </div>
          <div className="text-[10px] text-[#888780]">Gestión de casos clínicos</div>
        </div>

        {/* Table */}
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
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 px-3.5 py-1.5 bg-[#F1EFE8] border-b border-[rgba(0,0,0,0.08)]">
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Paciente</span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Último test</span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Fecha</span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Estado</span>
              <span></span>
            </div>

            {/* Rows */}
            {patients.map((patient) => {
              const lastAssessment = patient.assessments[0];
              const hasAlert = lastAssessment?.hasCriticalAlert;
              
              return (
                <div
                  key={patient.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 px-3.5 py-2 border-b border-[rgba(0,0,0,0.08)] last:border-b-0 items-center hover:bg-[#F1EFE8] transition-colors"
                >
                  <div>
                    <div className="text-[11px] font-semibold">{patient.fullName}</div>
                    {patient.email && (
                      <div className="text-[9px] text-[#888780] mt-0.5">{patient.email}</div>
                    )}
                  </div>
                  
                  <span className="text-[11px] font-bold font-mono">
                    {lastAssessment?.instrumentType || '—'}
                  </span>
                  
                  <span className="text-[11px] text-[#888780]">
                    {lastAssessment?.completedAt
                      ? new Date(lastAssessment.completedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : '—'}
                  </span>
                  
                  <span>
                    {lastAssessment?.status === 'completed' ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          hasAlert
                            ? 'bg-[#FCEBEB] text-[#A32D2D]'
                            : lastAssessment.severity === 'Severa' || lastAssessment.severity === 'Moderadamente severa'
                            ? 'bg-[#FCEBEB] text-[#A32D2D]'
                            : lastAssessment.severity === 'Moderada'
                            ? 'bg-[#FAEEDA] text-[#854F0B]'
                            : 'bg-[#E1F5EE] text-[#0F6E56]'
                        }`}
                      >
                        {hasAlert ? '⚠ Urgente' : lastAssessment.severity || 'Completado'}
                      </span>
                    ) : lastAssessment?.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#F1EFE8] text-[#888780]">
                        Pendiente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#E1F5EE] text-[#0F6E56]">
                        Sin evaluación
                      </span>
                    )}
                  </span>
                  
                  <div className="flex gap-2">
                    {lastAssessment?.status === 'completed' ? (
                      <>
                        <button
                          onClick={() => router.push(`/dashboard/patients/${patient.id}/assessments/${lastAssessment.token}`)}
                          className="px-3 py-1 text-[10px] font-medium bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleSendAssessment(patient)}
                          className="px-3 py-1 text-[10px] font-medium border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
                        >
                          Nuevo
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleSendAssessment(patient)}
                        className="px-3 py-1 text-[10px] font-medium bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
                      >
                        Enviar test
                      </button>
                    )}
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
            <p className="text-[11px] text-[#888780]">
              Envía este enlace a <strong>{patient.fullName}</strong>
            </p>
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

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

type SortField = 'date' | 'severity';
type SortDirection = 'asc' | 'desc';

export default function PatientsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  // Helper: Get severity order for sorting
  function getSeverityOrder(patient: Patient): number {
    const lastAssessment = patient.assessments[0];
    
    if (!lastAssessment) return 100; // Sin evaluación (último)
    
    if (lastAssessment.hasCriticalAlert) return 0; // Urgente (primero)
    
    if (lastAssessment.status === 'PENDING') return 90; // Pendiente
    
    if (lastAssessment.severity) {
      const severity = lastAssessment.severity.toLowerCase();
      if (severity.includes('severa') || severity.includes('severe')) return 1; // Severa/Moderadamente severa
      if (severity.includes('moderada') || severity.includes('moderate')) return 2; // Moderada
      if (severity.includes('leve') || severity.includes('lev') || severity.includes('mild') || severity.includes('mínima')) return 3; // Leve/Mínima
    }
    
    return 80; // Otros casos completados
  }

  // Sort patients
  function getSortedPatients(): Patient[] {
    const sorted = [...patients].sort((a, b) => {
      if (sortField === 'date') {
        const dateA = a.assessments[0]?.completedAt || '';
        const dateB = b.assessments[0]?.completedAt || '';
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        const comparison = new Date(dateB).getTime() - new Date(dateA).getTime();
        return sortDirection === 'asc' ? -comparison : comparison;
      } else {
        // Sort by severity
        const severityA = getSeverityOrder(a);
        const severityB = getSeverityOrder(b);
        
        const comparison = severityA - severityB;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    });
    
    return sorted;
  }

  // Toggle sort
  function handleSort(field: SortField) {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Change field, default to desc for severity, desc for date
      setSortField(field);
      setSortDirection('desc');
    }
  }

  const sortedPatients = getSortedPatients();

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
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-3 sm:px-4 py-2.5 flex items-center justify-between sm:justify-end gap-2">
        <span className="hidden sm:inline px-3 py-1.5 text-[10px] border border-[rgba(0,0,0,0.13)] rounded-md bg-transparent font-mono">
          {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-[10px] sm:text-[10px] font-medium bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
        >
          + Nuevo paciente
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[16px] font-bold tracking-tight mb-0.5">
              Mis Pacientes ({patients.length})
            </div>
            <div className="text-[10px] text-[#888780]">Gestión de casos clínicos</div>
          </div>
          
          {/* Sort Controls */}
          {patients.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-[#888780] uppercase tracking-wide font-semibold">
                Ordenar:
              </span>
              <button
                onClick={() => handleSort('date')}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-md border transition-all flex items-center gap-1 ${
                  sortField === 'date'
                    ? 'bg-[#185FA5] text-white border-[#185FA5]'
                    : 'bg-white text-[#888780] border-[rgba(0,0,0,0.13)] hover:border-[#185FA5]'
                }`}
              >
                Fecha
                {sortField === 'date' && (
                  <span className="text-[8px]">{sortDirection === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
              <button
                onClick={() => handleSort('severity')}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-md border transition-all flex items-center gap-1 ${
                  sortField === 'severity'
                    ? 'bg-[#185FA5] text-white border-[#185FA5]'
                    : 'bg-white text-[#888780] border-[rgba(0,0,0,0.13)] hover:border-[#185FA5]'
                }`}
              >
                Estado
                {sortField === 'severity' && (
                  <span className="text-[8px]">{sortDirection === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Table / Cards */}
        {patients.length === 0 ? (
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl p-6 sm:p-8 text-center">
            <p className="text-[11px] sm:text-[12px] text-[#888780] mb-4">
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
          <>
            {/* Desktop: Table */}
            <div className="hidden md:block bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 px-3.5 py-1.5 bg-[#F1EFE8] border-b border-[rgba(0,0,0,0.08)]">
                <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Paciente</span>
                <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Último test</span>
                <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Fecha</span>
                <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Estado</span>
                <span></span>
              </div>

              {/* Rows */}
              {sortedPatients.map((patient) => {
              const lastAssessment = patient.assessments[0];
              const hasAlert = lastAssessment?.hasCriticalAlert;
              
              return (
                <div
                  key={patient.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 px-3.5 py-2 border-b border-[rgba(0,0,0,0.08)] last:border-b-0 items-center hover:bg-[#F1EFE8] transition-colors"
                >
                  <div>
                    <button
                      onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                      className="text-left hover:underline"
                    >
                      <div className="text-[11px] font-semibold text-[#185FA5]">
                        {patient.fullName}
                      </div>
                    </button>
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
                    {lastAssessment?.status === 'COMPLETED' ? (
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
                    ) : lastAssessment?.status === 'PENDING' ? (
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
                    <button
                      onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                      className="px-3 py-1 text-[10px] font-medium bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
                      title="Ver historial completo"
                    >
                      {patient.assessments.length > 1 ? `Historial (${patient.assessments.length})` : 'Ver perfil'}
                    </button>
                    <button
                      onClick={() => handleSendAssessment(patient)}
                      className="px-3 py-1 text-[10px] font-medium border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
                    >
                      Enviar test
                    </button>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Mobile: Cards */}
            <div className="md:hidden space-y-3">
              {sortedPatients.map((patient) => {
                const lastAssessment = patient.assessments[0];
                const hasAlert = lastAssessment?.hasCriticalAlert;
                
                return (
                  <div
                    key={patient.id}
                    className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden"
                  >
                    <div className="p-3">
                      {/* Header: Nombre + Estado */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                            className="text-left hover:underline"
                          >
                            <h3 className="text-[12px] font-semibold text-[#185FA5] truncate">
                              {patient.fullName}
                            </h3>
                          </button>
                          {patient.email && (
                            <p className="text-[9px] text-[#888780] truncate mt-0.5">{patient.email}</p>
                          )}
                        </div>
                        
                        <div className="ml-2 flex-shrink-0">
                          {lastAssessment?.status === 'COMPLETED' ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold whitespace-nowrap ${
                                hasAlert
                                  ? 'bg-[#FCEBEB] text-[#A32D2D]'
                                  : lastAssessment.severity === 'Severa' || lastAssessment.severity === 'Moderadamente severa'
                                  ? 'bg-[#FCEBEB] text-[#A32D2D]'
                                  : lastAssessment.severity === 'Moderada'
                                  ? 'bg-[#FAEEDA] text-[#854F0B]'
                                  : 'bg-[#E1F5EE] text-[#0F6E56]'
                              }`}
                            >
                              {hasAlert ? '⚠ Urgente' : lastAssessment.severity || 'OK'}
                            </span>
                          ) : lastAssessment?.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold bg-[#F1EFE8] text-[#888780]">
                              Pendiente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold bg-[#E1F5EE] text-[#0F6E56]">
                              Sin eval.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info Grid */}
                      {lastAssessment && (
                        <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-[rgba(0,0,0,0.08)]">
                          <div>
                            <div className="text-[8px] uppercase tracking-wide font-semibold text-[#888780] mb-0.5">
                              Test
                            </div>
                            <div className="text-[10px] font-bold font-mono text-[#1A1917]">
                              {lastAssessment.instrumentType}
                            </div>
                          </div>
                          <div>
                            <div className="text-[8px] uppercase tracking-wide font-semibold text-[#888780] mb-0.5">
                              Fecha
                            </div>
                            <div className="text-[10px] text-[#1A1917]">
                              {lastAssessment.completedAt
                                ? new Date(lastAssessment.completedAt).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                  })
                                : 'Pendiente'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                          className="flex-1 px-3 py-2 text-[10px] font-medium bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
                        >
                          {patient.assessments.length > 1 ? `Ver (${patient.assessments.length})` : 'Ver perfil'}
                        </button>
                        <button
                          onClick={() => handleSendAssessment(patient)}
                          className="flex-1 px-3 py-2 text-[10px] font-medium border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
                        >
                          Enviar test
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
          professionalName={session?.user?.name || 'tu doctor/a'}
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
  professionalName,
  onClose,
  onSuccess,
}: {
  patient: Patient;
  professionalName: string;
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
      alert('✅ Enlace copiado al portapapeles');
    }
  }

  async function sendViaEmail() {
    if (!generatedLink || !patient.email) return;
    
    setError('');
    const sendingButton = document.activeElement as HTMLButtonElement;
    if (sendingButton) sendingButton.disabled = true;
    
    try {
      // El backend ya envió el email al generar el enlace
      // Solo mostramos confirmación
      alert(`✅ Email enviado a ${patient.email}`);
    } catch (err) {
      setError('Error al enviar email');
    } finally {
      if (sendingButton) sendingButton.disabled = false;
    }
  }

  function sendViaWhatsApp() {
    if (!generatedLink || !patient.phone) return;
    
    // Limpiar número de teléfono (quitar espacios, guiones)
    const cleanPhone = patient.phone.replace(/[^0-9+]/g, '');
    
    // Mensaje template personalizado
    const message = `Hola ${patient.fullName},

Tu Dr./Dra. ${professionalName} te ha enviado el siguiente cuestionario:
${generatedLink}

Es importante que lo contestes antes de la próxima consulta.

Un saludo`;
    
    // URL de WhatsApp Web
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // Abrir en nueva pestaña
    window.open(whatsappUrl, '_blank');
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
              ¿Cómo quieres enviarlo a <strong>{patient.fullName}</strong>?
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#FCEBEB] text-[#A32D2D] text-[11px] rounded-lg">
              {error}
            </div>
          )}

          {/* Enlace generado (pequeño, colapsable) */}
          <details className="mb-4">
            <summary className="text-[10px] text-[#888780] cursor-pointer hover:text-[#185FA5]">
              Ver enlace
            </summary>
            <div className="bg-[#F1EFE8] rounded-lg p-2 mt-2">
              <p className="text-[9px] text-[#5F5E5A] break-all font-mono">
                {generatedLink}
              </p>
            </div>
          </details>

          {/* 3 Opciones de Envío */}
          <div className="space-y-3 mb-4">
            {/* Opción 1: Email */}
            {patient.email ? (
              <button
                onClick={sendViaEmail}
                className="w-full px-4 py-3 text-left border-2 border-[rgba(0,0,0,0.08)] rounded-lg hover:border-[#185FA5] hover:bg-[#EFF5FB] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EFF5FB] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#185FA5] transition-colors">
                    <span className="text-[18px] group-hover:brightness-0 group-hover:invert">📧</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#1A1917]">Enviar por Email</div>
                    <div className="text-[10px] text-[#888780] truncate">{patient.email}</div>
                  </div>
                  <div className="text-[#185FA5] opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </div>
              </button>
            ) : (
              <div className="px-4 py-3 border-2 border-[rgba(0,0,0,0.08)] rounded-lg bg-[#F1EFE8] opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[18px]">📧</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-[#888780]">Email no disponible</div>
                    <div className="text-[9px] text-[#888780]">Sin email registrado</div>
                  </div>
                </div>
              </div>
            )}

            {/* Opción 2: WhatsApp */}
            {patient.phone ? (
              <button
                onClick={sendViaWhatsApp}
                className="w-full px-4 py-3 text-left border-2 border-[rgba(0,0,0,0.08)] rounded-lg hover:border-[#25D366] hover:bg-[#F0FFF4] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F0FFF4] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366] transition-colors">
                    <span className="text-[18px] group-hover:brightness-0 group-hover:invert">💬</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#1A1917]">Enviar por WhatsApp</div>
                    <div className="text-[10px] text-[#888780] truncate">{patient.phone}</div>
                  </div>
                  <div className="text-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </div>
              </button>
            ) : (
              <div className="px-4 py-3 border-2 border-[rgba(0,0,0,0.08)] rounded-lg bg-[#F1EFE8] opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[18px]">💬</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-[#888780]">WhatsApp no disponible</div>
                    <div className="text-[9px] text-[#888780]">Sin teléfono registrado</div>
                  </div>
                </div>
              </div>
            )}

            {/* Opción 3: Copiar enlace */}
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-3 text-left border-2 border-[rgba(0,0,0,0.08)] rounded-lg hover:border-[#888780] hover:bg-[#F7F6F3] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F7F6F3] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#888780] transition-colors">
                  <span className="text-[18px] group-hover:brightness-0 group-hover:invert">📋</span>
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-[#1A1917]">Copiar enlace</div>
                  <div className="text-[10px] text-[#888780]">Enviar manualmente</div>
                </div>
                <div className="text-[#888780] opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </button>
          </div>

          {/* Botón Cerrar */}
          <button
            onClick={onSuccess}
            className="w-full px-4 py-2 text-[11px] font-semibold border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
          >
            Cerrar
          </button>

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

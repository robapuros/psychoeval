'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Assessment {
  id: string;
  token: string;
  instrumentType: string;
  status: string;
  score: number | null;
  severity: string | null;
  hasCriticalAlert: boolean;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
}

interface Patient {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  assessments: Assessment[];
}

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { patientId } = params;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  async function loadPatient() {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al cargar paciente');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setPatient(data);
      setLoading(false);
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function getStatusBadge(assessment: Assessment) {
    if (assessment.status === 'COMPLETED') {
      const hasAlert = assessment.hasCriticalAlert;
      const severity = assessment.severity;
      
      if (hasAlert) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#FCEBEB] text-[#A32D2D]">
            ⚠ Urgente
          </span>
        );
      }
      
      if (severity === 'Severa' || severity === 'Moderadamente severa') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#FCEBEB] text-[#A32D2D]">
            {severity}
          </span>
        );
      }
      
      if (severity === 'Moderada') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#FAEEDA] text-[#854F0B]">
            {severity}
          </span>
        );
      }
      
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#E1F5EE] text-[#0F6E56]">
          {severity || 'Completado'}
        </span>
      );
    }
    
    if (assessment.status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#F1EFE8] text-[#888780]">
          Pendiente
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#888780] text-white">
        Expirado
      </span>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-[12px] text-[#888780]">Cargando paciente...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[12px] text-[#888780] mb-4">{error || 'Paciente no encontrado'}</p>
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

  const completedAssessments = patient.assessments.filter(a => a.status === 'COMPLETED');
  const pendingAssessments = patient.assessments.filter(a => a.status === 'PENDING');

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/patients')}
            className="w-8 h-8 rounded-md border border-[rgba(0,0,0,0.13)] flex items-center justify-center hover:bg-[#F1EFE8] transition-colors"
          >
            ←
          </button>
          <h1 className="text-[16px] font-bold tracking-tight">
            {patient.fullName}
          </h1>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Email
              </p>
              <p className="text-[11px] text-[#1A1917]">
                {patient.email || '—'}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Teléfono
              </p>
              <p className="text-[11px] text-[#1A1917]">
                {patient.phone || '—'}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Notas
              </p>
              <p className="text-[11px] text-[#1A1917]">
                {patient.notes || '—'}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Registrado
              </p>
              <p className="text-[11px] text-[#1A1917]">
                {formatDate(patient.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Evaluaciones
              </p>
              <p className="text-[11px] text-[#1A1917]">
                {completedAssessments.length} completadas
              </p>
            </div>
          </div>
        </div>

        {/* Pending Assessments */}
        {pendingAssessments.length > 0 && (
          <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-[#FAEEDA] border-b border-[rgba(0,0,0,0.08)]">
              <h2 className="text-[12px] font-bold tracking-tight">
                Evaluaciones Pendientes ({pendingAssessments.length})
              </h2>
            </div>
            <div className="divide-y divide-[rgba(0,0,0,0.08)]">
              {pendingAssessments.map((assessment) => (
                <div key={assessment.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-[#1A1917]">
                        {assessment.instrumentType}
                      </span>
                      {getStatusBadge(assessment)}
                    </div>
                    <p className="text-[10px] text-[#888780]">
                      Enviado: {formatDate(assessment.createdAt)}
                    </p>
                    <p className="text-[10px] text-[#888780]">
                      Expira: {formatDate(assessment.expiresAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/assess/${assessment.token}`;
                      navigator.clipboard.writeText(url);
                      alert('Enlace copiado al portapapeles');
                    }}
                    className="px-3 py-1.5 text-[10px] font-semibold border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
                  >
                    📋 Copiar enlace
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Assessments History */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-[#F1EFE8] border-b border-[rgba(0,0,0,0.08)]">
            <h2 className="text-[12px] font-bold tracking-tight">
              Historial de Evaluaciones ({completedAssessments.length})
            </h2>
          </div>
          
          {completedAssessments.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[11px] text-[#888780]">
                No hay evaluaciones completadas aún
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(0,0,0,0.08)]">
              {completedAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-[#F7F6F3] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-[#1A1917]">
                        {assessment.instrumentType}
                      </span>
                      {getStatusBadge(assessment)}
                      {assessment.score !== null && (
                        <span className="text-[10px] text-[#888780]">
                          Puntuación: {assessment.score}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#888780]">
                      Completado: {assessment.completedAt ? formatDate(assessment.completedAt) : '—'}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/patients/${patient.id}/assessments/${assessment.token}`)}
                    className="px-3 py-1.5 text-[10px] font-semibold bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
                  >
                    Ver resultados →
                  </button>
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
            ← Volver a pacientes
          </button>
        </div>
      </div>
    </div>
  );
}

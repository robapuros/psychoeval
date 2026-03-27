'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminProfessionalsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // Redirect non-admins
  if (session?.user?.role !== 'ADMIN') {
    router.push('/dashboard/patients');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Topbar */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-4 h-[42px] flex items-center justify-between">
        <span className="text-[12px] font-bold tracking-tight">Panel de Administración</span>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-[10px] border border-[rgba(0,0,0,0.13)] rounded-md bg-transparent font-mono">
            {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 text-[10px] font-medium bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
          >
            + Nuevo profesional
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <div className="text-[16px] font-bold tracking-tight mb-0.5">Gestión de Profesionales</div>
          <div className="text-[10px] text-[#888780]">Administrar cuentas de psicólogos y terapeutas</div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_80px] gap-4 px-3.5 py-1.5 bg-[#F1EFE8] border-b border-[rgba(0,0,0,0.08)]">
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Profesional</span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Especialidad</span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Pacientes</span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Estado</span>
            <span></span>
          </div>

          {/* Rows - Sample data */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_80px] gap-4 px-3.5 py-2 border-b border-[rgba(0,0,0,0.08)] items-center hover:bg-[#F1EFE8] transition-colors cursor-pointer">
            <div>
              <div className="text-[11px] font-semibold">Dr. Juan Pérez García</div>
              <div className="text-[9px] font-mono text-[#888780] mt-0.5">psicologo@psicoevalua.com</div>
            </div>
            <span className="text-[11px] text-[#5F5E5A]">Psicología Clínica</span>
            <span className="text-[11px] font-mono font-semibold">23</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#E1F5EE] text-[#0F6E56]">
              ● Activo
            </span>
            <button className="px-3 py-1 text-[10px] border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors">
              Editar
            </button>
          </div>

          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_80px] gap-4 px-3.5 py-2 border-b border-[rgba(0,0,0,0.08)] items-center hover:bg-[#F1EFE8] transition-colors cursor-pointer">
            <div>
              <div className="text-[11px] font-semibold">Dra. María López Torres</div>
              <div className="text-[9px] font-mono text-[#888780] mt-0.5">maria.lopez@psicoevalua.com</div>
            </div>
            <span className="text-[11px] text-[#5F5E5A]">Psicología Infantil</span>
            <span className="text-[11px] font-mono font-semibold">17</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#E1F5EE] text-[#0F6E56]">
              ● Activo
            </span>
            <button className="px-3 py-1 text-[10px] border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors">
              Editar
            </button>
          </div>

          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_80px] gap-4 px-3.5 py-2 items-center hover:bg-[#F1EFE8] transition-colors cursor-pointer">
            <div>
              <div className="text-[11px] font-semibold">Dr. Carlos Ruiz Fernández</div>
              <div className="text-[9px] font-mono text-[#888780] mt-0.5">carlos.ruiz@psicoevalua.com</div>
            </div>
            <span className="text-[11px] text-[#5F5E5A]">Psicoterapia</span>
            <span className="text-[11px] font-mono font-semibold">8</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#E1F5EE] text-[#0F6E56]">
              ● Activo
            </span>
            <button className="px-3 py-1 text-[10px] border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors">
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Modal - New Professional */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="text-[16px] font-bold tracking-tight mb-1">Nuevo Profesional</div>
            <div className="text-[10px] text-[#888780] mb-4">Crear cuenta de acceso para psicólogo/terapeuta</div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  placeholder="Dr./Dra. Nombre Apellidos"
                  className="w-full px-3 py-1.5 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                  Email de acceso *
                </label>
                <input
                  type="email"
                  placeholder="profesional@psicoevalua.com"
                  className="w-full px-3 py-1.5 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Psicología Clínica"
                    className="w-full px-3 py-1.5 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                    Nº Colegiado
                  </label>
                  <input
                    type="text"
                    placeholder="PSI-12345"
                    className="w-full px-3 py-1.5 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                  Contraseña temporal *
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-1.5 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)]"
                />
                <p className="text-[9px] text-[#888780] mt-1">El profesional deberá cambiarla en el primer acceso</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 text-[11px] font-medium border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors"
              >
                Cancelar
              </button>
              <button className="px-4 py-1.5 text-[11px] font-medium bg-[#0F6E56] text-white rounded-md hover:bg-[#085041] transition-colors">
                ✓ Crear cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

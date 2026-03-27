'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/button';

export default function PatientsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Topbar */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-4 h-[42px] flex items-center justify-between">
        <span className="text-[12px] font-bold tracking-tight">Pacientes</span>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-[10px] border border-[rgba(0,0,0,0.13)] rounded-md bg-transparent">
            27 mar 2026
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 text-[10px] font-medium bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
          >
            + Nuevo paciente
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <div className="text-[16px] font-bold tracking-tight mb-0.5">Pacientes</div>
          <div className="text-[10px] text-[#888780]">47 registrados</div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_68px] gap-4 px-3.5 py-1.5 bg-[#F1EFE8] border-b border-[rgba(0,0,0,0.08)]">
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Paciente</span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Último test</span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Fecha</span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#888780]">Score</span>
            <span></span>
          </div>

          {/* Rows - Sample data */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_68px] gap-4 px-3.5 py-2 border-b border-[rgba(0,0,0,0.08)] items-center hover:bg-[#F1EFE8] transition-colors cursor-pointer">
            <div>
              <div className="text-[11px] font-semibold">García Martín, Luis</div>
              <div className="text-[9px] font-mono text-[#888780] mt-0.5">#PAC-0234</div>
            </div>
            <span className="text-[11px] font-bold font-mono">PHQ-9</span>
            <span className="text-[11px] text-[#888780]">Hoy</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#FCEBEB] text-[#A32D2D]">
              23/27 ⚠
            </span>
            <button className="px-3 py-1 text-[10px] border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors">
              Ver
            </button>
          </div>

          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_68px] gap-4 px-3.5 py-2 border-b border-[rgba(0,0,0,0.08)] items-center hover:bg-[#F1EFE8] transition-colors cursor-pointer">
            <div>
              <div className="text-[11px] font-semibold">Fernández López, Ana</div>
              <div className="text-[9px] font-mono text-[#888780] mt-0.5">#PAC-0189</div>
            </div>
            <span className="text-[11px] font-bold font-mono">GAD-7</span>
            <span className="text-[11px] text-[#888780]">Ayer</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#FAEEDA] text-[#854F0B]">
              12/21
            </span>
            <button className="px-3 py-1 text-[10px] border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors">
              Ver
            </button>
          </div>

          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_68px] gap-4 px-3.5 py-2 items-center hover:bg-[#F1EFE8] transition-colors cursor-pointer">
            <div>
              <div className="text-[11px] font-semibold">Martínez Sanz, Carlos</div>
              <div className="text-[9px] font-mono text-[#888780] mt-0.5">#PAC-0301</div>
            </div>
            <span className="text-[11px] font-bold font-mono">—</span>
            <span className="text-[11px] text-[#888780]">21 mar</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#E1F5EE] text-[#0F6E56]">
              Nueva
            </span>
            <button className="px-3 py-1 text-[10px] border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#F1EFE8] transition-colors">
              Enviar
            </button>
          </div>
        </div>
      </div>

      {/* Modal - New Patient */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="text-[16px] font-bold tracking-tight mb-1">Nuevo paciente</div>
            <div className="text-[10px] text-[#888780] mb-4">Información básica del paciente</div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  placeholder="Apellidos, Nombre"
                  className="w-full px-3 py-1.5 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="paciente@email.com"
                    className="w-full px-3 py-1.5 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="+34 600 000 000"
                    className="w-full px-3 py-1.5 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                  Notas clínicas
                </label>
                <textarea
                  rows={3}
                  placeholder="Contexto, derivación, observaciones..."
                  className="w-full px-3 py-1.5 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)] resize-none"
                />
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
                ✓ Crear paciente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

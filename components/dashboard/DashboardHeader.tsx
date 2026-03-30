'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface DashboardHeaderProps {
  title: string;
  userEmail?: string;
}

export default function DashboardHeader({ title, userEmail }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-4 h-[50px] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="PsicoEvalúa"
          width={120}
          height={30}
          className="h-[28px] w-auto"
          priority
        />
        <span className="text-[11px] text-[#888780]">|</span>
        <span className="text-[11px] font-medium text-[#888780]">{title}</span>
      </div>

      {/* Menu Hamburguesa */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 flex items-center justify-center hover:bg-[#F7F6F3] rounded transition-colors"
          aria-label="Menú"
        >
          <svg
            className="w-5 h-5 text-[#1A1917]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-lg z-20 overflow-hidden">
              {/* User Info */}
              {userEmail && (
                <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.08)]">
                  <div className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                    Sesión activa
                  </div>
                  <div className="text-[11px] text-[#1A1917] truncate">
                    {userEmail}
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/licencias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2.5 text-[11px] text-[#1A1917] hover:bg-[#F7F6F3] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-[#888780]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Instrumentos y Licencias</span>
                  </div>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-[11px] text-[#E24B4A] hover:bg-[#FFF9F9] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

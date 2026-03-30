'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-[12px] text-[#888780]">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  async function handleLogout() {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Header with logout */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.08)] px-4 h-[50px] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-[14px] font-bold tracking-tight">PsicoEvalúa Admin</h1>
          <nav className="flex gap-2">
            <button
              onClick={() => router.push('/admin/professionals')}
              className="px-3 py-1.5 text-[10px] font-medium rounded-md hover:bg-[#F1EFE8] transition-colors"
            >
              Profesionales
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] font-semibold">{session.user?.name}</div>
            <div className="text-[9px] text-[#888780] uppercase">Admin</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-[10px] font-medium border border-[rgba(0,0,0,0.13)] rounded-md hover:bg-[#FCEBEB] hover:text-[#A32D2D] hover:border-[#A32D2D] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}

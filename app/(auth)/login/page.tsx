'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/shared/input';
import { Button } from '@/components/shared/button';
import { Alert } from '@/components/shared/alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email o contraseña incorrectos');
      } else if (result?.ok) {
        router.push('/dashboard/patients');
        router.refresh();
      }
    } catch (err) {
      setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-bold tracking-tight text-[#1A1917]">PsicoSnap</h1>
            <p className="text-[11px] text-[#888780] mt-1 uppercase tracking-wide font-semibold">Acceso Profesionales</p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.email@ejemplo.com"
                required
                className="w-full px-3 py-2 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wide text-[#888780] mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 text-[12px] border border-[rgba(0,0,0,0.13)] rounded-md focus:outline-none focus:border-[#378ADD] focus:ring-2 focus:ring-[rgba(55,138,221,0.1)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 text-[12px] font-semibold bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[10px] text-[#888780] hover:text-[#5F5E5A] uppercase tracking-wide font-semibold">
              ← Volver al inicio
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[9px] text-[#888780]">
            ¿Problemas de acceso? Contacta con el administrador
          </p>
        </div>
      </div>
    </div>
  );
}

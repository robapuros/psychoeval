import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-[#FAEEDA] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[24px]">🔒</span>
            </div>
            <h1 className="text-[18px] font-bold tracking-tight text-[#1A1917] mb-2">
              Registro Restringido
            </h1>
            <p className="text-[11px] text-[#888780] leading-relaxed">
              El registro de nuevas cuentas está controlado por el administrador del sistema.
            </p>
          </div>

          <div className="bg-[#F1EFE8] rounded-lg p-4 mb-6">
            <p className="text-[10px] text-[#5F5E5A] leading-relaxed">
              <strong className="font-semibold">¿Necesitas una cuenta?</strong>
              <br />
              Contacta con el administrador de tu centro para solicitar acceso a la plataforma.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-block w-full px-4 py-2.5 text-[12px] font-semibold bg-[#185FA5] text-white rounded-md hover:bg-[#0C447C] transition-colors"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

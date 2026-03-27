export default function CompletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] p-4">
      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-8 max-w-md text-center">
        <div className="w-20 h-20 bg-[#E5F3ED] rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-[32px]">✓</span>
        </div>
        
        <h1 className="text-[20px] font-bold tracking-tight text-[#1A1917] mb-3">
          Evaluación completada
        </h1>
        
        <p className="text-[12px] text-[#888780] leading-relaxed mb-6">
          Gracias por completar el cuestionario. Tu profesional ha sido notificado y revisará los resultados pronto.
        </p>

        <div className="bg-[#F1EFE8] rounded-lg p-4 mb-6">
          <p className="text-[11px] text-[#5F5E5A] leading-relaxed">
            <strong className="font-semibold">¿Qué sucede ahora?</strong>
            <br />
            Tu profesional analizará tus respuestas y se pondrá en contacto contigo para discutir los resultados en tu próxima sesión.
          </p>
        </div>

        <div className="border-t border-[rgba(0,0,0,0.08)] pt-4">
          <p className="text-[10px] text-[#888780]">
            Puedes cerrar esta ventana
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function LicenciasPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-[14px] font-bold tracking-tight text-[#185FA5]">
            PsicoSnap
          </Link>
          <Link
            href="/login"
            className="text-[11px] font-semibold text-[#888780] hover:text-[#1A1917] transition-colors"
          >
            Iniciar sesión →
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-6">
          <h1 className="text-[20px] font-bold tracking-tight mb-4">
            Instrumentos y Licencias
          </h1>
          <p className="text-[12px] text-[#888780] leading-relaxed mb-6">
            PsicoSnap utiliza únicamente instrumentos psicométricos validados y de dominio público
            o con licencia de uso clínico permitida. A continuación, se detallan las fuentes,
            autores y licencias de cada cuestionario implementado en la plataforma.
          </p>
        </div>

        {/* PHQ-9 */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-6">
          <h2 className="text-[16px] font-bold tracking-tight mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#185FA5] text-white text-[11px] font-bold flex items-center justify-center">
              1
            </span>
            PHQ-9 (Patient Health Questionnaire-9)
          </h2>
          
          <div className="space-y-3 text-[12px]">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Descripción
              </p>
              <p className="text-[#1A1917] leading-relaxed">
                Cuestionario de 9 ítems para la evaluación de síntomas depresivos basado en los
                criterios DSM-IV. Ampliamente validado en población hispanohablante.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Autores
              </p>
              <p className="text-[#1A1917]">
                Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001)
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Licencia
              </p>
              <p className="text-[#1A1917] leading-relaxed">
                <strong>Dominio público.</strong> El PHQ-9 fue desarrollado por Pfizer Inc. y está
                disponible sin coste para uso clínico e investigación. No se requiere permiso para
                su uso, reproducción o distribución.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Referencia
              </p>
              <p className="text-[#1A1917] text-[11px] font-mono">
                Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: validity of a
                brief depression severity measure. <em>Journal of General Internal Medicine</em>,
                16(9), 606-613. doi:10.1046/j.1525-1497.2001.016009606.x
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Validación en Español
              </p>
              <p className="text-[#1A1917] text-[11px] font-mono">
                Diez-Quevedo, C., Rangil, T., Sanchez-Planell, L., Kroenke, K., & Spitzer, R. L.
                (2001). Validation and utility of the patient health questionnaire in diagnosing
                mental disorders in 1003 general hospital Spanish inpatients.{' '}
                <em>Psychosomatic Medicine</em>, 63(4), 679-686.
              </p>
            </div>
          </div>
        </div>

        {/* GAD-7 */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-6">
          <h2 className="text-[16px] font-bold tracking-tight mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#185FA5] text-white text-[11px] font-bold flex items-center justify-center">
              2
            </span>
            GAD-7 (Generalized Anxiety Disorder-7)
          </h2>
          
          <div className="space-y-3 text-[12px]">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Descripción
              </p>
              <p className="text-[#1A1917] leading-relaxed">
                Cuestionario de 7 ítems diseñado para medir la severidad del trastorno de ansiedad
                generalizada. Herramienta de screening breve y eficaz.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Autores
              </p>
              <p className="text-[#1A1917]">
                Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006)
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Licencia
              </p>
              <p className="text-[#1A1917] leading-relaxed">
                <strong>Dominio público.</strong> El GAD-7 está disponible sin restricciones para
                uso clínico, educativo y de investigación. No se requiere autorización para su uso.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Referencia
              </p>
              <p className="text-[#1A1917] text-[11px] font-mono">
                Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006). A brief measure
                for assessing generalized anxiety disorder: the GAD-7. <em>Archives of Internal Medicine</em>,
                166(10), 1092-1097. doi:10.1001/archinte.166.10.1092
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Validación en Español
              </p>
              <p className="text-[#1A1917] text-[11px] font-mono">
                García-Campayo, J., Zamorano, E., Ruiz, M. A., Pardo, A., Pérez-Páramo, M.,
                López-Gómez, V., ... & Rejas, J. (2010). Cultural adaptation into Spanish of the
                generalized anxiety disorder-7 (GAD-7) scale as a screening tool.{' '}
                <em>Health and Quality of Life Outcomes</em>, 8(1), 8.
              </p>
            </div>
          </div>
        </div>

        {/* PCL-5 */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-6">
          <h2 className="text-[16px] font-bold tracking-tight mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#185FA5] text-white text-[11px] font-bold flex items-center justify-center">
              3
            </span>
            PCL-5 (PTSD Checklist for DSM-5)
          </h2>
          
          <div className="space-y-3 text-[12px]">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Descripción
              </p>
              <p className="text-[#1A1917] leading-relaxed">
                Escala de 20 ítems para evaluar síntomas de trastorno de estrés postraumático (TEPT)
                según los criterios DSM-5.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Autores
              </p>
              <p className="text-[#1A1917]">
                Weathers, F. W., Litz, B. T., Keane, T. M., Palmieri, P. A., Marx, B. P., & Schnurr, P. P. (2013)
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Licencia
              </p>
              <p className="text-[#1A1917] leading-relaxed">
                <strong>Dominio público.</strong> Desarrollado por el National Center for PTSD (VA).
                Disponible gratuitamente para uso clínico e investigación sin necesidad de permiso.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Referencia
              </p>
              <p className="text-[#1A1917] text-[11px] font-mono">
                Weathers, F. W., Litz, B. T., Keane, T. M., Palmieri, P. A., Marx, B. P., & Schnurr,
                P. P. (2013). The PTSD Checklist for DSM-5 (PCL-5). Scale available from the
                National Center for PTSD at www.ptsd.va.gov
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Fuente Oficial
              </p>
              <p className="text-[#1A1917] text-[11px]">
                <a
                  href="https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#185FA5] hover:underline"
                >
                  National Center for PTSD
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* AUDIT */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-6">
          <h2 className="text-[16px] font-bold tracking-tight mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#185FA5] text-white text-[11px] font-bold flex items-center justify-center">
              4
            </span>
            AUDIT (Alcohol Use Disorders Identification Test)
          </h2>
          
          <div className="space-y-3 text-[12px]">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Descripción
              </p>
              <p className="text-[#1A1917] leading-relaxed">
                Cuestionario de 10 ítems desarrollado por la OMS para identificar trastornos por
                consumo de alcohol. Herramienta de screening internacional estándar.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Autor/Organización
              </p>
              <p className="text-[#1A1917]">
                Organización Mundial de la Salud (OMS/WHO)
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Licencia
              </p>
              <p className="text-[#1A1917] leading-relaxed">
                <strong>Dominio público.</strong> Publicado por la OMS y disponible gratuitamente
                para uso clínico, educativo e investigación. No requiere autorización.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Referencia
              </p>
              <p className="text-[#1A1917] text-[11px] font-mono">
                Babor, T. F., Higgins-Biddle, J. C., Saunders, J. B., & Monteiro, M. G. (2001).
                AUDIT: The Alcohol Use Disorders Identification Test. Guidelines for Use in Primary
                Care (2nd ed.). <em>World Health Organization</em>.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Fuente Oficial
              </p>
              <p className="text-[#1A1917] text-[11px]">
                <a
                  href="https://www.who.int/publications/i/item/WHO-MSD-MSB-01.6a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#185FA5] hover:underline"
                >
                  WHO Publications
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* MEC */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm p-6">
          <h2 className="text-[16px] font-bold tracking-tight mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#185FA5] text-white text-[11px] font-bold flex items-center justify-center">
              5
            </span>
            MEC (Mini-Examen Cognoscitivo de Lobo)
          </h2>
          
          <div className="space-y-3 text-[12px]">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Descripción
              </p>
              <p className="text-[#1A1917] leading-relaxed">
                Versión española validada del Mini-Mental State Examination (MMSE) de Folstein.
                Instrumento clásico para la evaluación del deterioro cognitivo.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Autores
              </p>
              <p className="text-[#1A1917]">
                Lobo, A., Ezquerra, J., Gómez Burgada, F., Sala, J. M., & Seva Díaz, A. (1979)
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Licencia
              </p>
              <p className="text-[#1A1917] leading-relaxed">
                <strong>Uso clínico permitido.</strong> La versión MEC de Lobo es de uso libre en
                la práctica clínica en España y países hispanohablantes. Se recomienda citar la
                fuente original en publicaciones.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#888780] mb-1">
                Referencia
              </p>
              <p className="text-[#1A1917] text-[11px] font-mono">
                Lobo, A., Saz, P., Marcos, G., Día, J. L., de la Cámara, C., Ventura, T., ... &
                Aznar, S. (1999). Revalidación y normalización del Mini-Examen Cognoscitivo (primera
                versión en castellano del Mini-Mental Status Examination) en la población general
                geriátrica. <em>Medicina Clínica</em>, 112(20), 767-774.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Legal */}
        <div className="bg-[#FFF9F9] rounded-xl border border-[#E24B4A] p-6">
          <h2 className="text-[14px] font-bold tracking-tight mb-3 text-[#A32D2D]">
            ⚖️ Aviso Legal y Disclaimer
          </h2>
          <div className="space-y-2 text-[11px] text-[#A32D2D] leading-relaxed">
            <p>
              <strong>Uso exclusivo para profesionales de la salud mental:</strong> PsicoSnap está
              diseñado para ser utilizado únicamente por psicólogos colegiados, psiquiatras y otros
              profesionales de la salud mental debidamente acreditados.
            </p>
            <p>
              <strong>Herramienta de apoyo diagnóstico:</strong> Los resultados de los cuestionarios
              deben interpretarse siempre en el contexto de una evaluación clínica completa. Ningún
              instrumento psicométrico sustituye el juicio clínico profesional.
            </p>
            <p>
              <strong>Responsabilidad del profesional:</strong> El profesional es responsable de
              verificar que el instrumento seleccionado sea apropiado para cada paciente y contexto
              clínico, así como de interpretar correctamente los resultados.
            </p>
            <p>
              <strong>Confidencialidad y protección de datos:</strong> PsicoSnap cumple con el
              RGPD (UE 2016/679) y la LOPDGDD. Los datos de pacientes son tratados con los máximos
              estándares de seguridad y confidencialidad.
            </p>
            <p>
              <strong>Actualización de instrumentos:</strong> Los cuestionarios implementados
              corresponden a las versiones publicadas más recientes y validadas en población
              hispanohablante. Cualquier actualización o revisión de los instrumentos originales
              será incorporada siguiendo las recomendaciones de los autores.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[10px] text-[#888780]">
            © 2026 PsicoSnap • Plataforma de evaluación psicológica digital
          </p>
          <p className="text-[10px] text-[#888780] mt-1">
            Para consultas sobre licencias:{' '}
            <a href="mailto:soporte@psicoevalua.com" className="text-[#185FA5] hover:underline">
              soporte@psicoevalua.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

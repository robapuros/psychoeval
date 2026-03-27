# Email Notifications System

Sistema completo de notificaciones por email para PsicoEvalúa usando **Resend** y **React Email**.

## Configuración

### 1. Obtener API Key de Resend

1. Crear cuenta en [resend.com](https://resend.com)
2. Verificar dominio `psicoevalua.com` (o usar dominio de testing)
3. Generar API key en Dashboard → API Keys
4. Agregar a `.env.local`:

```env
RESEND_API_KEY="re_xxxxxxxxxxxxx"
```

### 2. Configuración de Dominio

**Producción:**
- Remitente: `noreply@psicoevalua.com`
- Reply-to: `contacto@psicoevalua.com`

**Testing (sin dominio verificado):**
Resend permite enviar emails de prueba a direcciones verificadas sin dominio propio.

## Plantillas de Email

### 1. Patient Invitation (`emails/patient-invitation.tsx`)

**Cuándo se envía:**
- Al generar un enlace de evaluación
- Trigger: `POST /api/assessments/generate`

**Contenido:**
- Saludo personalizado con nombre del paciente
- Nombre del profesional que envía
- Descripción del instrumento
- Tiempo estimado de completación
- Fecha de expiración del enlace
- Botón CTA: "Completar cuestionario"

**Ejemplo:**
```
Hola Ana García,

Dr. Carlos Rodríguez te ha enviado un cuestionario de evaluación 
para completar: PHQ-9 - Cuestionario de Salud del Paciente.

📋 Cuestionario: PHQ-9 - Cuestionario de Salud del Paciente
⏱️ Tiempo estimado: 5-10 minutos
📅 Válido hasta: 3 de abril de 2026

[Completar cuestionario]
```

**Condiciones:**
- Solo se envía si el paciente tiene email registrado
- Solo si `RESEND_API_KEY` está configurada
- Si el envío falla, el enlace sigue siendo válido (no se bloquea la creación)

---

### 2. Assessment Completed (`emails/assessment-completed.tsx`)

**Cuándo se envía:**
- Al completar una evaluación
- Trigger: `POST /api/assessments/[token]/submit`

**Contenido:**
- Notifica al profesional que el paciente completó
- Muestra puntuación total y severidad
- Badge color-coded según severidad
- Recomendación clínica
- Alerta visual si hay ítem crítico
- Botón CTA: "Ver resultados completos"

**Ejemplo:**
```
Hola Dr. Carlos Rodríguez,

Ana García ha completado el cuestionario PHQ-9 - Cuestionario 
de Salud del Paciente.

Puntuación: 18 / 27
[Moderadamente severa]

[Ver resultados completos]
```

**Variante con alerta crítica:**
```
⚠️ ALERTA CRÍTICA DETECTADA

Se ha detectado una respuesta que requiere atención clínica 
inmediata. Por favor revisa los resultados detallados lo 
antes posible.

Puntuación: 18 / 27
[⚠️ Moderadamente severa]
```

**Colores por severidad:**
- **Mínima/Normal:** Verde oscuro (`#3B6D11`)
- **Leve:** Amarillo (`#BA7517`)
- **Moderada:** Naranja (`#BA7517`)
- **Severa:** Rojo (`#E24B4A`)
- **Muy severa:** Rojo oscuro (`#A32D2D`)

---

### 3. Critical Alert (`emails/critical-alert.tsx`)

**Cuándo se envía:**
- Inmediatamente después del email de completación
- Solo si `hasCriticalAlert === true`
- Trigger: `POST /api/assessments/[token]/submit`

**Contenido:**
- Banner rojo urgente: "🚨 ALERTA CRÍTICA"
- Detalles de la alerta (ej. ideación suicida en PHQ-9)
- Número(s) de ítem crítico
- Información de contacto del paciente (email, teléfono)
- Recomendaciones inmediatas:
  - Contactar al paciente ASAP
  - Evaluar riesgo en persona/teléfono
  - Considerar derivación a urgencias
  - Documentar acciones
- Botón CTA urgente: "Ver resultados completos" (rojo)

**Ejemplo:**
```
🚨 ALERTA CRÍTICA

Atención Inmediata Requerida

Dr. Carlos Rodríguez,

Se ha detectado una respuesta crítica en el cuestionario 
PHQ-9 - Cuestionario de Salud del Paciente completado por 
Ana García.

DETALLES DE LA ALERTA:
El paciente ha reportado pensamientos de que estaría mejor 
muerto/a o de hacerse daño de alguna manera. Se recomienda 
evaluación inmediata del riesgo suicida.

Ítem(s) crítico(s): 9

INFORMACIÓN DE CONTACTO:
Nombre: Ana García
Email: ana.garcia@email.com
Teléfono: +34 600 123 456

⚠️ RECOMENDACIONES INMEDIATAS
• Contactar al paciente lo antes posible
• Evaluar riesgo inmediato en persona o por teléfono
• Considerar derivación a urgencias si es necesario
• Documentar todas las acciones tomadas

[Ver resultados completos]
```

**Criterios de disparo:**
- **PHQ-9:** Pregunta 9 (ideación suicida) con valor ≥ 1
- Futuros: Se pueden agregar más criterios para otros instrumentos

---

## Flujo de Trabajo Completo

### Escenario 1: Profesional envía cuestionario

```
1. Profesional crea paciente con email
   └─ Paciente guardado en DB

2. Profesional genera enlace PHQ-9
   ├─ POST /api/assessments/generate
   ├─ Assessment creado en DB (status: pending)
   ├─ 📧 Email "Patient Invitation" enviado al paciente
   └─ UI muestra: "✉️ Email enviado a Ana García"

3. Paciente recibe email
   ├─ Abre email en su cliente
   ├─ Click en "Completar cuestionario"
   └─ Redirige a: /assess/{token}
```

### Escenario 2: Paciente completa cuestionario (sin alerta crítica)

```
4. Paciente responde PHQ-9
   └─ Respuestas guardadas localmente

5. Paciente finaliza
   ├─ POST /api/assessments/{token}/submit
   ├─ Scoring calculado (score: 12, severity: Moderada)
   ├─ Assessment actualizado (status: completed)
   ├─ 📧 Email "Assessment Completed" enviado al profesional
   └─ UI muestra: "Evaluación completada. Tu profesional revisará..."

6. Profesional recibe email
   ├─ Asunto: "✅ Ana García ha completado PHQ-9..."
   ├─ Ve puntuación: 12/27 (Moderada)
   ├─ Click en "Ver resultados completos"
   └─ Redirige a: /dashboard/patients/{id}/assessments/{token}
```

### Escenario 3: Paciente completa con alerta crítica

```
5. Paciente responde PHQ-9
   ├─ Q9 (ideación suicida) = 2 ("Más de la mitad de los días")
   └─ hasCriticalAlert = true

6. Paciente finaliza
   ├─ POST /api/assessments/{token}/submit
   ├─ Scoring calculado (score: 18, severity: Moderadamente severa)
   ├─ Assessment actualizado (hasCriticalAlert: true, criticalItems: [9])
   ├─ 📧 Email "Assessment Completed" enviado (con banner de alerta)
   ├─ 🚨 Email "Critical Alert" enviado INMEDIATAMENTE
   └─ UI muestra: "⚠️ Tu profesional ha sido notificado..."

7. Profesional recibe 2 emails:
   ├─ Email 1: "⚠️ ALERTA: Ana García - PHQ-9 completado"
   │   └─ Muestra puntuación + badge de alerta
   └─ Email 2: "🚨 ALERTA CRÍTICA: Ana García - PHQ-9"
       └─ Banner rojo + contacto del paciente + recomendaciones

8. Profesional actúa:
   ├─ Llama al paciente inmediatamente
   ├─ Evalúa riesgo suicida
   ├─ Documenta en historial clínico
   └─ (Si necesario) Deriva a urgencias
```

---

## Configuración de Envío

### Dirección de Origen

```typescript
// lib/email/resend.ts
export const emailConfig = {
  from: 'PsicoEvalúa <noreply@psicoevalua.com>',
  replyTo: 'contacto@psicoevalua.com',
};
```

**Notas:**
- `from`: Dirección que aparece como remitente
- `replyTo`: Dirección para respuestas (debe ser monitoreada)
- Debe coincidir con dominio verificado en Resend

### Rate Limits (Resend Free Plan)

- **100 emails/día** (testing)
- **3,000 emails/mes** (free tier)
- Upgrade a plan pagado para producción

**Recomendación:** Implementar throttling si >100 evaluaciones/día:
```typescript
// Ejemplo de cola con rate limiting
import { RateLimiter } from 'limiter';
const limiter = new RateLimiter({ tokensPerInterval: 100, interval: 'day' });
```

---

## Testing

### Preview de Plantillas

React Email incluye servidor de desarrollo:

```bash
cd psychoeval
npx email dev
```

Abre: http://localhost:3000

**Disponible:**
- `patient-invitation` - Invitación a paciente
- `assessment-completed` - Evaluación completada
- `critical-alert` - Alerta crítica

### Test de Envío Real

1. **Configurar Resend API Key:**
```env
RESEND_API_KEY="re_test_xxxxx"
```

2. **Crear paciente de prueba con tu email:**
```
Nombre: Test Patient
Email: tu-email@gmail.com
```

3. **Generar evaluación:**
   - Dashboard → Pacientes → Test Patient → Enviar test → PHQ-9
   - Verificar que recibes email de invitación

4. **Completar evaluación:**
   - Abrir enlace del email
   - Responder cuestionario
   - **Para probar alerta crítica:** Responder Q9 con valor ≥ 1
   - Verificar que recibes email(s) de completación

### Verificar Logs

```bash
# Development server
npm run dev

# Ver logs de email en consola
✅ Email sent to patient@email.com for assessment abc123
✅ Completion email sent to professional@email.com for assessment abc123
🚨 Critical alert email sent to professional@email.com for assessment abc123
```

---

## Troubleshooting

### Email no llega al paciente

**Checklist:**
1. ✅ Paciente tiene email en base de datos
2. ✅ `RESEND_API_KEY` configurada en `.env.local`
3. ✅ Dominio verificado en Resend (producción)
4. ✅ Revisar logs del servidor: `✅ Email sent...`
5. ✅ Revisar dashboard de Resend: Emails → Logs
6. ❌ Revisar carpeta de spam del paciente

**Testing sin dominio verificado:**
- Resend permite enviar a direcciones verificadas
- Agregar email de testing en Resend → Settings → Verified Emails
- O usar dominio de testing: `onboarding.resend.dev`

### Email no llega al profesional

**Posibles causas:**
1. Profesional no tiene email en DB
2. Error en scoring/submit (revisar logs)
3. Rate limit de Resend excedido (100/día free)
4. Problema de conectividad (Resend API down)

**Solución temporal:**
- El enlace de resultados sigue disponible en dashboard
- Email es notificación, no requisito para acceso

### Error de compilación en plantillas

```
Error: Property 'PreviewProps' does not exist on type...
```

**Solución:**
```typescript
// Agregar export default al final de cada plantilla
export default PatientInvitationEmail;
```

### Estilos no se renderizan correctamente

React Email requiere estilos inline:

❌ **Incorrecto:**
```tsx
<div className="text-red-500">Texto</div>
```

✅ **Correcto:**
```tsx
<div style={{ color: '#E24B4A' }}>Texto</div>
```

---

## Roadmap

### Futuras Mejoras

**Alta prioridad:**
- [ ] Plantilla de recordatorio (48h antes de expirar)
- [ ] Digest semanal para profesionales (resumen de actividad)
- [ ] Email de bienvenida al registrarse

**Media prioridad:**
- [ ] Plantilla de resultados PDF adjunto
- [ ] Soporte multi-idioma (catalán, euskera, gallego)
- [ ] Personalización de firma del profesional

**Baja prioridad:**
- [ ] Email marketing (newsletter)
- [ ] Notificaciones SMS (Twilio)
- [ ] Push notifications (web)

### Métricas a Trackear

```sql
-- Tasa de apertura de emails
SELECT 
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) / COUNT(*) * 100 AS open_rate
FROM email_logs;

-- Tasa de completación post-email
SELECT 
  COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*) * 100 AS completion_rate
FROM assessments
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## Soporte

**Resend Documentation:** https://resend.com/docs  
**React Email Documentation:** https://react.email/docs  
**PsicoEvalúa Support:** contacto@psicoevalua.com

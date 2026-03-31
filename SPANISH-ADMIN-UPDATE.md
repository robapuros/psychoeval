# Actualización: Sistema de Administración + Español

## 🎉 ¿Qué ha cambiado?

### ✅ Traducción completa al español
- Todas las páginas traducidas
- Mensajes de error en español
- Formato de fechas español (es-ES)
- Terminología clínica apropiada

### ✅ Sistema de roles (Admin/Profesional)

**Dos niveles de acceso:**

1. **ADMIN** - Administrador
   - Puede crear cuentas de profesionales
   - Gestiona usuarios del sistema
   - No puede crear pacientes
   - Panel: `/admin/professionals`

2. **PROFESSIONAL** - Psicólogo/Terapeuta
   - Puede crear pacientes
   - Puede enviar cuestionarios
   - Gestiona evaluaciones
   - Panel: `/dashboard/patients`

### ✅ Registro cerrado
- Ya no hay registro público
- Solo los administradores pueden crear cuentas
- Página de registro muestra mensaje de acceso restringido

---

## 🔐 Nuevas Credenciales

### Cuenta de Administrador
```
Email: admin@psicosnap.com
Contraseña: Admin1234!
```

**Acceso:** https://psicosnap.vercel.app/login  
**Redirige a:** `/admin/professionals`

### Cuenta de Profesional (Prueba)
```
Email: psicologo@psicosnap.com
Contraseña: Test1234!
```

**Acceso:** https://psicosnap.vercel.app/login  
**Redirige a:** `/dashboard/patients`

---

## 📊 Estructura de Roles

```
┌─────────────────┐
│  ADMINISTRADOR  │
│  (ADMIN)        │
└────────┬────────┘
         │ Puede crear →
         ↓
┌─────────────────┐
│  PROFESIONAL    │
│  (PROFESSIONAL) │
└────────┬────────┘
         │ Puede crear →
         ↓
┌─────────────────┐
│    PACIENTE     │
│    (Patient)    │
└─────────────────┘
```

---

## 🆕 Nuevas Funcionalidades

### Panel de Administración (`/admin/professionals`)

**Funciones:**
- Ver lista de todos los profesionales
- Crear nuevas cuentas de profesionales
- Ver estadísticas (pacientes por profesional)
- Editar información de profesionales

**Campos al crear profesional:**
- Nombre completo (obligatorio)
- Email de acceso (obligatorio)
- Especialidad (opcional)
- Nº Colegiado (opcional)
- Contraseña temporal (obligatoria)

### Panel de Profesionales (`/dashboard/patients`)

**Funciones:**
- Ver lista de pacientes propios
- Crear nuevos pacientes
- Ver evaluaciones pendientes
- Enviar cuestionarios (próximamente)

**Campos al crear paciente:**
- Nombre completo (obligatorio)
- Email (opcional)
- Teléfono (opcional)
- Notas clínicas (opcional)

---

## 🔄 Migración de Datos

### ⚠️ Datos anteriores eliminados

La actualización del esquema requirió eliminar datos de prueba previos.

**Nuevos datos de prueba:**
- 1 administrador
- 1 profesional
- 2 pacientes (García Martín, Fernández López)
- 1 evaluación pendiente

---

## 🚀 Cómo Usar

### Como Administrador

1. **Login** con `admin@psicosnap.com`
2. Verás el panel de gestión de profesionales
3. Haz clic en **"+ Nuevo profesional"**
4. Completa el formulario:
   - Nombre: Dr./Dra. Nombre Apellidos
   - Email: profesional@psicosnap.com
   - Especialidad: Psicología Clínica
   - Contraseña: (temporal, deberá cambiarla)
5. Haz clic en **"✓ Crear cuenta"**
6. Comparte las credenciales con el profesional

### Como Profesional

1. **Login** con las credenciales proporcionadas
2. Verás tu panel de pacientes
3. Haz clic en **"+ Nuevo paciente"**
4. Completa el formulario:
   - Nombre: Apellidos, Nombre
   - Email: paciente@email.com (opcional)
   - Teléfono: +34 600 000 000 (opcional)
   - Notas clínicas: Contexto, derivación, etc.
5. Haz clic en **"✓ Crear paciente"**

---

## 🎨 Diseño Actualizado

**Aplicado en todas las páginas:**
- Sistema PsyLink (Sora + JetBrains Mono)
- Colores corporativos (#185FA5, #0F6E56, #E24B4A)
- Espaciado compacto
- Etiquetas en mayúsculas (9px)
- Badges de estado con colores
- Inputs con borde fino
- Botones con esquinas redondeadas

---

## 📝 Próximos Pasos (Pendientes)

### Backend - API Routes

1. **Gestión de Profesionales** (`/api/admin/professionals`)
   - POST - Crear profesional
   - GET - Listar profesionales
   - PATCH - Editar profesional
   - DELETE - Eliminar profesional

2. **Gestión de Pacientes** (`/api/patients`)
   - POST - Crear paciente
   - GET - Listar pacientes del profesional
   - PATCH - Editar paciente
   - DELETE - Eliminar paciente

3. **Generación de Enlaces** (`/api/assessments/generate`)
   - POST - Generar enlace único
   - Caducidad: 7 días
   - Token: UUID

### Frontend - Interfaz de Paciente

4. **Cuestionario PHQ-9/GAD-7**
   - Una pregunta por pantalla
   - Barra de progreso
   - Diseño PsyLink
   - Validación de respuestas

5. **Visor de Resultados**
   - Puntuación total
   - Nivel de severidad (color-coded)
   - Alerta de ítems críticos
   - Gráfico de evolución

### Notificaciones

6. **Email con Resend**
   - Envío de enlaces a pacientes
   - Notificación de cuestionario completado
   - Alertas de ítems críticos

---

## 🐛 Resolución de Problemas

### No puedo iniciar sesión

**Verifica:**
1. Estás usando las nuevas credenciales (admin@psicosnap.com o psicologo@psicosnap.com)
2. La contraseña es correcta (Admin1234! o Test1234!)
3. No hay espacios extras en el email

### Me redirige a la página incorrecta

**Esto es normal:**
- Admin → siempre va a `/admin/professionals`
- Profesional → siempre va a `/dashboard/patients`

Si tu rol es incorrecto, contacta al administrador.

### "Registro restringido"

**Esto es correcto:**
- El registro público está cerrado intencionalmente
- Solo los administradores pueden crear cuentas
- Contacta con el admin de tu centro para solicitar acceso

---

## 📞 Soporte

**GitHub:** https://github.com/robapuros/psychoeval  
**Documentación:** Ver `/docs` folder  
**Deploy:** https://psicosnap.vercel.app

---

## 📊 Resumen de Cambios Técnicos

**Base de Datos:**
- Agregado enum `Role` (ADMIN, PROFESSIONAL)
- Campo `role` en tabla `professionals`
- Migración automática aplicada

**Autenticación:**
- NextAuth con roles en JWT
- Middleware con redirección basada en roles
- Validación de permisos en cada ruta

**UI:**
- 100% traducido al español
- Dos dashboards separados (admin/professional)
- Registro público deshabilitado
- Home page redirige a login

---

**Versión:** 0.2.0  
**Fecha:** 27 marzo 2026  
**Estado:** ✅ Desplegado en producción

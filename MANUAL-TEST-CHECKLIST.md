# Manual Testing Checklist

**App:** PsicoEvalúa  
**URL:** https://psicosnap.vercel.app  
**Date:** 2026-03-30

---

## 🔐 Authentication

### Test 1: Login (Professional)
- [ ] Go to `/auth/login`
- [ ] Login with: `psicologo@psicoevalua.com` / `Test1234!`
- [ ] ✅ Should redirect to `/dashboard/patients`
- [ ] ✅ Should see logout button in header

### Test 2: Login (Admin)
- [ ] Logout
- [ ] Login with: `admin@psicoevalua.com` / `Admin1234!`
- [ ] ✅ Should redirect to `/admin/professionals`
- [ ] ✅ Should see "Admin" badge in header

### Test 3: Logout
- [ ] Click "Cerrar sesión" button
- [ ] ✅ Should redirect to `/auth/login`
- [ ] ✅ Cannot access `/dashboard/patients` without login

---

## 👤 Patient Management

### Test 4: Create Patient
- [ ] Login as professional
- [ ] Go to `/dashboard/patients`
- [ ] Click "+ Nuevo paciente"
- [ ] Fill form:
  - Nombre: `García López, María`
  - Email: `maria.garcia@test.com`
  - Teléfono: `+34 600 111 222`
  - Notas: `Primera consulta`
- [ ] Click "✓ Crear paciente"
- [ ] ✅ Should show success message
- [ ] ✅ Patient appears in list
- [ ] ✅ Shows "Sin evaluación" status

### Test 5: List Patients
- [ ] Go to `/dashboard/patients`
- [ ] ✅ See all patients
- [ ] ✅ See last assessment info for each
- [ ] ✅ Status badges have correct colors

---

## 📋 Assessment Generation

### Test 6: Generate Assessment Link
- [ ] Go to `/dashboard/patients`
- [ ] Click "Enviar test" on patient
- [ ] Select instrument: `PHQ-9`
- [ ] Click "→ Generar enlace"
- [ ] ✅ Should show success modal
- [ ] ✅ Link is visible
- [ ] ✅ "Email enviado" if patient has email
- [ ] Click "📋 Copiar enlace"
- [ ] ✅ Link copied to clipboard
- [ ] Open link in new incognito tab
- [ ] ✅ Assessment form loads correctly

---

## 📝 Assessment Completion (Public)

### Test 7: Complete PHQ-9 Assessment
- [ ] Open assessment link (incognito)
- [ ] ✅ See patient name
- [ ] ✅ See "PHQ-9" title
- [ ] ✅ One question per screen
- [ ] ✅ Progress bar updates
- [ ] Answer all 9 questions
- [ ] Click "Enviar respuestas"
- [ ] ✅ See success message
- [ ] ✅ Cannot submit again

---

## 📊 Results Viewing

### Test 8: View Assessment Results
- [ ] Login as professional
- [ ] Go to `/dashboard/patients`
- [ ] ✅ Patient shows "Completado" status
- [ ] ✅ Status badge has correct color
- [ ] Click "Ver" button
- [ ] ✅ Results page loads
- [ ] ✅ See patient name
- [ ] ✅ See score gauge (circular)
- [ ] ✅ See severity badge
- [ ] ✅ See clinical recommendation
- [ ] ✅ See response table
- [ ] ✅ No "Esta evaluación aún no ha sido completada" error

### Test 9: Critical Alert (if applicable)
- [ ] If Q9 (ideación suicida) was answered > 0:
  - [ ] ✅ Red alert banner at top
  - [ ] ✅ "⚠ ALERTA CRÍTICA" message
  - [ ] ✅ "⚠ Urgente" badge in patient list

---

## 🔄 Multiple Assessments

### Test 10: Send New Assessment to Same Patient
- [ ] Go to `/dashboard/patients`
- [ ] Click "Nuevo" on patient with completed assessment
- [ ] Select different instrument: `GAD-7`
- [ ] Generate link
- [ ] ✅ New link created
- [ ] Complete new assessment
- [ ] Go back to patient list
- [ ] ✅ Shows last assessment (GAD-7)
- [ ] Click "Ver"
- [ ] ✅ Shows GAD-7 results

---

## 🔒 Security & Access Control

### Test 11: Route Protection
- [ ] Logout
- [ ] Try to access `/dashboard/patients` directly
- [ ] ✅ Redirects to `/auth/login`
- [ ] Login as admin
- [ ] Try to access `/dashboard/patients`
- [ ] ✅ Redirects to `/admin/professionals`
- [ ] Try to access expired assessment link
- [ ] ✅ Shows "enlace ha expirado" message

### Test 12: Professional Isolation
- [ ] Create 2nd professional account (if possible)
- [ ] Login as 2nd professional
- [ ] Go to `/dashboard/patients`
- [ ] ✅ Cannot see patients from 1st professional
- [ ] Try to access assessment token from 1st professional
- [ ] ✅ Access denied

---

## 📧 Email Notifications (if configured)

### Test 13: Patient Invitation Email
- [ ] Generate assessment with patient email
- [ ] ✅ Check patient inbox for invitation
- [ ] ✅ Email has correct patient name
- [ ] ✅ Email has "Completar cuestionario" button
- [ ] ✅ Button links to assessment

### Test 14: Completion Notification Email
- [ ] Complete assessment
- [ ] ✅ Check professional inbox
- [ ] ✅ Email shows patient completed assessment
- [ ] ✅ Email shows score & severity
- [ ] ✅ "Ver resultados completos" button works

---

## 🧪 Edge Cases

### Test 15: Expired Assessment
- [ ] Generate assessment
- [ ] Modify database: set `expiresAt` to past date
- [ ] Try to access link
- [ ] ✅ Shows "Este enlace ha expirado" message

### Test 16: Duplicate Submission
- [ ] Complete assessment
- [ ] Try to reload assessment page
- [ ] ✅ Shows "ya ha sido completada" message
- [ ] Try to submit via API directly
- [ ] ✅ Returns 400 error

### Test 17: Invalid Token
- [ ] Try to access `/assess/invalid-token-12345`
- [ ] ✅ Shows "Evaluación no encontrada" message

---

## ✅ Success Criteria

All tests must pass:
- [ ] Authentication works
- [ ] Patient CRUD works
- [ ] Assessment generation works
- [ ] Assessment completion works
- [ ] Results viewing works
- [ ] No "Esta evaluación aún no ha sido completada" errors
- [ ] Status enums display correctly (badges)
- [ ] Email notifications work (if configured)
- [ ] Route protection works
- [ ] Edge cases handled gracefully

---

## 🐛 Known Issues

None reported after schema consistency audit.

---

## 📝 Notes

- All enum values are UPPERCASE (`PENDING`, `COMPLETED`, `PHQ9`, etc.)
- All Prisma fields are camelCase (`fullName`, `professionalId`, etc.)
- Database columns remain snake_case (handled by Prisma mapping)
- No mixed case comparisons anywhere in the code

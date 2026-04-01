# 🔒 SECURITY FIX GUIDE - RLS Habilitación

## 🚨 PROBLEMA CRÍTICO DETECTADO

Supabase ha detectado:
1. ❌ **RLS (Row-Level Security) deshabilitado** - Tablas públicamente accesibles
2. ❌ **Datos sensibles expuestos** - Passwords, emails, respuestas clínicas sin protección

**Riesgo:** Cualquiera con la URL de Supabase puede leer/modificar/borrar datos de pacientes y profesionales.

---

## ✅ SOLUCIÓN (5 MINUTOS)

### **Paso 1: Aplicar Script RLS en Supabase**

1. **Ir a Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/gvgfybaifefvbxtgadra
   ```

2. **Abrir SQL Editor:**
   ```
   Dashboard → SQL Editor → New Query
   ```

3. **Pegar contenido de `supabase/enable-rls.sql`:**
   - Copiar TODO el archivo
   - Pegar en el editor
   - Click **"Run"** (ejecutar)

4. **Verificar éxito:**
   ```sql
   -- Debe mostrar RLS Enabled = true para todas las tablas
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

---

### **Paso 2: Verificar DATABASE_URL**

**Tu DATABASE_URL debe usar el connection string con permisos de service role.**

1. **Ir a:** Supabase → Settings → Database → Connection String

2. **Copiar:** URI (con password visible)

3. **Formato correcto:**
   ```
   postgresql://postgres.gvgfybaifefvbxtgadra:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

4. **Actualizar en Vercel:**
   ```
   Vercel → Project Settings → Environment Variables
   → DATABASE_URL → Editar
   → Pegar nueva URL
   → Redeploy
   ```

---

### **Paso 3: Testing Post-Fix**

**Verificar que la app sigue funcionando:**

1. **Login** → Debe funcionar ✅
2. **Ver lista de pacientes** → Debe mostrar pacientes ✅
3. **Crear nuevo paciente** → Debe guardarse ✅
4. **Generar cuestionario** → Debe enviar email ✅
5. **Completar cuestionario** (como paciente) → Debe funcionar ✅

**Si algo falla:**
- Revisar logs de Vercel
- Verificar DATABASE_URL tiene `?pgbouncer=true`
- Verificar que RLS policies se aplicaron correctamente

---

## 🔐 CÓMO FUNCIONA LA SEGURIDAD AHORA

### **Antes (❌ INSEGURO):**
```
Cliente → Supabase REST API → Database (sin RLS)
          ↓
       CUALQUIERA PUEDE ACCEDER
```

### **Después (✅ SEGURO):**
```
Cliente → Next.js API Route → NextAuth (valida sesión)
          ↓
       Prisma (con service role) → Database
          ↓
       RLS BLOQUEA ACCESO DIRECTO
```

**Capas de seguridad:**

1. **RLS (Database):** Bloquea acceso directo a tablas
2. **API Routes (Next.js):** Validan autenticación con NextAuth
3. **Prisma Filters:** Solo devuelven datos del profesional actual

---

## 📋 QUÉ HACEN LAS POLÍTICAS RLS

```sql
-- TODAS las políticas están en "false" (denegar)
CREATE POLICY "patients_select"
ON patients FOR SELECT
USING (false);  -- ❌ Nadie puede leer directamente
```

**¿Por qué "false" en todo?**

Porque **NO QUEREMOS** que nadie acceda directamente a la DB:
- ✅ Backend usa `DATABASE_URL` con service role (bypasea RLS)
- ✅ API routes validan sesión y aplican reglas de negocio
- ✅ Pacientes usan tokens únicos (no autenticación en Supabase)
- ❌ Clientes no pueden hacer queries directas

---

## 🧪 VERIFICAR SEGURIDAD

### **Test 1: RLS Habilitado**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('professionals', 'patients', 'assessments', 'responses');

-- Debe mostrar todas con rowsecurity = true
```

### **Test 2: Políticas Activas**
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Debe mostrar 16 políticas (4 por tabla)
```

### **Test 3: Supabase Security Advisor**
```
Dashboard → Security Advisor
→ Debe mostrar: ✅ No issues found
```

---

## ⚠️ IMPORTANTE: NO ROMPE LA APP

**PsicoSnap seguirá funcionando exactamente igual porque:**

1. **Prisma usa service role:** El `DATABASE_URL` tiene permisos completos
2. **RLS solo bloquea acceso directo:** No afecta queries desde backend
3. **NextAuth maneja autenticación:** No cambia nada en el flujo de login
4. **Tokens de pacientes siguen funcionando:** Se validan en API route, no en DB

---

## 🚀 DESPUÉS DEL FIX

**Email de Supabase cambiará a:**
```
✅ No security issues detected
✅ All tables have RLS enabled
✅ Sensitive data is protected
```

**Tiempo total:** 5-10 minutos  
**Downtime:** 0 (sin interrupciones)  
**Riesgo:** Muy bajo (solo habilita protecciones)

---

## 🆘 SI ALGO FALLA

### **Error: "No se pueden ver pacientes"**
```
Causa: DATABASE_URL no tiene permisos de service role
Fix: Usar la URL de "Connection string" (no "Session mode")
```

### **Error: "Prisma migration failed"**
```
Causa: Necesitas DIRECT_URL para migraciones
Fix: Añadir variable DIRECT_URL sin ?pgbouncer=true
```

### **Error: "Authentication failed"**
```
Causa: NextAuth no conecta a DB
Fix: Verificar NEXTAUTH_URL y NEXTAUTH_SECRET en Vercel
```

---

## 📞 SOPORTE

- **Supabase Docs:** https://supabase.com/docs/guides/database/postgres/row-level-security
- **Prisma + Supabase:** https://supabase.com/partners/integrations/prisma
- **Este proyecto:** `/root/.openclaw/workspace/psicosnap/`

---

**Aplica el fix AHORA. Los datos de tus pacientes están expuestos hasta que habilites RLS.** 🔒

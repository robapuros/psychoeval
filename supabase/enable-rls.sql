-- ============================================
-- PsicoSnap - Row Level Security (RLS) Policies
-- ============================================
-- CRITICAL SECURITY FIX
-- Este script habilita RLS en todas las tablas
-- y crea políticas para proteger datos clínicos sensibles
-- ============================================

-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================

ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR POLÍTICAS EXISTENTES (si las hay)
-- ============================================

DROP POLICY IF EXISTS "professionals_select" ON professionals;
DROP POLICY IF EXISTS "professionals_insert" ON professionals;
DROP POLICY IF EXISTS "professionals_update" ON professionals;
DROP POLICY IF EXISTS "professionals_delete" ON professionals;

DROP POLICY IF EXISTS "patients_select" ON patients;
DROP POLICY IF EXISTS "patients_insert" ON patients;
DROP POLICY IF EXISTS "patients_update" ON patients;
DROP POLICY IF EXISTS "patients_delete" ON patients;

DROP POLICY IF EXISTS "assessments_select" ON assessments;
DROP POLICY IF EXISTS "assessments_insert" ON assessments;
DROP POLICY IF EXISTS "assessments_update" ON assessments;
DROP POLICY IF EXISTS "assessments_delete" ON assessments;

DROP POLICY IF EXISTS "responses_select" ON responses;
DROP POLICY IF EXISTS "responses_insert" ON responses;
DROP POLICY IF EXISTS "responses_update" ON responses;
DROP POLICY IF EXISTS "responses_delete" ON responses;

-- 3. POLÍTICAS PARA PROFESSIONALS
-- ============================================
-- Los profesionales solo pueden ver y modificar su propia información
-- ADMIN puede ver todos los profesionales

CREATE POLICY "professionals_select"
ON professionals FOR SELECT
USING (
  -- NextAuth/Prisma usa conexión con service role (sin auth.uid())
  -- Por defecto, denegar acceso directo desde cliente
  false
);

CREATE POLICY "professionals_insert"
ON professionals FOR INSERT
WITH CHECK (false);  -- Solo permitir inserts desde backend (Prisma con service role)

CREATE POLICY "professionals_update"
ON professionals FOR UPDATE
USING (false);

CREATE POLICY "professionals_delete"
ON professionals FOR DELETE
USING (false);

-- 4. POLÍTICAS PARA PATIENTS
-- ============================================
-- Los pacientes solo son accesibles por su profesional asignado

CREATE POLICY "patients_select"
ON patients FOR SELECT
USING (false);  -- Solo backend

CREATE POLICY "patients_insert"
ON patients FOR INSERT
WITH CHECK (false);  -- Solo backend

CREATE POLICY "patients_update"
ON patients FOR UPDATE
USING (false);

CREATE POLICY "patients_delete"
ON patients FOR DELETE
USING (false);

-- 5. POLÍTICAS PARA ASSESSMENTS
-- ============================================
-- Las evaluaciones solo son accesibles por el profesional asignado
-- Los pacientes pueden ver/completar sus propias evaluaciones vía token único

CREATE POLICY "assessments_select"
ON assessments FOR SELECT
USING (false);  -- Solo backend

CREATE POLICY "assessments_insert"
ON assessments FOR INSERT
WITH CHECK (false);  -- Solo backend

CREATE POLICY "assessments_update"
ON assessments FOR UPDATE
USING (false);

CREATE POLICY "assessments_delete"
ON assessments FOR DELETE
USING (false);

-- 6. POLÍTICAS PARA RESPONSES
-- ============================================
-- Las respuestas solo son accesibles por el profesional del assessment

CREATE POLICY "responses_select"
ON responses FOR SELECT
USING (false);  -- Solo backend

CREATE POLICY "responses_insert"
ON responses FOR INSERT
WITH CHECK (false);  -- Solo backend

CREATE POLICY "responses_update"
ON responses FOR UPDATE
USING (false);

CREATE POLICY "responses_delete"
ON responses FOR DELETE
USING (false);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver estado de RLS en todas las tablas
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('professionals', 'patients', 'assessments', 'responses')
ORDER BY tablename;

-- Ver políticas activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. ARQUITECTURA DE SEGURIDAD:
   - PsicoSnap usa Prisma (no Supabase Client)
   - Todas las queries pasan por Next.js API routes
   - RLS bloquea acceso directo desde cualquier cliente
   - Backend usa DATABASE_URL con service role (bypassa RLS)

2. POR QUÉ TODAS LAS POLÍTICAS SON "false":
   - No queremos que NADIE acceda directamente a la DB
   - Todo debe pasar por las API routes de Next.js
   - API routes validan sesión (NextAuth)
   - API routes aplican reglas de negocio
   - Prisma se conecta con credenciales de service role

3. SEGURIDAD EN CAPAS:
   Capa 1: RLS (este archivo) - Bloquea acceso directo a DB
   Capa 2: API Routes - Validan autenticación con NextAuth
   Capa 3: Prisma queries - Filtran por professionalId en WHERE clauses

4. ACCESO DE PACIENTES A CUESTIONARIOS:
   - Los pacientes NO se autentican en Supabase
   - Usan token único en la URL (/assess/[token])
   - API route valida token + expiración
   - Si válido, permite completar cuestionario
   - No necesita política RLS porque usa backend

5. VERIFICAR CONFIGURACIÓN:
   - DATABASE_URL debe tener sufijo ?pgbouncer=true
   - DIRECT_URL debe usarse para migraciones
   - Connection pooling via Supabase Pooler

6. TRAS APLICAR ESTE SCRIPT:
   - Supabase Security Advisor debe mostrar 0 issues
   - Todas las tablas tendrán RLS enabled
   - Acceso directo bloqueado
   - App sigue funcionando normalmente via Prisma
*/

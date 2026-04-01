-- ============================================
-- PsicoSnap - Verificación de RLS
-- ============================================
-- Ejecuta este script DESPUÉS de enable-rls.sql
-- para confirmar que la seguridad está habilitada
-- ============================================

-- 1. VERIFICAR RLS HABILITADO
-- ============================================
SELECT 
  '🔒 RLS Status' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED - CRÍTICO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('professionals', 'patients', 'assessments', 'responses')
ORDER BY tablename;

-- 2. CONTAR POLÍTICAS ACTIVAS
-- ============================================
SELECT 
  '📋 Policy Count' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ OK (4 policies)'
    ELSE '⚠️ REVISAR - Esperadas 4 por tabla'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('professionals', 'patients', 'assessments', 'responses')
GROUP BY tablename
ORDER BY tablename;

-- 3. LISTAR TODAS LAS POLÍTICAS
-- ============================================
SELECT 
  '🛡️ Active Policies' as check_type,
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual = 'false' OR with_check = 'false' THEN '✅ DENY (secure)'
    ELSE '⚠️ CUSTOM LOGIC'
  END as security_level
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('professionals', 'patients', 'assessments', 'responses')
ORDER BY tablename, policyname;

-- 4. VERIFICAR DATOS SENSIBLES PROTEGIDOS
-- ============================================
SELECT 
  '🔐 Sensitive Columns' as check_type,
  table_name,
  column_name,
  data_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = table_name 
      AND schemaname = 'public'
    ) THEN '✅ Protected by RLS'
    ELSE '❌ UNPROTECTED'
  END as protection_status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('professionals', 'patients', 'assessments', 'responses')
  AND column_name IN ('password_hash', 'email', 'phone', 'notes', 'response_text', 'response_value')
ORDER BY table_name, column_name;

-- 5. RESUMEN FINAL
-- ============================================
SELECT 
  '📊 Security Summary' as summary,
  COUNT(DISTINCT tablename) as tables_with_rls,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(DISTINCT tablename) = 4 AND COUNT(*) >= 16 THEN '✅ SECURITY COMPLETE'
    ELSE '⚠️ INCOMPLETE - Review above'
  END as overall_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('professionals', 'patients', 'assessments', 'responses');

-- ============================================
-- INTERPRETACIÓN DE RESULTADOS
-- ============================================

/*
✅ RESULTADO ESPERADO:

Check 1 - RLS Status:
  professionals  → ✅ ENABLED
  patients       → ✅ ENABLED
  assessments    → ✅ ENABLED
  responses      → ✅ ENABLED

Check 2 - Policy Count:
  Cada tabla debe tener 4 políticas (SELECT, INSERT, UPDATE, DELETE)

Check 3 - Active Policies:
  Todas deben mostrar "✅ DENY (secure)"

Check 4 - Sensitive Columns:
  Todas deben mostrar "✅ Protected by RLS"

Check 5 - Security Summary:
  → ✅ SECURITY COMPLETE

Si ves algún ❌ o ⚠️:
1. Vuelve a ejecutar enable-rls.sql
2. Verifica que no hubo errores en la ejecución
3. Contacta soporte si persiste el problema
*/

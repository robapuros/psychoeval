# Supabase Security Configuration

## 📁 Archivos

### `enable-rls.sql` (APLICAR PRIMERO)
- Habilita Row-Level Security en todas las tablas
- Crea políticas que NIEGAN acceso directo a la base de datos
- Protege datos sensibles de pacientes y profesionales

### `verify-rls.sql` (EJECUTAR DESPUÉS)
- Verifica que RLS está correctamente habilitado
- Cuenta políticas activas
- Lista columnas sensibles protegidas
- Genera reporte de seguridad

## 🚀 Uso Rápido

```sql
-- 1. Aplicar seguridad (Supabase SQL Editor)
-- Copiar/pegar: enable-rls.sql
-- Click RUN

-- 2. Verificar (mismo editor)
-- Copiar/pegar: verify-rls.sql
-- Click RUN
-- Revisar que todo muestra ✅
```

## 📖 Documentación Completa

Ver: `../SECURITY-FIX-GUIDE.md`

## ⚠️ IMPORTANTE

**Aplicar estos scripts NO rompe la aplicación.**

PsicoSnap usa Prisma con credenciales de service role, que bypasea RLS automáticamente. Estos scripts solo bloquean acceso directo desde clientes no autorizados.

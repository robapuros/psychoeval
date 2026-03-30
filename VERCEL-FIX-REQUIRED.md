# 🚨 VERCEL DEPLOYMENT FIX REQUIRED

## Critical Issue: PostgreSQL Prepared Statement Collision

### Error
```
PostgresError { code: "42P05", message: "prepared statement 's1' already exists" }
```

### Root Cause
- Prisma + Vercel Serverless + Direct PostgreSQL connection
- Multiple concurrent Lambda invocations try to create prepared statements with same name
- PostgreSQL rejects duplicate prepared statement names

### Solution (REQUIRED)

#### Step 1: Update DATABASE_URL in Vercel

**If using Neon:**
1. Go to Neon dashboard
2. Copy the **"Pooled connection"** string (not the direct connection)
3. Update Vercel environment variable

```bash
# BEFORE (direct connection - BREAKS)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb"

# AFTER (pooled connection - WORKS)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**If using Supabase:**
1. Go to Settings → Database → Connection Pooling
2. Enable "Connection Pooling"
3. Copy the **"Transaction mode"** or **"Session mode"** connection string
4. Update Vercel environment variable

**If using other provider:**
Add `?pgbouncer=true` to your DATABASE_URL:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"
```

#### Step 2: Redeploy

After updating DATABASE_URL in Vercel:
1. Go to Vercel → Settings → Environment Variables
2. Update `DATABASE_URL`
3. Go to Deployments
4. Click "..." on latest deployment
5. Click "Redeploy"

---

## Why This Happens

### Vercel Serverless Architecture
- Each API request = new Lambda container (possibly)
- Lambda containers are reused but NOT guaranteed
- Multiple containers can execute concurrently

### Prisma Prepared Statements
- Prisma creates prepared statements for query optimization
- Names like "s1", "s2", etc.
- These are PostgreSQL session-scoped

### The Collision
```
Request 1 → Lambda A → Creates "s1" → ✅ OK
Request 2 → Lambda A → Tries "s1" → ❌ "already exists"
```

### Why Pooling Fixes It
- PgBouncer sits between Prisma and PostgreSQL
- Handles connection pooling + prepared statement lifecycle
- Prevents name collisions
- Reduces database connections (better performance)

---

## Verification

After applying the fix, test:

### 1. Dashboard Loads
```
https://psychoeval.vercel.app/dashboard/patients
```
Should load without errors.

### 2. Diagnostic Endpoint
```
GET https://psychoeval.vercel.app/api/patients/diagnose
```
Should return:
```json
{
  "checks": {
    "prisma": { "status": "ok" },
    "simpleQuery": { "status": "ok" },
    "fullQuery": { "status": "ok" }
  },
  "summary": {
    "allChecksPass": true
  }
}
```

---

## Alternative: Use Prisma Accelerate (Not Recommended)

Prisma Accelerate is a managed connection pooler:
- $25/month minimum
- Overkill for this app
- Just use pgbouncer instead (free)

---

## References

- [Prisma Issue #6219](https://github.com/prisma/prisma/issues/6219)
- [Vercel + Prisma Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

## Current Status

- ❌ Production is broken (500 errors on `/api/patients`)
- ✅ Root cause identified (prepared statement collision)
- ⏳ **WAITING:** Update DATABASE_URL in Vercel to use pooled connection
- ⏳ **THEN:** Redeploy

**ETA to fix:** 5 minutes (just update env var + redeploy)

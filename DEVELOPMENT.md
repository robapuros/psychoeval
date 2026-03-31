# Development Guide

## Testing Before Deploy

**⚠️ IMPORTANT: Always test locally before pushing to production**

### Pre-Deploy Checklist

```bash
# 1. Run build test
npm run build

# 2. Check types
npx tsc --noEmit

# 3. Test locally
npm run dev

# 4. Test critical paths manually:
#    - Login as professional
#    - Create patient
#    - Send assessment
#    - Complete assessment
#    - View results

# 5. If all pass, deploy
git push origin master
```

### Quick Test Script

```bash
chmod +x scripts/test-locally.sh
./scripts/test-locally.sh
```

---

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your local database
```

### 3. Setup Local Database

```bash
# Option A: Use PostgreSQL locally
docker run -d \
  --name psychoeval-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=psychoeval_dev \
  -p 5432:5432 \
  postgres:15

# Option B: Use Neon/Supabase free tier for testing
# Just update DATABASE_URL in .env.local
```

### 4. Run Migrations

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start Dev Server

```bash
npm run dev
```

---

## Debugging Production Issues

### Diagnostic Endpoints

If production is broken, use these endpoints to diagnose:

#### 1. Database Health Check
```
GET /api/health/db
```
Returns:
- Database connection status
- Count of professionals, patients, assessments

#### 2. Full Diagnostic
```
GET /api/debug/db-check
```
Returns:
- Session info
- All professionals with patient counts
- All patients with professional assignments

#### 3. Patients API Diagnostic
```
GET /api/patients/diagnose
```
Returns:
- Step-by-step breakdown of /api/patients query
- Identifies which part fails (session, prisma, includes, _count, etc.)

### Reading Vercel Logs

1. Go to Vercel Dashboard
2. Select Project → Functions
3. Click on `/api/patients`
4. View logs with `[/api/patients]` prefix
5. Look for errors in the stack trace

---

## Common Issues

### Error 500 on `/api/patients`

**Symptoms:**
- Dashboard shows "Cargando..." forever
- Console shows `Failed to load resource: 500`

**Debug Steps:**
1. Check `/api/patients/diagnose` endpoint
2. Check Vercel function logs
3. Verify DATABASE_URL is set in Vercel environment variables
4. Check if Prisma Client is generated (`npx prisma generate`)

**Common Causes:**
- Missing DATABASE_URL
- Prisma Client not generated
- Database connection timeout
- Query timeout (complex includes)
- Missing indexes on foreign keys

### Build Fails on Vercel

**Symptoms:**
- TypeScript errors during build
- "Failed to compile"

**Debug Steps:**
1. Run `npm run build` locally first
2. Fix TypeScript errors
3. Run `npx tsc --noEmit` to check types
4. Push only after local build succeeds

### Patients List Empty

**Symptoms:**
- Dashboard loads but shows "No hay pacientes aún"
- No 500 error

**Debug Steps:**
1. Check `/api/health/db` - is database populated?
2. Check `/api/debug/db-check` - do patients exist?
3. Verify professional ID in session matches patients in DB
4. Run seed: `npx prisma db seed`

---

## Testing Workflow

### Before Every Push

```bash
# 1. Clean build
rm -rf .next
npm run build

# 2. Type check
npx tsc --noEmit

# 3. Test locally
npm run dev
# Manually test:
# - Login
# - Create patient
# - Send assessment
# - Complete assessment
# - View results
```

### Testing New Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Develop and test locally**
   ```bash
   npm run dev
   # Test in browser
   ```

3. **Run build test**
   ```bash
   npm run build
   ```

4. **Merge to master only if tests pass**
   ```bash
   git checkout master
   git merge feature/my-feature
   git push origin master
   ```

---

## Production Deployment

### Current Setup

- **Platform:** Vercel
- **Branch:** `master`
- **Auto-deploy:** ✅ Yes (on push to master)
- **Build command:** `npm run build`
- **Environment:** `production`

### Environment Variables (Vercel)

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - https://psicosnap.vercel.app
- `NEXTAUTH_SECRET` - Secret key for NextAuth
- `RESEND_API_KEY` - Email API key (optional)
- `RESEND_FROM_EMAIL` - Email sender (optional)

### Rollback Procedure

If a deployment breaks production:

1. **Immediate rollback on Vercel:**
   - Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Fix locally and redeploy:**
   ```bash
   git revert HEAD  # Revert breaking commit
   git push origin master
   ```

---

## Code Quality

### TypeScript

- **Strict mode:** Enabled
- **No implicit any:** Enforced
- **Explicit return types:** Recommended for complex functions

### Error Handling

- Always use try/catch in API routes
- Log errors with context: `console.error('[route] Error:', error)`
- Return appropriate HTTP status codes (400, 401, 403, 404, 500)

### Database Queries

- Use transactions for multi-step operations
- Add indexes for foreign keys and frequent queries
- Limit results with `take` to avoid large payloads
- Test complex queries with `EXPLAIN ANALYZE` in Postgres

---

## Support

If stuck:
1. Check `/api/patients/diagnose` for detailed error info
2. Check Vercel function logs
3. Review this guide
4. Check SCHEMA-AUDIT.md for field naming conventions
5. Check MANUAL-TEST-CHECKLIST.md for test scenarios

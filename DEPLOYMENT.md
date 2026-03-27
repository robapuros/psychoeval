# PsicoEval - Deployment & Testing Guide

## 🚀 Quick Deploy to Vercel (5 minutes)

### Step 1: Fork/Clone the Repository

The repository is already at: **https://github.com/robapuros/psychoeval**

### Step 2: Deploy to Vercel

#### Option A: One-Click Deploy (Recommended)
1. Go to https://vercel.com/new
2. Import the `psychoeval` repository
3. Vercel will auto-detect Next.js and configure build settings
4. Click "Deploy"

#### Option B: Vercel CLI
```bash
cd psychoeval
npx vercel
# Follow prompts (select Next.js framework)
npx vercel --prod  # Deploy to production
```

### Step 3: Set Up Database

**Option 1: Vercel Postgres (Recommended)**
1. In Vercel dashboard → Storage → Create Database → Postgres
2. Connect to your project
3. Vercel will automatically set `DATABASE_URL` environment variable
4. In your project, go to Settings → Functions → and set max duration to 60s (for long-running queries)

**Option 2: Supabase (Free tier)**
1. Go to https://supabase.com/dashboard
2. Create new project
3. Get connection string from Settings → Database
4. Add to Vercel environment variables as `DATABASE_URL`

**Connection string format:**
```
postgresql://user:password@host:5432/database?schema=public
```

### Step 4: Run Database Migrations

Once DATABASE_URL is set:

```bash
# Install Prisma CLI
npm install

# Push schema to database
npx prisma db push

# Seed with test data (optional)
npx prisma db seed
```

Or from Vercel dashboard:
- Settings → Functions → Add new function
- Run: `npx prisma db push`

### Step 5: Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```env
# Required
DATABASE_URL=postgresql://... (auto-set if using Vercel Postgres)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-with-command-below

# Optional (for email notifications - Phase 2)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=notifications@yourdomain.com
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

### Step 6: Redeploy

After setting environment variables:
- Vercel will auto-redeploy, or
- Go to Deployments → ⋯ → Redeploy

---

## 🧪 Testing Guide

### Test User Accounts

After running `npx prisma db seed`, you'll have:

**Professional Account:**
- Email: `test@psychoeval.com`
- Password: `Test1234!`

### Testing Flow

#### 1. **Login**
- Go to https://your-app.vercel.app/login
- Use test credentials
- Should redirect to `/dashboard/patients`

#### 2. **Patient Management**
- Click "+ Nuevo paciente"
- Fill form with:
  - Name: "Test Patient, Jane"
  - Email: your-email@example.com
  - Phone: +34 600 000 000
  - Notes: "Test assessment"
- Submit → should appear in patient list

#### 3. **Send Assessment** (Phase 2 - not yet implemented)
- Click on patient row
- Select "PHQ-9" from assessment dropdown
- Copy generated link
- Open in incognito/private window

#### 4. **Complete Questionnaire** (Phase 2)
- Open patient link
- Accept consent
- Answer questions (one per screen)
- Submit
- Should see confirmation

#### 5. **View Results** (Phase 2)
- Back in professional dashboard
- Should see completed assessment
- View detailed results with score + severity

---

## 🔍 What's Currently Implemented

### ✅ Complete
- [x] Authentication (login/register)
- [x] Database schema (Prisma)
- [x] Scoring algorithms (PHQ-9, GAD-7) + tests
- [x] PsyLink design system
- [x] Patient dashboard UI
- [x] New patient modal

### 🚧 In Progress
- [ ] Patient CRUD API routes
- [ ] Assessment link generation
- [ ] Patient questionnaire interface
- [ ] Results viewer
- [ ] Email notifications

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Can't reach database server
```
**Fix:**
1. Verify `DATABASE_URL` is set correctly
2. Check database is running (Vercel Postgres/Supabase)
3. Run `npx prisma db push` to create tables

### Build Fails on Vercel
```
Module not found: Can't resolve '@/...'
```
**Fix:**
- Check `tsconfig.json` has correct path aliases
- Clear Vercel build cache: Settings → General → Clear Cache

### NextAuth Error
```
[next-auth][error][NO_SECRET]
```
**Fix:**
- Set `NEXTAUTH_SECRET` environment variable
- Set `NEXTAUTH_URL` to your Vercel domain

### Prisma Generate Error
```
Prisma schema could not be loaded
```
**Fix:**
```bash
npx prisma generate
npm run build
```

---

## 📊 Database Schema

Current tables:
- `professionals` - Psychologists/therapists
- `patients` - Patient records
- `assessments` - Questionnaire instances
- `responses` - Individual question answers

View schema: `prisma/schema.prisma`

---

## 🔐 Security Checklist

- [ ] `NEXTAUTH_SECRET` set to random 32-char string
- [ ] Database uses SSL (default in Vercel Postgres/Supabase)
- [ ] Environment variables not committed to git
- [ ] CORS properly configured
- [ ] Rate limiting enabled (TODO: Phase 2)

---

## 📈 Performance

Current build:
- **Bundle Size**: ~96KB First Load JS
- **Lighthouse Score**: 90+ (target)
- **Build Time**: ~30 seconds

Optimize:
- Use `next/image` for all images
- Enable Edge Runtime for API routes
- Configure ISR for static pages

---

## 🔄 Updating Deployment

After making changes:

```bash
git add .
git commit -m "Your changes"
git push origin master
```

Vercel will auto-deploy from GitHub (if connected).

Or manual deploy:
```bash
npx vercel --prod
```

---

## 📝 Next Steps

1. **Deploy** → Get live URL
2. **Test login** → Verify authentication works
3. **Check database** → Ensure tables created
4. **Create patient** → Test form submission
5. **Report issues** → GitHub Issues tab

---

## 💬 Support

- GitHub Issues: https://github.com/robapuros/psychoeval/issues
- Documentation: `/docs` folder
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

---

**Current Version**: 0.1.0-alpha (MVP Phase)  
**Last Updated**: March 27, 2026  
**Status**: 🚧 In Development

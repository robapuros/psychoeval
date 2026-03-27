# PsicoEval - Quick Testing Guide

## 🎯 What You Can Test Right Now

### Current Status (v0.1.0-alpha)

**✅ Working:**
- Professional login/registration
- Patient dashboard (UI only, sample data)
- PsyLink design system (matching your reference)
- Database schema
- Scoring algorithms (PHQ-9, GAD-7) - fully tested

**🚧 Coming Next (30-60 min to complete):**
- Patient CRUD (create/read/update/delete)
- Assessment link generation
- Patient questionnaire flow
- Results viewer with scores

---

## 🚀 Deploy & Test in 3 Steps

### Step 1: Deploy to Vercel (2 minutes)

**Easiest way:**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import: `github.com/robapuros/psychoeval`
3. Framework: Next.js (auto-detected)
4. Click "Deploy"

**You'll get a live URL like:** `psychoeval-xyz.vercel.app`

---

### Step 2: Add Database (3 minutes)

**In Vercel Dashboard:**
1. Go to **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose **Free** plan
5. Click **Create**

Vercel will automatically:
- Create the database
- Set `DATABASE_URL` environment variable
- Connect it to your project

**Then run migrations:**

In your local project:
```bash
npx prisma db push
npx prisma db seed  # Adds test user
git push origin master  # Trigger redeploy
```

Or wait for next step and use Vercel terminal.

---

### Step 3: Configure Environment (2 minutes)

**In Vercel Dashboard → Settings → Environment Variables:**

Add these:

| Variable | Value | How to Get |
|----------|-------|------------|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel URL |
| `NEXTAUTH_SECRET` | `random-32-char-string` | Run: `openssl rand -base64 32` |
| `DATABASE_URL` | Auto-set by Vercel Postgres | Already done if you used Vercel Postgres |

**Generate secret:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

**After adding variables:**
- Vercel will auto-redeploy
- Wait 30-60 seconds

---

## 🧪 Test the App

### 1. Test Login

Visit: `https://your-app.vercel.app/login`

**Test credentials:**
- Email: `test@psychoeval.com`
- Password: `Test1234!`

**Expected:** Redirect to `/dashboard/patients`

---

### 2. Test Patient Dashboard

**What you'll see:**
- Clean PsyLink design (matching your HTML)
- Sample patient data (García Martín, Fernández López, etc.)
- Color-coded severity badges
- Monospace fonts for IDs and scores
- Compact spacing (just like PsyLink)

**Try:**
- Click "+ Nuevo paciente" button
- Fill the form
- Currently **UI only** - will save to database once API routes are added

---

### 3. Test Design System

**Check these match PsyLink:**
- [x] Sora font for UI text
- [x] JetBrains Mono for scores/IDs
- [x] Color palette (blues, teals, ambers, reds)
- [x] 9px uppercase labels with letter-spacing
- [x] Warm background (#F7F6F3)
- [x] Compact spacing (tight padding)
- [x] Rounded corners (8px/12px)
- [x] Severity badges (color-coded)

---

## 📊 What's Implemented vs. What's Coming

| Feature | Status | ETA |
|---------|--------|-----|
| **Authentication** | ✅ Complete | Live |
| **Database Schema** | ✅ Complete | Live |
| **Scoring Engines** | ✅ Complete + Tested | Live |
| **PsyLink Design** | ✅ Complete | Live |
| **Patient Dashboard UI** | ✅ Complete | Live |
| **Patient API (CRUD)** | 🚧 30 min | Next |
| **Assessment Links** | 🚧 20 min | Next |
| **Questionnaire Flow** | 🚧 40 min | Next |
| **Results Viewer** | 🚧 30 min | Next |
| **Email Notifications** | 📋 Phase 2 | Later |

---

## 🎨 Design Comparison

**Your PsyLink reference:**
- Dark navy sidebar: `#042C53` ✓
- Primary blue: `#185FA5` ✓
- Teal success: `#1D9E75` ✓
- Red critical: `#E24B4A` ✓
- Warm background: `#F7F6F3` ✓
- Stone neutrals ✓
- Sora + JetBrains Mono ✓

**All colors and spacing matched** ✅

---

## 🐛 Common Issues

### "Can't find module '@prisma/client'"
```bash
npm install
npx prisma generate
```

### "Database connection failed"
Check `DATABASE_URL` is set in Vercel env variables.

### "NextAuth error: NO_SECRET"
Add `NEXTAUTH_SECRET` to Vercel env variables.

### Changes not showing
Clear Vercel build cache:
- Settings → General → Clear Build Cache
- Redeploy

---

## 🔄 Local Development

**If you want to run locally:**

```bash
# Clone
git clone https://github.com/robapuros/psychoeval.git
cd psychoeval

# Install
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
# DATABASE_URL=postgresql://...
# NEXTAUTH_SECRET=...

# Push database schema
npx prisma db push

# Seed test data
npx prisma db seed

# Run dev server
npm run dev
```

Visit `http://localhost:3000`

---

## 📝 Feedback Checklist

When testing, please check:

- [ ] Login works with test credentials
- [ ] Dashboard loads with patient table
- [ ] Design matches PsyLink aesthetic
- [ ] Fonts are correct (Sora + JetBrains Mono)
- [ ] Colors match your reference
- [ ] Spacing feels tight/compact (like PsyLink)
- [ ] Modal opens when clicking "+ Nuevo paciente"
- [ ] Form fields are styled correctly
- [ ] No console errors

---

## 🎯 What to Test Next (After API Routes Added)

Once patient CRUD is implemented:

1. **Create Patient**
   - Fill form completely
   - Submit
   - Should save to database
   - Should appear in table

2. **Generate Assessment Link**
   - Click patient row
   - Select instrument (PHQ-9)
   - Copy unique link
   - Link should have 7-day expiration

3. **Complete Questionnaire**
   - Open link in incognito
   - Answer 9 questions
   - One per screen
   - Progress bar updates
   - Submit

4. **View Results**
   - Professional dashboard
   - See completed assessment
   - Score: 0-27
   - Severity: None/Mild/Moderate/Severe
   - Critical item alert if Q9 > 0

---

## 📞 Questions or Issues?

- **GitHub Issues**: https://github.com/robapuros/psychoeval/issues
- **Docs**: See `/docs` folder
- **Deployment Guide**: `DEPLOYMENT.md`

---

**Ready to test?** Deploy to Vercel and visit your app! 🚀

**Current Progress:** ~40% MVP complete  
**Next Sprint:** Patient CRUD + Assessment generation (~2 hours)

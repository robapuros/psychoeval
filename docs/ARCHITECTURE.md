# Architecture Overview - PsicoEval

**Tech Stack**: Next.js 14, PostgreSQL, TypeScript, Tailwind CSS

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                          │
│                    (Next.js 14 App Router)                  │
└─────────────────┬───────────────────────────┬───────────────┘
                  │                           │
        ┌─────────▼──────────┐    ┌──────────▼──────────┐
        │  Professional UI    │    │    Patient UI       │
        │  (Authenticated)    │    │   (Token-based)     │
        │                     │    │                     │
        │  /dashboard/*       │    │  /q/[token]        │
        └─────────┬───────────┘    └──────────┬──────────┘
                  │                           │
                  └───────────┬───────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   API Routes       │
                    │   /api/*           │
                    │                    │
                    │  - Auth            │
                    │  - Patients        │
                    │  - Assessments     │
                    │  - Scoring         │
                    └─────────┬──────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
    ┌───────▼────────┐ ┌─────▼──────┐ ┌────────▼────────┐
    │   PostgreSQL   │ │   Resend   │ │  Vercel Blob    │
    │   (Supabase)   │ │   (Email)  │ │  (File Storage) │
    └────────────────┘ └────────────┘ └─────────────────┘
```

---

## 📂 Directory Structure

```
psychoeval/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (professional)/
│   │   ├── layout.tsx              # Auth guard + nav
│   │   └── dashboard/
│   │       ├── page.tsx            # Redirect to /patients
│   │       ├── patients/
│   │       │   ├── page.tsx        # Patient list
│   │       │   └── [id]/
│   │       │       └── page.tsx    # Patient profile
│   │       └── assessments/
│   │           └── [id]/
│   │               └── page.tsx    # Assessment result view
│   │
│   ├── (patient)/
│   │   └── q/
│   │       └── [token]/
│   │           ├── page.tsx        # Questionnaire flow
│   │           └── complete/
│   │               └── page.tsx    # Confirmation
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   └── me/
│   │   │       └── route.ts
│   │   │
│   │   ├── patients/
│   │   │   ├── route.ts            # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET, PATCH, DELETE
│   │   │       └── assessments/
│   │   │           └── route.ts    # GET patient assessments
│   │   │
│   │   ├── assessments/
│   │   │   ├── route.ts            # POST create (generate link)
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET assessment details
│   │   │       └── submit/
│   │   │           └── route.ts    # POST patient submission
│   │   │
│   │   └── tokens/
│   │       └── [token]/
│   │           └── validate/
│   │               └── route.ts    # GET validate token
│   │
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   └── globals.css
│
├── components/
│   ├── professional/
│   │   ├── patient-list.tsx
│   │   ├── patient-form.tsx
│   │   ├── assessment-card.tsx
│   │   ├── link-generator.tsx
│   │   └── result-viewer.tsx
│   │
│   ├── patient/
│   │   ├── welcome-screen.tsx
│   │   ├── question-card.tsx
│   │   ├── progress-bar.tsx
│   │   └── confirmation-screen.tsx
│   │
│   └── shared/
│       ├── button.tsx
│       ├── input.tsx
│       ├── modal.tsx
│       └── alert.tsx
│
├── lib/
│   ├── auth/
│   │   ├── config.ts               # NextAuth configuration
│   │   └── session.ts              # Session utilities
│   │
│   ├── db/
│   │   ├── client.ts               # Prisma client singleton
│   │   └── queries/
│   │       ├── professionals.ts
│   │       ├── patients.ts
│   │       ├── assessments.ts
│   │       └── responses.ts
│   │
│   ├── scoring/
│   │   ├── index.ts                # Main scoring interface
│   │   ├── phq9.ts
│   │   ├── gad7.ts
│   │   ├── pcl5.ts
│   │   ├── audit.ts
│   │   └── mmse.ts
│   │
│   ├── instruments/
│   │   ├── types.ts                # Shared types
│   │   ├── phq9.json
│   │   ├── gad7.json
│   │   ├── pcl5.json
│   │   ├── audit.json
│   │   └── mmse.json
│   │
│   ├── email/
│   │   ├── client.ts               # Resend client
│   │   ├── templates/
│   │   │   └── assessment-complete.tsx
│   │   └── send.ts
│   │
│   └── utils/
│       ├── tokens.ts               # Token generation
│       ├── validation.ts
│       └── formatting.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   ├── instruments/                # Static instrument PDFs for reference
│   └── images/
│
├── tests/
│   ├── unit/
│   │   └── scoring/
│   │       ├── phq9.test.ts
│   │       ├── gad7.test.ts
│   │       ├── pcl5.test.ts
│   │       ├── audit.test.ts
│   │       └── mmse.test.ts
│   │
│   └── e2e/
│       ├── auth.test.ts
│       ├── patient-flow.test.ts
│       └── professional-flow.test.ts
│
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🔐 Authentication Flow

### Professional Authentication (NextAuth.js)

```typescript
// lib/auth/config.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const professional = await db.professional.findUnique({
          where: { email: credentials.email }
        });

        if (!professional) {
          return null;
        }

        const isValid = await compare(
          credentials.password,
          professional.password_hash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: professional.id,
          email: professional.email,
          name: professional.name,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
};
```

### Patient Token Validation

```typescript
// lib/utils/tokens.ts
import { randomBytes } from "crypto";
import { db } from "@/lib/db/client";

export async function generateToken(): Promise<string> {
  return randomBytes(16).toString("hex");
}

export async function validateToken(token: string) {
  const assessment = await db.assessment.findUnique({
    where: { token },
    include: { patient: true, professional: true }
  });

  if (!assessment) {
    return { valid: false, error: "TOKEN_NOT_FOUND" };
  }

  if (assessment.completed_at) {
    return { valid: false, error: "ALREADY_COMPLETED" };
  }

  if (new Date() > assessment.expires_at) {
    return { valid: false, error: "EXPIRED" };
  }

  return { valid: true, assessment };
}
```

---

## 📊 Scoring Engine

### Interface Design

```typescript
// lib/scoring/types.ts
export interface Response {
  questionNumber: number;
  value: number;
}

export interface ScoringResult {
  totalScore: number;
  severity: string;
  hasCriticalItem: boolean;
  criticalItems?: number[];
  interpretation: string;
}

export interface ScoringEngine {
  calculate(responses: Response[]): ScoringResult;
}
```

### PHQ-9 Example

```typescript
// lib/scoring/phq9.ts
import { ScoringEngine, Response, ScoringResult } from "./types";

export class PHQ9Scorer implements ScoringEngine {
  calculate(responses: Response[]): ScoringResult {
    // Sum all responses (0-3 each, 9 questions)
    const totalScore = responses.reduce((sum, r) => sum + r.value, 0);

    // Determine severity
    let severity: string;
    if (totalScore <= 4) severity = "None";
    else if (totalScore <= 9) severity = "Mild";
    else if (totalScore <= 14) severity = "Moderate";
    else if (totalScore <= 19) severity = "Moderately Severe";
    else severity = "Severe";

    // Check critical item (Question 9 - suicidal ideation)
    const q9Response = responses.find(r => r.questionNumber === 9);
    const hasCriticalItem = q9Response !== undefined && q9Response.value > 0;

    return {
      totalScore,
      severity,
      hasCriticalItem,
      criticalItems: hasCriticalItem ? [9] : undefined,
      interpretation: this.getInterpretation(severity)
    };
  }

  private getInterpretation(severity: string): string {
    const interpretations = {
      "None": "Minimal or no depression symptoms.",
      "Mild": "Mild depression. Monitor symptoms.",
      "Moderate": "Moderate depression. Consider treatment.",
      "Moderately Severe": "Moderately severe depression. Treatment recommended.",
      "Severe": "Severe depression. Immediate treatment recommended."
    };
    return interpretations[severity] || "";
  }
}
```

---

## 📧 Email System

### Completion Notification

```typescript
// lib/email/send.ts
import { Resend } from "resend";
import { AssessmentCompleteEmail } from "./templates/assessment-complete";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAssessmentCompleteNotification(
  professional: { email: string; name: string },
  patient: { name: string },
  assessment: { id: string; instrument_type: string; score: number; severity: string; has_critical_item: boolean }
) {
  await resend.emails.send({
    from: "PsicoEval <notifications@psychoeval.com>",
    to: professional.email,
    subject: `[PsicoEval] ${patient.name} completed ${assessment.instrument_type}`,
    react: AssessmentCompleteEmail({
      professionalName: professional.name,
      patientName: patient.name,
      instrumentType: assessment.instrument_type,
      score: assessment.score,
      severity: assessment.severity,
      hasCriticalItem: assessment.has_critical_item,
      viewUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard/assessments/${assessment.id}`
    })
  });
}
```

---

## 🗄️ Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Professional {
  id             String       @id @default(uuid())
  email          String       @unique
  password_hash  String
  name           String
  specialty      String?
  license_number String?
  created_at     DateTime     @default(now())
  updated_at     DateTime     @updatedAt
  
  patients       Patient[]
  assessments    Assessment[]
}

model Patient {
  id              String       @id @default(uuid())
  professional_id String
  name            String
  email           String?
  phone           String?
  notes           String?      @db.Text
  created_at      DateTime     @default(now())
  updated_at      DateTime     @updatedAt
  
  professional    Professional @relation(fields: [professional_id], references: [id], onDelete: Cascade)
  assessments     Assessment[]
  
  @@index([professional_id])
}

enum InstrumentType {
  PHQ9
  GAD7
  PCL5
  AUDIT
  MMSE
}

enum AssessmentStatus {
  PENDING
  COMPLETED
  EXPIRED
}

model Assessment {
  id                String           @id @default(uuid())
  token             String           @unique @default(cuid())
  patient_id        String
  professional_id   String
  instrument_type   InstrumentType
  status            AssessmentStatus @default(PENDING)
  created_at        DateTime         @default(now())
  expires_at        DateTime
  completed_at      DateTime?
  score             Int?
  severity          String?
  has_critical_item Boolean          @default(false)
  
  patient           Patient          @relation(fields: [patient_id], references: [id], onDelete: Cascade)
  professional      Professional     @relation(fields: [professional_id], references: [id], onDelete: Cascade)
  responses         Response[]
  
  @@index([token])
  @@index([patient_id])
  @@index([status])
  @@index([expires_at])
}

model Response {
  id              String     @id @default(uuid())
  assessment_id   String
  question_number Int
  question_text   String     @db.Text
  response_value  Int
  response_text   String?    @db.Text
  created_at      DateTime   @default(now())
  
  assessment      Assessment @relation(fields: [assessment_id], references: [id], onDelete: Cascade)
  
  @@index([assessment_id])
}
```

---

## 🚀 Deployment

### Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/psychoeval"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Email
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="notifications@psychoeval.com"

# App
NEXT_PUBLIC_URL="http://localhost:3000"
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "RESEND_API_KEY": "@resend-api-key"
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
- All scoring algorithms
- Token generation and validation
- Email formatting
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- Authentication flows

### E2E Tests (Playwright)
- Professional registration → patient creation → assessment sending
- Patient receives link → completes questionnaire → professional receives notification
- Token expiration handling
- Critical item detection

---

## 📈 Monitoring & Observability

### Metrics to Track
- User registrations
- Assessments created
- Assessments completed
- Token expiration rate
- Critical items detected
- Email delivery rate
- API response times
- Error rates

### Tools
- **Error Tracking**: Sentry
- **Analytics**: PostHog (privacy-focused)
- **Uptime**: Vercel monitoring
- **Database**: Supabase metrics

---

## 🔒 Security Considerations

### Data Protection
- All PII encrypted at rest (database-level encryption)
- TLS 1.3 for data in transit
- No sensitive data in logs
- Audit trail for all data access

### Access Control
- Professional can only see their own patients
- Token-based access for patients (no authentication required)
- Rate limiting on all public endpoints
- CSRF protection on all mutations

### Compliance
- HIPAA-ready architecture
- Data retention policies configurable
- Patient data deletion on request
- Audit logs retained for 7 years

---

**Next**: See [DATABASE.md](DATABASE.md) for detailed schema and migration strategy.

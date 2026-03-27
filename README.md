# PsicoEval

**Mental health assessment questionnaire platform for psychology professionals**

PsicoEval is a streamlined tool that helps mental health professionals send standardized psychological assessments to patients via secure links, with automatic scoring and result tracking.

## 🎯 MVP Scope

### For Professionals
- **Secure Authentication** - Email/password login and registration
- **Patient Management** - Create and manage patient records
- **Send Assessments** - Generate unique, expiring links for 5 validated instruments
- **Track Results** - Automatic scoring with severity levels and critical item alerts
- **Email Notifications** - Instant alerts when patients complete assessments

### For Patients
- **No Account Required** - Access via unique link (7-day expiration)
- **Mobile-Optimized** - One question at a time with progress tracking
- **Simple Interface** - Touch-friendly buttons, clear progress indicators
- **Confirmation** - Completion screen after submission

## 📋 Supported Instruments (MVP)

1. **PHQ-9** - Patient Health Questionnaire (Depression)
2. **GAD-7** - Generalized Anxiety Disorder Assessment
3. **PCL-5** - PTSD Checklist
4. **AUDIT** - Alcohol Use Disorders Identification Test
5. **MMSE** - Mini-Mental State Examination (Cognitive Assessment)

*Selected based on psychologist feedback as the most clinically requested instruments.*

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js
- **Email**: Resend
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Language**: TypeScript

## 📚 Documentation

- [MVP Specification](docs/MVP_SPEC.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/robapuros/psychoeval.git
cd psychoeval

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
psychoeval/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (professional)/    # Professional dashboard
│   ├── (patient)/         # Patient questionnaire interface
│   └── api/               # API routes
├── components/            # React components
│   ├── professional/      # Professional UI components
│   ├── patient/          # Patient UI components
│   └── shared/           # Shared components
├── lib/                  # Core utilities
│   ├── scoring/         # Questionnaire scoring algorithms
│   ├── instruments/     # Instrument definitions
│   └── db/              # Database utilities
├── docs/                # Documentation
└── prisma/              # Database schema & migrations
```

## 🔒 Security & Compliance

- **HIPAA-ready architecture** - Encrypted at rest and in transit
- **Unique token-based links** - No patient login required
- **Automatic expiration** - 7-day link validity
- **Audit logging** - Complete assessment history tracking
- **Critical item alerts** - Immediate notification for risk indicators

## 🧪 Testing

```bash
# Run all tests
npm test

# Run scoring algorithm tests
npm run test:scoring

# Run E2E tests
npm run test:e2e
```

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

## 🤝 Contributing

This is an early-stage MVP. Contributions welcome after initial release.

## 📧 Contact

For questions or feedback: [your-email]

---

**Status**: 🚧 In Development (MVP Phase)  
**Version**: 0.1.0-alpha  
**Last Updated**: March 2026

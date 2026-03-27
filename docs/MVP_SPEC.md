# MVP Specification - PsicoEval

**Version**: 1.0  
**Target Launch**: Q2 2026  
**Core Principle**: A professional can send a questionnaire to a patient and receive the automatic score. Everything else is optional.

---

## 🎯 MVP Goals

### Primary Goal
Enable psychology professionals to send validated assessment questionnaires to patients via secure links and receive automatic scoring with severity levels.

### Success Metrics
- Professional can create account and send first assessment < 5 minutes
- Patient can complete assessment on mobile < 3 minutes
- Professional receives scored results immediately after patient completion
- Zero manual scoring required

---

## 👥 User Roles

### Professional (Authenticated)
- Psychologist
- Therapist
- Psychiatrist
- Mental health counselor

### Patient (Unauthenticated)
- Receives link via WhatsApp, email, SMS, etc.
- No account creation required
- Access via unique token

---

## 🖥️ Professional Interface (4 Screens)

### 1. Login / Register
**Route**: `/login`, `/register`

#### Features
- Email + password authentication
- Email verification (optional for MVP)
- "Forgot password" flow
- Basic profile setup:
  - Full name (required)
  - Professional specialty (dropdown: Psychologist, Psychiatrist, Therapist, Counselor, Other)
  - License number (optional)

#### Validation
- Email format validation
- Password: min 8 characters, 1 uppercase, 1 number
- Unique email check

---

### 2. Patient List
**Route**: `/dashboard/patients`

#### Features
- **Add Patient Button** (top right)
  - Modal form:
    - Name (required)
    - Email OR phone (at least one required)
    - Notes (optional, 500 char max)
- **Patient List Table**
  - Columns: Name, Contact, Last Assessment, Status, Actions
  - Search bar (filter by name)
  - Pagination (20 per page)
  - Click row → go to Patient Profile

#### Empty State
- "No patients yet. Add your first patient to get started."
- Large "Add Patient" button

---

### 3. Patient Profile
**Route**: `/dashboard/patients/[id]`

#### Layout
**Header**
- Patient name
- Contact info (email/phone)
- Edit button (opens modal to update info)

**Actions Panel**
- "Send Questionnaire" button
  - Opens dropdown with 5 instruments:
    - PHQ-9 (Depression)
    - GAD-7 (Anxiety)
    - PCL-5 (PTSD)
    - AUDIT (Alcohol)
    - MMSE (Cognitive)
  - Select instrument → generates unique link
  - Copy link button with confirmation toast
  - Link preview: `https://psychoeval.com/q/abc123xyz`
  - Expiration countdown: "Expires in 7 days"

**Assessment History**
- Table: Date, Instrument, Score, Severity, View
- Ordered by date (most recent first)
- Click "View" → opens Assessment Result screen
- Empty state: "No assessments yet. Send the first questionnaire."

---

### 4. Assessment Result View
**Route**: `/dashboard/assessments/[id]`

#### Components

**Header**
- Patient name
- Instrument name
- Completion date/time
- Back button

**Score Summary Card**
- Total score (large, prominent)
- Severity level with color coding:
  - PHQ-9: None (0-4), Mild (5-9), Moderate (10-14), Moderately Severe (15-19), Severe (20-27)
  - GAD-7: Minimal (0-4), Mild (5-9), Moderate (10-14), Severe (15-21)
  - PCL-5: Below threshold (<31), Probable PTSD (≥31)
  - AUDIT: Low risk (0-7), Hazardous (8-15), Harmful (16-19), Dependent (20-40)
  - MMSE: Severe (0-9), Moderate (10-18), Mild (19-23), Normal (24-30)

**Critical Item Alert** (if applicable)
- Red banner at top
- PHQ-9 Question 9 (suicidal ideation) score > 0
- PCL-5 specific trauma indicators
- Icon + text: "⚠️ Critical response detected. Review item [#] immediately."

**Detailed Responses**
- List all questions with patient responses
- Color-code response severity
- Highlight critical items

**Actions**
- Print/PDF export button
- Email to professional button (pre-filled)
- Delete assessment button (with confirmation)

---

## 📱 Patient Interface (2 Screens)

### 1. Questionnaire Flow
**Route**: `/q/[token]`

#### Token Validation
- Check token exists
- Check not expired (7 days)
- Check not already completed
- Invalid token → error page: "This link is invalid or has expired."

#### Welcome Screen
- "Hi! A mental health professional has asked you to complete this questionnaire."
- Instrument name (e.g., "PHQ-9 Depression Screening")
- Time estimate: "This will take about 2-3 minutes"
- Privacy note: "Your responses are confidential and will only be shared with your provider."
- "Start" button

#### Question Flow
- **One question per screen**
- **Progress bar** at top: "Question 3 of 9"
- **Question text** (large, readable font)
- **Response options** as large touch buttons
  - PHQ-9/GAD-7: 4-point scale (Not at all, Several days, More than half the days, Nearly every day)
  - PCL-5: 5-point scale (Not at all, A little bit, Moderately, Quite a bit, Extremely)
  - AUDIT: Variable options per question
  - MMSE: Specific cognitive tasks
- **Navigation**
  - "Next" button (disabled until answer selected)
  - "Back" button (optional, allows review)
- **Mobile optimizations**
  - Large tap targets (min 48x48px)
  - Clear visual feedback on selection
  - Smooth transitions between questions
  - Auto-scroll to next question

---

### 2. Confirmation Screen
**Route**: `/q/[token]/complete`

#### Content
- Checkmark icon
- "Thank you for completing the questionnaire!"
- "Your provider will review your responses and discuss them with you."
- "You can close this window now."
- No navigation away from this page
- No "retake" option

---

## 🔧 Backend Functionality

### Scoring Engine

#### PHQ-9 (Depression)
- **Questions**: 9 items
- **Scale**: 0-3 per item (Not at all = 0, Several days = 1, More than half = 2, Nearly every day = 3)
- **Total Score**: Sum of all items (0-27)
- **Severity Levels**:
  - None: 0-4
  - Mild: 5-9
  - Moderate: 10-14
  - Moderately Severe: 15-19
  - Severe: 20-27
- **Critical Item**: Question 9 (suicidal ideation) > 0

#### GAD-7 (Anxiety)
- **Questions**: 7 items
- **Scale**: 0-3 per item (same as PHQ-9)
- **Total Score**: 0-21
- **Severity Levels**:
  - Minimal: 0-4
  - Mild: 5-9
  - Moderate: 10-14
  - Severe: 15-21

#### PCL-5 (PTSD)
- **Questions**: 20 items
- **Scale**: 0-4 per item (Not at all = 0, A little bit = 1, Moderately = 2, Quite a bit = 3, Extremely = 4)
- **Total Score**: 0-80
- **Cutoff**: ≥31 suggests probable PTSD
- **Critical Items**: Items related to intrusive thoughts, nightmares, severe distress

#### AUDIT (Alcohol Use)
- **Questions**: 10 items
- **Scale**: Variable (0-4 per item)
- **Total Score**: 0-40
- **Risk Levels**:
  - Low risk: 0-7
  - Hazardous: 8-15
  - Harmful: 16-19
  - Dependent: 20-40

#### MMSE (Cognitive)
- **Questions**: 11 sections, 30 points total
- **Scale**: Point-based correct/incorrect answers
- **Total Score**: 0-30
- **Interpretation**:
  - Severe impairment: 0-9
  - Moderate: 10-18
  - Mild: 19-23
  - Normal: 24-30

### Token System

#### Link Generation
- Format: `https://psychoeval.com/q/{token}`
- Token: Random 32-character alphanumeric string
- Database fields:
  - `token` (unique, indexed)
  - `patient_id` (foreign key)
  - `instrument_type` (enum)
  - `created_by` (professional_id)
  - `created_at`
  - `expires_at` (created_at + 7 days)
  - `completed_at` (null until completed)
  - `status` (pending, completed, expired)

#### Token Validation Logic
```typescript
function validateToken(token: string) {
  const assessment = db.assessments.findByToken(token);
  
  if (!assessment) return { valid: false, error: "TOKEN_NOT_FOUND" };
  if (assessment.completed_at) return { valid: false, error: "ALREADY_COMPLETED" };
  if (new Date() > assessment.expires_at) return { valid: false, error: "EXPIRED" };
  
  return { valid: true, assessment };
}
```

### Email Notifications

#### Completion Notification
- **Trigger**: Patient completes questionnaire
- **Recipient**: Professional email
- **Subject**: `[PsicoEval] {Patient Name} completed {Instrument}`
- **Content**:
  - Patient name
  - Instrument completed
  - Completion timestamp
  - Total score and severity level
  - Critical item alert (if applicable)
  - Link to view full results
- **Provider**: Resend
- **Template**: Transactional email with professional branding

---

## 🗄️ Database Schema

### Tables

#### `professionals`
```sql
id                UUID PRIMARY KEY
email             VARCHAR(255) UNIQUE NOT NULL
password_hash     VARCHAR(255) NOT NULL
name              VARCHAR(255) NOT NULL
specialty         VARCHAR(100)
license_number    VARCHAR(100)
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

#### `patients`
```sql
id                UUID PRIMARY KEY
professional_id   UUID REFERENCES professionals(id)
name              VARCHAR(255) NOT NULL
email             VARCHAR(255)
phone             VARCHAR(50)
notes             TEXT
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()

CONSTRAINT check_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
```

#### `assessments`
```sql
id                UUID PRIMARY KEY
token             VARCHAR(32) UNIQUE NOT NULL
patient_id        UUID REFERENCES patients(id)
professional_id   UUID REFERENCES professionals(id)
instrument_type   VARCHAR(50) NOT NULL  -- 'PHQ9', 'GAD7', 'PCL5', 'AUDIT', 'MMSE'
status            VARCHAR(20) NOT NULL  -- 'pending', 'completed', 'expired'
created_at        TIMESTAMP DEFAULT NOW()
expires_at        TIMESTAMP NOT NULL
completed_at      TIMESTAMP
score             INTEGER
severity          VARCHAR(50)
has_critical_item BOOLEAN DEFAULT FALSE

INDEX idx_token (token)
INDEX idx_patient (patient_id)
INDEX idx_status (status)
```

#### `responses`
```sql
id                UUID PRIMARY KEY
assessment_id     UUID REFERENCES assessments(id)
question_number   INTEGER NOT NULL
question_text     TEXT NOT NULL
response_value    INTEGER NOT NULL
response_text     TEXT
created_at        TIMESTAMP DEFAULT NOW()

INDEX idx_assessment (assessment_id)
```

---

## 🚫 Out of Scope (MVP)

### Not Included in V1
- ❌ LLM-generated narrative summaries (too expensive, adds latency)
- ❌ Multiple professionals per organization
- ❌ Role-based permissions
- ❌ Custom questionnaires
- ❌ Export to EHR systems
- ❌ Automated reminders (professional manually sends link)
- ❌ SMS sending (professional sends via their own channels)
- ❌ Mobile apps (web-only)
- ❌ Multi-language support (English only)
- ❌ Charting/analytics dashboard
- ❌ Treatment recommendations
- ❌ Longitudinal tracking/graphs

---

## 🎨 Design Guidelines

### Colors
- **Primary**: Professional blue (#2563EB)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Neutral**: Gray scale

### Typography
- **Headings**: Inter, bold
- **Body**: Inter, regular
- **Patient interface**: Slightly larger base font (18px) for readability

### Mobile-First
- All patient screens optimized for 375px width minimum
- Touch targets minimum 48x48px
- Single-column layouts on mobile
- Progressive enhancement for desktop

---

## ⚡ Performance Targets

- **Time to Interactive**: < 2s on 3G
- **Lighthouse Score**: > 90
- **First Contentful Paint**: < 1.5s
- **Patient questionnaire load**: < 1s
- **Score calculation**: < 500ms

---

## 🔐 Security Requirements

- HTTPS only
- Password hashing: bcrypt (cost factor 12)
- Session tokens: 256-bit random
- Assessment tokens: 256-bit random, single-use
- SQL injection prevention: Parameterized queries
- XSS prevention: Input sanitization
- CORS: Strict origin policy
- Rate limiting: 100 req/min per IP
- No PHI in URL parameters
- Audit logging for all data access

---

## 📋 Acceptance Criteria

### Professional Can:
- [ ] Register and log in
- [ ] Add a patient with email or phone
- [ ] Generate assessment link for any of 5 instruments
- [ ] Copy link to clipboard
- [ ] View list of patients
- [ ] Search patients by name
- [ ] View patient assessment history
- [ ] View completed assessment with score and severity
- [ ] See critical item alerts
- [ ] Receive email when patient completes assessment

### Patient Can:
- [ ] Open link on mobile device
- [ ] See welcome screen with time estimate
- [ ] Answer questions one at a time
- [ ] See progress bar
- [ ] Navigate back to previous question
- [ ] Submit completed questionnaire
- [ ] See confirmation screen

### System Must:
- [ ] Validate tokens correctly
- [ ] Expire links after 7 days
- [ ] Prevent duplicate completions
- [ ] Calculate scores accurately for all 5 instruments
- [ ] Detect critical items correctly
- [ ] Send email notifications
- [ ] Handle expired/invalid tokens gracefully
- [ ] Work on mobile Safari and Chrome
- [ ] Load quickly on slow connections

---

## 🚀 Launch Checklist

### Pre-Launch
- [ ] All 5 instruments implemented with correct scoring
- [ ] Critical item detection tested
- [ ] Email notifications working
- [ ] Mobile UI tested on iOS Safari and Android Chrome
- [ ] Security audit completed
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Error handling for all edge cases
- [ ] Database backups configured
- [ ] Monitoring and alerts set up

### Post-Launch
- [ ] User feedback collection mechanism
- [ ] Support email monitoring
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] Usage analytics (PostHog or Plausible)

---

**Next Steps**: Proceed to [ARCHITECTURE.md](ARCHITECTURE.md) for technical implementation details.

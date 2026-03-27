-- PsicoEval Database Setup for Supabase
-- Run this in Supabase SQL Editor if you can't use Prisma CLI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE "InstrumentType" AS ENUM ('PHQ9', 'GAD7');
CREATE TYPE "AssessmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- Create professionals table
CREATE TABLE "professionals" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT,
    "license_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

-- Create patients table
CREATE TABLE "patients" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::TEXT,
    "professional_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "clinical_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- Create assessments table
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::TEXT,
    "patient_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "instrument_type" "InstrumentType" NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'PENDING',
    "access_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "total_score" INTEGER,
    "severity_level" TEXT,
    "critical_items" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- Create responses table
CREATE TABLE "responses" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::TEXT,
    "assessment_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "professionals_email_key" ON "professionals"("email");
CREATE UNIQUE INDEX "assessments_access_token_key" ON "assessments"("access_token");

-- Create indexes for performance
CREATE INDEX "patients_professional_id_idx" ON "patients"("professional_id");
CREATE INDEX "assessments_patient_id_idx" ON "assessments"("patient_id");
CREATE INDEX "assessments_professional_id_idx" ON "assessments"("professional_id");
CREATE INDEX "assessments_access_token_idx" ON "assessments"("access_token");
CREATE INDEX "assessments_status_idx" ON "assessments"("status");
CREATE INDEX "responses_assessment_id_idx" ON "responses"("assessment_id");

-- Add foreign keys
ALTER TABLE "patients" ADD CONSTRAINT "patients_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "responses" ADD CONSTRAINT "responses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create test professional
-- Password: Test1234!
-- Hash generated with bcrypt (rounds=12)
INSERT INTO "professionals" ("id", "email", "password_hash", "name", "specialty", "license_number", "created_at", "updated_at")
VALUES (
    uuid_generate_v4()::TEXT,
    'test@psychoeval.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaLUuL/3D5G',
    'Dr. Test Professional',
    'Clinical Psychology',
    'TEST-12345',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verify setup
SELECT 'Setup complete! Tables created and test user added.' as status;
SELECT email, name FROM professionals WHERE email = 'test@psychoeval.com';

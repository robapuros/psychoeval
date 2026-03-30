#!/usr/bin/env tsx
/**
 * Schema Consistency Verification Script
 * Verifies that all Prisma field names and enum values are used consistently
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  error?: string;
}

const results: TestResult[] = [];

function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function pass(test: string) {
  results.push({ test, status: 'PASS' });
  log(`✅ PASS: ${test}`);
}

function fail(test: string, error: string) {
  results.push({ test, status: 'FAIL', error });
  log(`❌ FAIL: ${test} - ${error}`);
}

async function testProfessionalCRUD() {
  try {
    // Create
    const professional = await prisma.professional.create({
      data: {
        email: `test-${Date.now()}@test.com`,
        passwordHash: await hash('Test1234!', 12),
        name: 'Test Professional',
        role: 'PROFESSIONAL',
        specialty: 'Testing',
      },
    });
    
    if (!professional.id) throw new Error('Professional not created');
    
    // Read
    const found = await prisma.professional.findUnique({
      where: { id: professional.id },
    });
    
    if (!found) throw new Error('Professional not found');
    if (found.role !== 'PROFESSIONAL') throw new Error(`Role mismatch: ${found.role}`);
    
    // Update
    const updated = await prisma.professional.update({
      where: { id: professional.id },
      data: { name: 'Updated Professional' },
    });
    
    if (updated.name !== 'Updated Professional') throw new Error('Update failed');
    
    // Delete
    await prisma.professional.delete({ where: { id: professional.id } });
    
    pass('Professional CRUD (camelCase fields)');
  } catch (error) {
    fail('Professional CRUD', String(error));
  }
}

async function testPatientCRUD() {
  try {
    // Create test professional first
    const professional = await prisma.professional.create({
      data: {
        email: `prof-${Date.now()}@test.com`,
        passwordHash: await hash('Test1234!', 12),
        name: 'Test Professional',
        role: 'PROFESSIONAL',
      },
    });
    
    // Create patient
    const patient = await prisma.patient.create({
      data: {
        professionalId: professional.id,
        fullName: 'Test Patient',
        email: 'patient@test.com',
        phone: '+34 600 000 000',
      },
    });
    
    if (!patient.id) throw new Error('Patient not created');
    if (patient.professionalId !== professional.id) throw new Error('professionalId mismatch');
    if (!patient.fullName) throw new Error('fullName not set');
    
    // Read
    const found = await prisma.patient.findUnique({
      where: { id: patient.id },
    });
    
    if (!found) throw new Error('Patient not found');
    if (found.fullName !== 'Test Patient') throw new Error('fullName not retrieved');
    
    // Cleanup
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.professional.delete({ where: { id: professional.id } });
    
    pass('Patient CRUD (fullName → name mapping)');
  } catch (error) {
    fail('Patient CRUD', String(error));
  }
}

async function testAssessmentCRUD() {
  try {
    // Create test data
    const professional = await prisma.professional.create({
      data: {
        email: `prof-assess-${Date.now()}@test.com`,
        passwordHash: await hash('Test1234!', 12),
        name: 'Test Professional',
        role: 'PROFESSIONAL',
      },
    });
    
    const patient = await prisma.patient.create({
      data: {
        professionalId: professional.id,
        fullName: 'Test Patient',
      },
    });
    
    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        patientId: patient.id,
        professionalId: professional.id,
        instrumentType: 'PHQ9',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    if (!assessment.id) throw new Error('Assessment not created');
    if (assessment.status !== 'PENDING') throw new Error(`Status mismatch: ${assessment.status}`);
    if (assessment.instrumentType !== 'PHQ9') throw new Error(`InstrumentType mismatch: ${assessment.instrumentType}`);
    
    // Update to COMPLETED
    const updated = await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        score: 15,
        severity: 'Moderada',
        hasCriticalAlert: false,
      },
    });
    
    if (updated.status !== 'COMPLETED') throw new Error('Status not updated to COMPLETED');
    if (updated.score !== 15) throw new Error('Score not set');
    
    // Cleanup
    await prisma.assessment.delete({ where: { id: assessment.id } });
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.professional.delete({ where: { id: professional.id } });
    
    pass('Assessment CRUD (status enum, instrumentType enum)');
  } catch (error) {
    fail('Assessment CRUD', String(error));
  }
}

async function testResponseCRUD() {
  try {
    // Create test data
    const professional = await prisma.professional.create({
      data: {
        email: `prof-resp-${Date.now()}@test.com`,
        passwordHash: await hash('Test1234!', 12),
        name: 'Test Professional',
        role: 'PROFESSIONAL',
      },
    });
    
    const patient = await prisma.patient.create({
      data: {
        professionalId: professional.id,
        fullName: 'Test Patient',
      },
    });
    
    const assessment = await prisma.assessment.create({
      data: {
        patientId: patient.id,
        professionalId: professional.id,
        instrumentType: 'PHQ9',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    // Create response
    const response = await prisma.response.create({
      data: {
        assessmentId: assessment.id,
        questionNumber: 1,
        questionText: '¿Con qué frecuencia...?',
        responseValue: 2,
        responseText: 'Más de la mitad de los días',
      },
    });
    
    if (!response.id) throw new Error('Response not created');
    if (response.assessmentId !== assessment.id) throw new Error('assessmentId mismatch');
    if (response.questionNumber !== 1) throw new Error('questionNumber mismatch');
    
    // Cleanup
    await prisma.response.delete({ where: { id: response.id } });
    await prisma.assessment.delete({ where: { id: assessment.id } });
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.professional.delete({ where: { id: professional.id } });
    
    pass('Response CRUD (assessmentId, questionNumber, responseValue)');
  } catch (error) {
    fail('Response CRUD', String(error));
  }
}

async function testEnumValues() {
  try {
    // Test all AssessmentStatus values
    const statuses = ['PENDING', 'COMPLETED', 'EXPIRED'];
    for (const status of statuses) {
      const prof = await prisma.professional.create({
        data: {
          email: `prof-enum-${status}-${Date.now()}@test.com`,
          passwordHash: await hash('Test1234!', 12),
          name: 'Test',
          role: 'PROFESSIONAL',
        },
      });
      
      const pat = await prisma.patient.create({
        data: { professionalId: prof.id, fullName: 'Test' },
      });
      
      const assess = await prisma.assessment.create({
        data: {
          patientId: pat.id,
          professionalId: prof.id,
          instrumentType: 'PHQ9',
          status: status as any,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      
      if (assess.status !== status) throw new Error(`Status ${status} not set correctly`);
      
      await prisma.assessment.delete({ where: { id: assess.id } });
      await prisma.patient.delete({ where: { id: pat.id } });
      await prisma.professional.delete({ where: { id: prof.id } });
    }
    
    // Test all InstrumentType values
    const instruments = ['PHQ9', 'GAD7', 'PCL5', 'AUDIT', 'MEC'];
    for (const instrument of instruments) {
      const prof = await prisma.professional.create({
        data: {
          email: `prof-inst-${instrument}-${Date.now()}@test.com`,
          passwordHash: await hash('Test1234!', 12),
          name: 'Test',
          role: 'PROFESSIONAL',
        },
      });
      
      const pat = await prisma.patient.create({
        data: { professionalId: prof.id, fullName: 'Test' },
      });
      
      const assess = await prisma.assessment.create({
        data: {
          patientId: pat.id,
          professionalId: prof.id,
          instrumentType: instrument as any,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      
      if (assess.instrumentType !== instrument) throw new Error(`InstrumentType ${instrument} not set correctly`);
      
      await prisma.assessment.delete({ where: { id: assess.id } });
      await prisma.patient.delete({ where: { id: pat.id } });
      await prisma.professional.delete({ where: { id: prof.id } });
    }
    
    // Test all Role values
    const roles = ['ADMIN', 'PROFESSIONAL'];
    for (const role of roles) {
      const prof = await prisma.professional.create({
        data: {
          email: `prof-role-${role}-${Date.now()}@test.com`,
          passwordHash: await hash('Test1234!', 12),
          name: 'Test',
          role: role as any,
        },
      });
      
      if (prof.role !== role) throw new Error(`Role ${role} not set correctly`);
      
      await prisma.professional.delete({ where: { id: prof.id } });
    }
    
    pass('All Enum Values (AssessmentStatus, InstrumentType, Role)');
  } catch (error) {
    fail('Enum Values', String(error));
  }
}

async function main() {
  log('🧪 Starting Schema Consistency Verification');
  log('');
  
  await testProfessionalCRUD();
  await testPatientCRUD();
  await testAssessmentCRUD();
  await testResponseCRUD();
  await testEnumValues();
  
  log('');
  log('📊 Test Results Summary:');
  log('');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    const msg = `${icon} ${result.test}`;
    log(msg);
    if (result.error) {
      log(`   Error: ${result.error}`);
    }
  });
  
  log('');
  log(`Total: ${results.length} tests`);
  log(`Passed: ${passed}`);
  log(`Failed: ${failed}`);
  log('');
  
  if (failed > 0) {
    log('❌ VERIFICATION FAILED');
    process.exit(1);
  } else {
    log('✅ ALL TESTS PASSED');
    process.exit(0);
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

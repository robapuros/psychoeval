import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test professional
  const testProfessional = await prisma.professional.upsert({
    where: { email: 'test@psychoeval.com' },
    update: {},
    create: {
      email: 'test@psychoeval.com',
      password_hash: await hash('Test1234!', 12),
      name: 'Dr. Test Professional',
      specialty: 'Psychologist',
      license_number: 'PSY-12345',
    },
  });

  console.log('✅ Created test professional:', testProfessional.email);

  // Create test patients
  const patient1 = await prisma.patient.create({
    data: {
      professional_id: testProfessional.id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      notes: 'Initial consultation scheduled',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      professional_id: testProfessional.id,
      name: 'Jane Smith',
      phone: '+1234567890',
      notes: 'Follow-up assessment',
    },
  });

  console.log('✅ Created test patients:', patient1.name, patient2.name);

  // Create test assessment (pending)
  const assessment = await prisma.assessment.create({
    data: {
      patient_id: patient1.id,
      professional_id: testProfessional.id,
      instrument_type: 'PHQ9',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  console.log('✅ Created test assessment with token:', assessment.token);

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

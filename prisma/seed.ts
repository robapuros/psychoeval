import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // Create admin user
  const admin = await prisma.professional.upsert({
    where: { email: 'admin@psicoevalua.com' },
    update: {},
    create: {
      email: 'admin@psicoevalua.com',
      password_hash: await hash('Admin1234!', 12),
      name: 'Administrador Principal',
      role: 'ADMIN',
      specialty: 'Administración del Sistema',
    },
  });

  console.log('✅ Creado usuario admin:', admin.email);

  // Create test professional
  const professional = await prisma.professional.upsert({
    where: { email: 'psicologo@psicoevalua.com' },
    update: {},
    create: {
      email: 'psicologo@psicoevalua.com',
      password_hash: await hash('Test1234!', 12),
      name: 'Dr. Juan Pérez',
      role: 'PROFESSIONAL',
      specialty: 'Psicología Clínica',
      license_number: 'PSI-12345',
    },
  });

  console.log('✅ Creado profesional de prueba:', professional.email);

  // Create test patients
  const patient1 = await prisma.patient.create({
    data: {
      professional_id: professional.id,
      name: 'García Martín, Luis',
      email: 'luis.garcia@example.com',
      phone: '+34 600 000 001',
      notes: 'Derivación: Ansiedad generalizada. Primera consulta pendiente.',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      professional_id: professional.id,
      name: 'Fernández López, Ana',
      email: 'ana.fernandez@example.com',
      phone: '+34 600 000 002',
      notes: 'Seguimiento trimestral. Evolución positiva.',
    },
  });

  console.log('✅ Creados pacientes de prueba:', patient1.name, patient2.name);

  // Create a test assessment
  const assessment = await prisma.assessment.create({
    data: {
      patient_id: patient1.id,
      professional_id: professional.id,
      instrument_type: 'PHQ9',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    },
  });

  console.log('✅ Creada evaluación de prueba con token:', assessment.token);

  console.log('\n🎉 Seed completado!\n');
  console.log('🔐 Credenciales de acceso:');
  console.log('   Admin: admin@psicoevalua.com / Admin1234!');
  console.log('   Profesional: psicologo@psicoevalua.com / Test1234!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

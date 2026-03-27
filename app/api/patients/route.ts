import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/patients
 * Lista todos los pacientes del profesional autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Solo profesionales pueden acceder a esta ruta' },
        { status: 403 }
      );
    }

    const patients = await prisma.patient.findMany({
      where: { professionalId: session.user.id },
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            instrumentType: true,
            status: true,
            score: true,
            severity: true,
            completedAt: true,
            hasCriticalAlert: true,
          },
        },
        _count: {
          select: {
            assessments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Error al obtener pacientes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients
 * Crea un nuevo paciente
 * 
 * Body: {
 *   fullName: string;
 *   email?: string;
 *   phone?: string;
 *   notes?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Solo profesionales pueden crear pacientes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fullName, email, phone, notes } = body;

    // Validar nombre requerido
    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre completo es requerido' },
        { status: 400 }
      );
    }

    // Validar email si se proporciona
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Crear paciente
    const patient = await prisma.patient.create({
      data: {
        fullName: fullName.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        notes: notes?.trim() || null,
        professionalId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        notes: patient.notes,
        createdAt: patient.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Error al crear paciente' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/professionals
 * Lista todos los profesionales (solo admin)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden acceder a esta ruta' },
        { status: 403 }
      );
    }

    const professionals = await prisma.professional.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        specialty: true,
        licenseNumber: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            patients: true,
            assessments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ professionals });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json(
      { error: 'Error al obtener profesionales' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/professionals
 * Crea un nuevo profesional (solo admin)
 * 
 * Body: {
 *   email: string;
 *   name: string;
 *   password: string;
 *   specialty?: string;
 *   licenseNumber?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden crear profesionales' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, password, specialty, licenseNumber } = body;

    // Validar campos requeridos
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, nombre y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar contraseña (mínimo 8 caracteres)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Verificar que el email no exista
    const existing = await prisma.professional.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un profesional con ese email' },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear profesional
    const professional = await prisma.professional.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        password: hashedPassword,
        role: 'PROFESSIONAL',
        specialty: specialty?.trim() || null,
        licenseNumber: licenseNumber?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        specialty: true,
        licenseNumber: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      professional,
    });
  } catch (error) {
    console.error('Error creating professional:', error);
    return NextResponse.json(
      { error: 'Error al crear profesional' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db/client';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialty: z.string().optional(),
  license_number: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if email already exists
    const existing = await db.professional.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hash(validatedData.password, 12);

    // Create professional
    const professional = await db.professional.create({
      data: {
        email: validatedData.email.toLowerCase(),
        password_hash,
        name: validatedData.name,
        specialty: validatedData.specialty,
        license_number: validatedData.license_number,
      },
      select: {
        id: true,
        email: true,
        name: true,
        specialty: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      { professional, message: 'Registration successful' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', issues: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

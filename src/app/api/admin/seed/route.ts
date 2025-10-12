import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createAdminUser } from '@/lib/seed-admin';

export async function POST(req: NextRequest) {
  try {
    // Only allow in development or with specific environment variable
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_ADMIN_SEEDING) {
      return NextResponse.json(
        { message: 'Admin seeding not allowed in production' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { username, email, password } = body;

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Felhasználónév, email és jelszó megadása kötelező.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Érvénytelen email formátum.' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'A jelszónak legalább 8 karakter hosszúnak kell lennie.' },
        { status: 400 }
      );
    }

    // Create admin user
    const result = await createAdminUser(username, email, password);

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: result.message,
      admin: result.admin
    });

  } catch (error) {
    console.error('Admin seeding error:', error);
    
    return NextResponse.json(
      { message: 'Szerveroldali hiba történt.' },
      { status: 500 }
    );
  }
}
/**
 * API Route: POST /api/auth/verify-code
 * Passwordless Authentication - Verify Login Code
 *
 * Validates the 6-digit code and returns session token
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate code format (6 digits)
function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email cím megadása kötelező',
        },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Kód megadása kötelező',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Érvénytelen email cím formátum',
        },
        { status: 400 }
      );
    }

    if (!isValidCode(normalizedCode)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Érvénytelen kód formátum. A kód 6 számjegyből áll.',
        },
        { status: 400 }
      );
    }

    // Find verification token
    const token = await prisma.verificationToken.findFirst({
      where: {
        email: normalizedEmail,
        code: normalizedCode,
        used: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!token) {
      console.log(`[AUTH] Invalid code attempt for ${normalizedEmail}: ${normalizedCode.substring(0, 2)}****`);

      return NextResponse.json(
        {
          success: false,
          error: 'Érvénytelen vagy már felhasznált kód',
        },
        { status: 401 }
      );
    }

    // Check if code is expired
    if (token.expiresAt < new Date()) {
      console.log(`[AUTH] Expired code for ${normalizedEmail}`);

      // Mark as used to prevent retry
      await prisma.verificationToken.update({
        where: { id: token.id },
        data: { used: true },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'A kód lejárt. Kérjen új kódot.',
          expired: true,
        },
        { status: 401 }
      );
    }

    // SUCCESS - Mark code as used
    await prisma.verificationToken.update({
      where: { id: token.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    console.log(`[AUTH] ✅ Code verified successfully for ${normalizedEmail}`);

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If user doesn't exist, create new user
    if (!user) {
      console.log(`[AUTH] Creating new user for ${normalizedEmail}`);

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0], // Use email prefix as default name
          // No password needed for passwordless auth
        },
      });

      console.log(`[AUTH] ✅ New user created: ${user.id}`);
    }

    // Return user data for NextAuth session
    return NextResponse.json(
      {
        success: true,
        message: 'Sikeres bejelentkezés',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[AUTH] Verify code error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Kód ellenőrzése sikertelen. Kérjük, próbálja újra.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

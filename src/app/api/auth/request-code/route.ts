/**
 * API Route: POST /api/auth/request-code
 * Passwordless Authentication - Request Login Code
 *
 * Generates a 6-digit code, saves to database, sends email
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLoginCode } from '@/lib/email';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 codes per 5 minutes per email
const CODE_EXPIRY_MINUTES = 5;

// Generate random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

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

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Érvénytelen email cím formátum',
        },
        { status: 400 }
      );
    }

    // Rate Limiting: Check recent codes
    const recentCodesCount = await prisma.verificationToken.count({
      where: {
        email: normalizedEmail,
        createdAt: {
          gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS),
        },
      },
    });

    if (recentCodesCount >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        {
          success: false,
          error: `Túl sok kérés. Kérjük, várjon ${CODE_EXPIRY_MINUTES} percet.`,
          retryAfter: CODE_EXPIRY_MINUTES * 60, // seconds
        },
        { status: 429 }
      );
    }

    // Invalidate all previous unused codes for this email
    await prisma.verificationToken.updateMany({
      where: {
        email: normalizedEmail,
        used: false,
      },
      data: {
        used: true, // Mark as used to prevent reuse
      },
    });

    // Generate new code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Save code to database
    const token = await prisma.verificationToken.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    console.log(`[AUTH] Code generated for ${normalizedEmail}: ${code.substring(0, 2)}****`);

    // Send email with code
    const emailResult = await sendLoginCode(normalizedEmail, code, CODE_EXPIRY_MINUTES);

    if (!emailResult.success) {
      // Email failed but code is saved - return success anyway
      // User can still use the code if they got it through other means
      console.error(`[AUTH] Email sending failed for ${normalizedEmail}`);

      return NextResponse.json(
        {
          success: true,
          message: 'Kód generálva, de az email küldés sikertelen. Kérjük, próbálja újra.',
          expiresIn: CODE_EXPIRY_MINUTES * 60, // seconds
          // Development only: show preview URL
          ...(process.env.NODE_ENV === 'development' && emailResult.previewUrl
            ? { previewUrl: emailResult.previewUrl }
            : {}),
        },
        { status: 201 }
      );
    }

    // Success
    return NextResponse.json(
      {
        success: true,
        message: `Belépési kód elküldve a(z) ${normalizedEmail} címre`,
        expiresIn: CODE_EXPIRY_MINUTES * 60, // seconds
        // Development only: show preview URL
        ...(process.env.NODE_ENV === 'development' && emailResult.previewUrl
          ? { previewUrl: emailResult.previewUrl }
          : {}),
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[AUTH] Request code error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Belépési kód generálása sikertelen. Kérjük, próbálja újra.',
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

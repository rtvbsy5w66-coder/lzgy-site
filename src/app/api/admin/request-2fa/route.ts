import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLoginCode } from '@/lib/email';

const CODE_EXPIRY_MINUTES = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('[2FA] Request received for:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email és jelszó megadása kötelező' },
        { status: 400 }
      );
    }

    // 1. FIRST VERIFY PASSWORD (Step 1 of 2FA)
    const bcrypt = require('bcryptjs');
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      console.log('[2FA] User not found or no password');
      return NextResponse.json(
        { error: 'Hibás email vagy jelszó' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('[2FA] Invalid password');
      return NextResponse.json(
        { error: 'Hibás email vagy jelszó' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      console.log('[2FA] User is not admin');
      return NextResponse.json(
        { error: 'Csak admin felhasználók jelentkezhetnek be itt' },
        { status: 403 }
      );
    }

    console.log('[2FA] ✅ Password verified, proceeding to 2FA');

    // 2. CHECK RATE LIMITING
    const rateLimitStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const recentCodes = await prisma.admin2FACode.count({
      where: {
        email,
        createdAt: { gte: rateLimitStart }
      }
    });

    if (recentCodes >= MAX_REQUESTS_PER_WINDOW) {
      console.log(`[2FA] Rate limit exceeded for ${email}`);
      return NextResponse.json(
        { error: `Túl sok próbálkozás. Kérlek próbáld újra ${CODE_EXPIRY_MINUTES} perc múlva.` },
        { status: 429 }
      );
    }

    // 3. INVALIDATE OLD UNUSED CODES
    await prisma.admin2FACode.updateMany({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() }
      },
      data: {
        used: true,
        usedAt: new Date()
      }
    });

    // 4. GENERATE NEW CODE
    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    console.log(`[2FA] Generated code for ${email}: ${code.substring(0, 2)}****`);

    // 5. SAVE TO DATABASE
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await prisma.admin2FACode.create({
      data: {
        email,
        code,
        expiresAt,
        ipAddress,
        userAgent
      }
    });

    // 6. SEND EMAIL TO SECURITY EMAIL (lovas.zoltan1986@gmail.com)
    const securityEmail = process.env.ADMIN_2FA_EMAIL || 'lovas.zoltan1986@gmail.com';

    console.log(`[2FA] Sending code to security email: ${securityEmail}`);

    const emailResult = await sendLoginCode(securityEmail, code, CODE_EXPIRY_MINUTES);

    if (!emailResult.success) {
      console.error('[2FA] Failed to send email');
      return NextResponse.json(
        { error: 'Email küldési hiba történt' },
        { status: 500 }
      );
    }

    console.log('[2FA] ✅ 2FA code sent successfully');

    return NextResponse.json({
      success: true,
      message: `2FA kód elküldve a ${securityEmail} címre`,
      expiresIn: CODE_EXPIRY_MINUTES * 60
    }, { status: 201 });

  } catch (error) {
    console.error('[2FA] Error:', error);
    return NextResponse.json(
      { error: 'Szerveroldali hiba történt' },
      { status: 500 }
    );
  }
}

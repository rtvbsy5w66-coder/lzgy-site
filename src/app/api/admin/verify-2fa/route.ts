import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    console.log('[2FA Verify] Request received for:', email);

    // Validate input
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email és kód megadása kötelező' },
        { status: 400 }
      );
    }

    // Find valid code
    const validCode = await prisma.admin2FACode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!validCode) {
      console.log('[2FA Verify] Invalid or expired code');
      return NextResponse.json(
        { error: 'Érvénytelen vagy lejárt kód' },
        { status: 401 }
      );
    }

    // Mark code as used
    await prisma.admin2FACode.update({
      where: { id: validCode.id },
      data: {
        used: true,
        usedAt: new Date()
      }
    });

    console.log('[2FA Verify] ✅ Code verified successfully');

    return NextResponse.json({
      success: true,
      message: '2FA ellenőrzés sikeres'
    });

  } catch (error) {
    console.error('[2FA Verify] Error:', error);
    return NextResponse.json(
      { error: 'Szerveroldali hiba történt' },
      { status: 500 }
    );
  }
}

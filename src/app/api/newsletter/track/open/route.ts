import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign');
    const sequenceId = searchParams.get('sequence');
    const executionId = searchParams.get('execution');
    const email = searchParams.get('email');
    const emailOrder = searchParams.get('order');

    console.log('📖 Email megnyitás tracking:', { 
      campaignId, 
      sequenceId, 
      executionId, 
      email, 
      emailOrder 
    });

    // Sequence email tracking
    if (sequenceId && executionId && email) {
      try {
        // Frissítsük az execution statistikákat
        await prisma.sequenceExecution.update({
          where: { id: executionId },
          data: {
            emailsOpened: {
              increment: 1
            }
          }
        });

        // Log a megnyitást
        await prisma.sequenceLog.create({
          data: {
            executionId: executionId,
            action: 'EMAIL_OPENED',
            emailOrder: emailOrder ? parseInt(emailOrder) : null,
            details: JSON.stringify({
              emailType: `Email #${emailOrder || 'N/A'}`,
              userAgent: request.headers.get('user-agent'),
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
              timestamp: new Date().toISOString()
            })
          }
        });

        console.log(`✅ Sequence email megnyitás regisztrálva: ${email} - Email #${emailOrder}`);
      } catch (error) {
        console.error('❌ Sequence tracking hiba:', error);
      }
    }

    // Newsletter campaign tracking
    if (campaignId && email) {
      try {
        // Newsletter tracking logic - ha szükséges
        console.log(`📧 Newsletter tracking: ${campaignId} - ${email}`);
      } catch (error) {
        console.error('❌ Newsletter tracking hiba:', error);
      }
    }

    // Visszaadunk egy 1x1 pixel képet
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pixel.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ Email tracking error:', error);
    
    // Mindig adjunk vissza egy pixel képet, még hiba esetén is
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pixel.length.toString()
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}
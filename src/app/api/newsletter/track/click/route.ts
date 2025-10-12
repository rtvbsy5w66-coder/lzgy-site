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
    const url = searchParams.get('url');
    const linkText = searchParams.get('text');

    console.log('🖱️ Email klikk tracking:', { 
      campaignId, 
      sequenceId, 
      executionId, 
      email, 
      emailOrder,
      url,
      linkText
    });

    // Sequence email tracking
    if (sequenceId && executionId && email) {
      try {
        // Frissítsük az execution statistikákat
        await prisma.sequenceExecution.update({
          where: { id: executionId },
          data: {
            emailsClicked: {
              increment: 1
            }
          }
        });

        // Log a klikket
        await prisma.sequenceLog.create({
          data: {
            executionId: executionId,
            action: 'EMAIL_CLICKED',
            emailOrder: emailOrder ? parseInt(emailOrder) : null,
            details: JSON.stringify({
              emailType: `Email #${emailOrder || 'N/A'}`,
              clickedUrl: url,
              linkText: linkText,
              userAgent: request.headers.get('user-agent'),
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
              timestamp: new Date().toISOString()
            })
          }
        });

        console.log(`✅ Sequence email klikk regisztrálva: ${email} - Email #${emailOrder} - ${linkText}`);
      } catch (error) {
        console.error('❌ Sequence klikk tracking hiba:', error);
      }
    }

    // Newsletter campaign tracking
    if (campaignId && email) {
      try {
        // Newsletter klikk tracking logic - ha szükséges
        console.log(`📧 Newsletter klikk tracking: ${campaignId} - ${email}`);
      } catch (error) {
        console.error('❌ Newsletter klikk tracking hiba:', error);
      }
    }

    // Redirect a eredeti URL-re
    if (url) {
      // Ensure URL is properly encoded
      const targetUrl = decodeURIComponent(url);
      
      // Basic URL validation
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        return NextResponse.redirect(targetUrl);
      } else {
        console.warn('⚠️ Invalid URL for redirect:', targetUrl);
        return NextResponse.redirect('https://example.com'); // fallback
      }
    }

    // Ha nincs URL, visszairányítunk a főoldalra
    return NextResponse.redirect(process.env.NEXTAUTH_URL || 'http://localhost:3000');

  } catch (error) {
    console.error('❌ Email klikk tracking error:', error);
    
    // Fallback redirect
    return NextResponse.redirect(process.env.NEXTAUTH_URL || 'http://localhost:3000');
  } finally {
    await prisma.$disconnect();
  }
}
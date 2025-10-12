import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { AnonymousSignatureRequest } from '@/types/participation';
import { applySecurityMiddleware, SECURITY_CONFIGS } from '@/lib/security-middleware';
import { SecurityValidator } from '@/lib/security-utils';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 🔒 SECURITY: Apply petition signing security measures
  const securityResult = await applySecurityMiddleware(request, SECURITY_CONFIGS.PETITION_SIGN);
  if (securityResult) return securityResult;

  try {
    const petitionId = params.id;
    const body: AnonymousSignatureRequest = await request.json();

    // 🛡️ SECURITY: Validate input data
    if (!body.sessionId || typeof body.sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required for anonymous signing' },
        { status: 400 }
      );
    }

    // Validate petition exists and supports anonymous signing
    const petition = await prisma.petition.findUnique({
      where: {
        id: petitionId,
        isPublic: true,
        isActive: true,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        title: true,
        participationType: true,
        endDate: true,
        _count: {
          select: {
            signatures: true
          }
        }
      }
    });

    if (!petition) {
      return NextResponse.json(
        { error: 'Petition not found or not active' },
        { status: 404 }
      );
    }

    // Check if petition allows anonymous participation
    if (petition.participationType === 'REGISTERED') {
      return NextResponse.json(
        { error: 'This petition requires registered participation' },
        { status: 400 }
      );
    }

    // Check if petition has ended
    if (petition.endDate && new Date() > petition.endDate) {
      return NextResponse.json(
        { error: 'Petition has ended' },
        { status: 400 }
      );
    }

    // Check for duplicate anonymous signature from same session
    const existingSignature = await prisma.signature.findFirst({
      where: {
        petitionId,
        sessionId: body.sessionId,
        isAnonymous: true,
      },
    });

    if (existingSignature) {
      return NextResponse.json(
        { error: 'Ön már aláírta ezt a petíciót anonim módon' },
        { status: 400 }
      );
    }

    // Get client IP and User Agent for analytics (hashed for privacy)
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Hash IP address for privacy
    const hashedIP = crypto.createHash('sha256').update(ipAddress).digest('hex').substring(0, 16);

    // Create anonymous signature
    const signature = await prisma.signature.create({
      data: {
        petitionId,
        isAnonymous: true,
        sessionId: body.sessionId,
        
        // Optional demographic data (non-identifying)
        city: body.region || null,
        
        // Privacy settings
        showName: false,
        allowContact: false,
        
        // Metadata for analytics (anonymized)
        ipAddress: body.allowAnalytics ? hashedIP : null,
        userAgent: body.allowAnalytics ? userAgent.substring(0, 100) : null,
        
        // Status - anonymous signatures are immediately active
        status: 'VERIFIED',
        isEmailVerified: false, // N/A for anonymous
      },
    });

    // Store anonymized analytics data if consented
    if (body.allowAnalytics) {
      // This could be extended to store demographic analytics
      // in a separate analytics table if needed
    }

    return NextResponse.json({
      success: true,
      message: 'Anonim aláírás sikeresen rögzítve!',
      signatureId: signature.id,
      totalSignatures: petition._count.signatures + 1,
      analytics: body.allowAnalytics ? {
        sessionId: body.sessionId,
        timestamp: new Date().toISOString(),
        ageRange: body.ageRange,
        region: body.region
      } : null
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating anonymous signature:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ön már aláírta ezt a petíciót' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Hiba történt az anonim aláírás során' },
      { status: 500 }
    );
  }
}

// GET method to check if anonymous signing is allowed
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const petitionId = params.id;

    const petition = await prisma.petition.findUnique({
      where: {
        id: petitionId,
        isPublic: true,
        isActive: true,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        title: true,
        participationType: true,
        endDate: true,
      }
    });

    if (!petition) {
      return NextResponse.json(
        { error: 'Petition not found' },
        { status: 404 }
      );
    }

    const allowsAnonymous = petition.participationType === 'ANONYMOUS' || 
                          petition.participationType === 'HYBRID';

    const isActive = !petition.endDate || new Date() <= petition.endDate;

    return NextResponse.json({
      allowsAnonymous,
      isActive,
      participationType: petition.participationType,
      endDate: petition.endDate
    });

  } catch (error) {
    console.error('Error checking anonymous signing capability:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { CreateSignatureRequest } from '@/types/petition';
import { sendPetitionVerificationEmail } from '@/lib/email';
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
    const body: CreateSignatureRequest = await request.json();

    // 🛡️ SECURITY: Validate and sanitize input data
    console.log('[PETITION_SIGN] Validating input data:', {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      city: body.city,
      postalCode: body.postalCode
    });

    const validation = await SecurityValidator.validateUserInput(body);

    console.log('[PETITION_SIGN] Validation result:', {
      isValid: validation.isValid,
      errors: validation.errors
    });

    if (!validation.isValid) {
      console.error('[PETITION_SIGN] Validation failed:', validation.errors);
      return NextResponse.json(
        {
          error: 'Érvénytelen adatok',
          details: validation.errors
        },
        { status: 400 }
      );
    }
    
    // Use sanitized data
    const sanitizedData = validation.sanitizedData;

    // Validate petition exists and is active
    const petition = await prisma.petition.findUnique({
      where: {
        id: petitionId,
        isPublic: true,
        isActive: true,
        status: 'ACTIVE',
      },
    });

    if (!petition) {
      return NextResponse.json(
        { error: 'Petition not found or not active' },
        { status: 404 }
      );
    }

    // Check if petition has ended
    if (petition.endDate && new Date() > petition.endDate) {
      return NextResponse.json(
        { error: 'Petition has ended' },
        { status: 400 }
      );
    }

    // Check if user already signed (prevent duplicates)
    console.log('[PETITION_SIGN] Checking for existing signature:', {
      petitionId,
      email: sanitizedData.email
    });

    const existingSignature = await prisma.signature.findFirst({
      where: {
        petitionId,
        email: sanitizedData.email,
        isAnonymous: false,
      },
    });

    console.log('[PETITION_SIGN] Existing signature check:', {
      found: !!existingSignature,
      signatureId: existingSignature?.id
    });

    if (existingSignature) {
      console.log('[PETITION_SIGN] User already signed this petition');
      return NextResponse.json(
        { error: 'Ön már aláírta ezt a petíciót' },
        { status: 400 }
      );
    }

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    // Get client IP and User Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Create signature
    const signature = await prisma.signature.create({
      data: {
        petitionId,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        email: sanitizedData.email,
        city: sanitizedData.city || null,
        postalCode: sanitizedData.postalCode || null,
        showName: sanitizedData.showName || false,
        allowContact: sanitizedData.allowContact || false,
        emailVerifyToken,
        ipAddress: ipAddress.substring(0, 45), // Ensure it fits in DB
        userAgent: userAgent.substring(0, 1000), // Truncate if too long
        status: 'PENDING_VERIFICATION',
      },
    });

    // Send verification email
    try {
      const emailResult = await sendPetitionVerificationEmail(
        body.email,
        body.firstName,
        petition.title,
        emailVerifyToken,
        petitionId
      );
      
      if (!emailResult.success) {
        console.error('Failed to send verification email, but signature was saved');
        // Don't fail the request, just log the error
      } else if (emailResult.previewUrl) {
        console.log(`📧 Email preview available at: ${emailResult.previewUrl}`);
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Aláírás rögzítve, kérjük ellenőrizze email-jét a megerősítéshez.',
      signatureId: signature.id,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating signature:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ön már aláírta ezt a petíciót' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Hiba történt az aláírás során' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPetitionVerificationEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    const petitionId = params.id;
    const body = await request.json();
    const { signatureId } = body;

    if (!signatureId) {
      return NextResponse.json(
        { error: 'Signature ID is required' },
        { status: 400 }
      );
    }

    // Find the signature and verify ownership
    const signature = await prisma.signature.findFirst({
      where: {
        id: signatureId,
        petitionId: petitionId,
        OR: [
          { userId: session.user.id },
          { email: session.user.email }
        ],
        status: 'PENDING_VERIFICATION'
      },
      include: {
        petition: {
          select: {
            title: true,
            status: true
          }
        }
      }
    });

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature not found or already verified' },
        { status: 404 }
      );
    }

    // Check if petition is still active
    if (signature.petition.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot resend verification for inactive petition' },
        { status: 400 }
      );
    }

    // Check if signature is not too old (e.g., 7 days)
    const signatureAge = Date.now() - signature.signedAt.getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    if (signatureAge > maxAge) {
      return NextResponse.json(
        { error: 'Signature is too old for resending verification' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const newVerificationToken = randomBytes(32).toString('hex');

    // Update signature with new token
    await prisma.signature.update({
      where: { id: signature.id },
      data: {
        emailVerifyToken: newVerificationToken,
        // Reset verification timestamp for fresh 24-hour window
        signedAt: new Date()
      }
    });

    // Send verification email
    const emailResult = await sendPetitionVerificationEmail(
      signature.email || session.user.email!,
      signature.firstName || session.user.name?.split(' ')[0] || 'Felhasználó',
      signature.petition.title,
      newVerificationToken,
      petitionId
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    console.log(`✅ Verification email resent for signature ${signatureId}`);

    return NextResponse.json({
      success: true,
      message: 'Verification email has been resent successfully'
    });

  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
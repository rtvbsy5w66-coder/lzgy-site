import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const petitionId = params.id;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find signature with this token
    const signature = await prisma.signature.findFirst({
      where: {
        petitionId,
        emailVerifyToken: token,
        status: 'PENDING_VERIFICATION',
      },
      include: {
        petition: true,
      },
    });

    if (!signature) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 404 }
      );
    }

    // Check if token is not too old (e.g., 24 hours)
    const tokenAge = Date.now() - signature.signedAt.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Verify the signature
    const verifiedSignature = await prisma.signature.update({
      where: { id: signature.id },
      data: {
        status: 'VERIFIED',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerifyToken: null, // Remove token after verification
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email successfully verified! Your signature is now active.',
      petitionTitle: signature.petition.title,
    });

  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json(
      { error: 'Failed to verify signature' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const petitionId = params.id;
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Same verification logic as GET
    const signature = await prisma.signature.findFirst({
      where: {
        petitionId,
        emailVerifyToken: token,
        status: 'PENDING_VERIFICATION',
      },
      include: {
        petition: true,
      },
    });

    if (!signature) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 404 }
      );
    }

    // Check token age
    const tokenAge = Date.now() - signature.signedAt.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Verify the signature
    await prisma.signature.update({
      where: { id: signature.id },
      data: {
        status: 'VERIFIED',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerifyToken: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email successfully verified! Your signature is now active.',
      petitionTitle: signature.petition.title,
    });

  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json(
      { error: 'Failed to verify signature' },
      { status: 500 }
    );
  }
}
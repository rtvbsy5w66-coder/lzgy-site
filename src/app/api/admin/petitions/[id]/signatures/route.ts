import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const petitionId = params.id;

    // Get all signatures for this petition
    const signatures = await prisma.signature.findMany({
      where: {
        petitionId,
      },
      orderBy: {
        signedAt: 'desc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        city: true,
        postalCode: true,
        status: true,
        isEmailVerified: true,
        showName: true,
        allowContact: true,
        signedAt: true,
        ipAddress: true,
        userAgent: true,
      },
    });

    return NextResponse.json(signatures);
  } catch (error) {
    console.error('Error fetching petition signatures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    );
  }
}

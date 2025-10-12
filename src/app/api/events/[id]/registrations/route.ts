// src/app/api/events/[id]/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Esemény jelentkezéseinek lekérése (ADMIN only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const eventId = params.id;

    // Fetch all registrations for this event
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        eventId: eventId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('[EVENT_REGISTRATIONS_GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event registrations' },
      { status: 500 }
    );
  }
}

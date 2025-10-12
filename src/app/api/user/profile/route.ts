import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, phoneNumber } = body;

    // Validate input
    if (displayName && displayName.length > 100) {
      return NextResponse.json(
        { error: 'Becenév túl hosszú (max 100 karakter)' },
        { status: 400 }
      );
    }

    if (phoneNumber && phoneNumber.length > 20) {
      return NextResponse.json(
        { error: 'Telefonszám túl hosszú (max 20 karakter)' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        displayName: displayName || null,
        phoneNumber: phoneNumber || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        image: true,
        role: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profil sikeresen frissítve',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Belső szerver hiba' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user profile
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        name: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        image: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Felhasználó nem található' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Belső szerver hiba' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
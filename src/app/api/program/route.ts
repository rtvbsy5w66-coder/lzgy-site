import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const programPoints = await prisma.programPoint.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(programPoints.map(point => ({
      id: point.id,
      title: point.title,
      category: point.category,
      description: point.description,
      details: point.details,
      priority: point.priority,
      status: point.status.toLowerCase(),
      imageUrl: point.imageUrl,
      customColor: point.customColor
    })));

  } catch (error) {
    console.error('[PROGRAM_API] Database error:', error);
    return NextResponse.json(
      { error: 'Nem sikerült betölteni a programpontokat' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      category,
      description,
      details,
      priority,
      status,
      imageUrl,
      customColor,
      sortOrder
    } = body;

    const programPoint = await prisma.programPoint.create({
      data: {
        title,
        category,
        description,
        details,
        priority: parseInt(priority) || 2,
        status: status || 'PLANNED',
        imageUrl,
        customColor: customColor || null,
        sortOrder: sortOrder || 0,
        createdBy: session.user.id
      }
    });

    return NextResponse.json(programPoint);
  } catch (error) {
    console.error('Error creating program point:', error);
    return NextResponse.json(
      { error: 'Failed to create program point' },
      { status: 500 }
    );
  }
}

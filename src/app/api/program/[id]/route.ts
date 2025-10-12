import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programPoint = await prisma.programPoint.findUnique({
      where: { id: params.id }
    });

    if (!programPoint) {
      return NextResponse.json(
        { error: 'Program point not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(programPoint);
  } catch (error) {
    console.error('Error fetching program point:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program point' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      sortOrder,
      isActive
    } = body;

    const programPoint = await prisma.programPoint.update({
      where: { id: params.id },
      data: {
        title,
        category,
        description,
        details,
        priority: priority ? parseInt(priority) : undefined,
        status: status || undefined,
        imageUrl,
        customColor: customColor !== undefined ? (customColor || null) : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    return NextResponse.json(programPoint);
  } catch (error) {
    console.error('Error updating program point:', error);
    return NextResponse.json(
      { error: 'Failed to update program point' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.programPoint.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting program point:', error);
    return NextResponse.json(
      { error: 'Failed to delete program point' },
      { status: 500 }
    );
  }
}

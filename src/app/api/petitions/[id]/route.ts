import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

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
      },
      include: {
        category: true,
        _count: {
          select: {
            signatures: {
              where: {
                status: 'VERIFIED',
                isVisible: true,
              },
            },
          },
        },
      },
    });

    if (!petition) {
      return NextResponse.json(
        { error: 'Petition not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(petition);
  } catch (error) {
    console.error('Error fetching petition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch petition' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin-only endpoint for updating petitions
    const petitionId = params.id;
    const body = await request.json();
    
    // TODO: Add admin authentication check here
    
    const petition = await prisma.petition.update({
      where: { id: petitionId },
      data: {
        title: body.title,
        description: body.description,
        fullText: body.fullText,
        targetGoal: body.targetGoal,
        categoryId: body.categoryId,
        tags: body.tags,
        status: body.status,
        isPublic: body.isPublic,
        isActive: body.isActive,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        moderatedBy: body.moderatedBy,
        moderatedAt: body.moderatedBy ? new Date() : undefined,
      },
      include: {
        category: true,
        _count: {
          select: {
            signatures: true,
          },
        },
      },
    });

    return NextResponse.json(petition);
  } catch (error) {
    console.error('Error updating petition:', error);
    return NextResponse.json(
      { error: 'Failed to update petition' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin-only endpoint for deleting petitions
    const petitionId = params.id;
    
    // TODO: Add admin authentication check here
    
    await prisma.petition.delete({
      where: { id: petitionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting petition:', error);
    return NextResponse.json(
      { error: 'Failed to delete petition' },
      { status: 500 }
    );
  }
}
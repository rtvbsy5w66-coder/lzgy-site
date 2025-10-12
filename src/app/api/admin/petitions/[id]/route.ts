import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check here
    
    const petitionId = params.id;

    const petition = await prisma.petition.findUnique({
      where: { id: petitionId },
      include: {
        category: true,
        signatures: {
          include: {
            petition: {
              select: { title: true }
            }
          },
          orderBy: { signedAt: 'desc' },
        },
        _count: {
          select: {
            signatures: true,
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
    console.error('Error fetching admin petition:', error);
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
    // TODO: Add admin authentication check here
    
    const petitionId = params.id;
    const body = await request.json();
    
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
        publishedAt: body.status === 'ACTIVE' && !body.publishedAt ? new Date() : undefined,
        moderatedBy: body.moderatedBy || 'admin', // TODO: Get from session
        moderatedAt: new Date(),
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
    // TODO: Add admin authentication check here
    
    const petitionId = params.id;
    
    // First check if petition exists
    const petition = await prisma.petition.findUnique({
      where: { id: petitionId },
      include: {
        _count: {
          select: {
            signatures: true,
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

    // If petition has signatures, maybe we should archive instead of delete
    if (petition._count.signatures > 0) {
      // Archive instead of delete to preserve data integrity
      const archivedPetition = await prisma.petition.update({
        where: { id: petitionId },
        data: {
          status: 'ARCHIVED',
          isActive: false,
          moderatedBy: 'admin', // TODO: Get from session
          moderatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Petition archived due to existing signatures',
        petition: archivedPetition,
      });
    }

    // Delete petition if no signatures
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
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const issueId = params.id;

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        category: true,
        statusUpdates: {
          orderBy: { createdAt: 'desc' }
        },
        notifications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!issue) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      issue
    });

  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const issueId = params.id;
    const updates = await request.json();

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    // Log the update
    if (updates.status || updates.adminNotes) {
      await prisma.issueStatusUpdate.create({
        data: {
          issueId,
          previousStatus: updates.status ? undefined : undefined,
          newStatus: updates.status,
          comment: updates.adminNotes || `Status changed to ${updates.status}`,
          updatedBy: session.user.name || session.user.email || 'Admin',
          updatedByRole: 'admin'
        }
      });
    }

    return NextResponse.json({
      success: true,
      issue: updatedIssue
    });

  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
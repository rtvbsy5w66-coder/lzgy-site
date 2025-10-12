import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SequenceStatus } from "@prisma/client";

// PATCH /api/admin/sequences/[id] - Update sequence
export async function PATCH(
  request: Request,
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

    const { id } = params;
    const body = await request.json();

    // Check if sequence exists
    const existingSequence = await prisma.campaignSequence.findUnique({
      where: { id },
      include: { emails: true }
    });

    if (!existingSequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      );
    }

    // Handle status change
    if (body.status) {
      const newStatus = body.status as SequenceStatus;
      
      // Validate status transition
      if (!isValidStatusTransition(existingSequence.status, newStatus)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${existingSequence.status} to ${newStatus}` },
          { status: 400 }
        );
      }

      // Special handling for starting a sequence
      if (newStatus === 'RUNNING' && existingSequence.status === 'DRAFT') {
        // Validate sequence has emails
        if (existingSequence.emails.length === 0) {
          return NextResponse.json(
            { error: 'Cannot start sequence without emails' },
            { status: 400 }
          );
        }

        console.log(`🚀 Starting sequence: ${existingSequence.name}`);
      }

      // Special handling for pausing
      if (newStatus === 'PAUSED') {
        console.log(`⏸️ Pausing sequence: ${existingSequence.name}`);
      }

      // Special handling for resuming
      if (newStatus === 'RUNNING' && existingSequence.status === 'PAUSED') {
        console.log(`▶️ Resuming sequence: ${existingSequence.name}`);
      }
    }

    // Update sequence
    const updatedSequence = await prisma.campaignSequence.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        emails: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            emails: true,
            executions: true
          }
        }
      }
    });

    return NextResponse.json({ 
      sequence: updatedSequence,
      message: 'Sequence updated successfully' 
    });

  } catch (error) {
    console.error('Error updating sequence:', error);
    return NextResponse.json(
      { error: 'Failed to update sequence' },
      { status: 500 }
    );
  }
}

// GET /api/admin/sequences/[id] - Get single sequence with details
export async function GET(
  request: Request,
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

    const { id } = params;

    const sequence = await prisma.campaignSequence.findUnique({
      where: { id },
      include: {
        emails: {
          orderBy: { order: 'asc' }
        },
        executions: {
          include: {
            logs: {
              orderBy: { timestamp: 'desc' },
              take: 5
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            emails: true,
            executions: true
          }
        }
      }
    });

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      );
    }

    // Calculate detailed stats
    const executions = sequence.executions;
    const stats = {
      totalSubscribers: executions.length,
      activeSubscribers: executions.filter(e => e.status === 'ACTIVE').length,
      completedSubscribers: executions.filter(e => e.status === 'COMPLETED').length,
      pausedSubscribers: executions.filter(e => e.status === 'PAUSED').length,
      failedSubscribers: executions.filter(e => e.status === 'FAILED').length,
      unsubscribedSubscribers: executions.filter(e => e.unsubscribed).length,
      
      totalEmailsSent: executions.reduce((sum, e) => sum + e.emailsSent, 0),
      totalEmailsOpened: executions.reduce((sum, e) => sum + e.emailsOpened, 0),
      totalEmailsClicked: executions.reduce((sum, e) => sum + e.emailsClicked, 0),
      
      // Step distribution
      stepDistribution: executions.reduce((acc, e) => {
        acc[e.currentStep] = (acc[e.currentStep] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    };

    return NextResponse.json({ 
      sequence: {
        ...sequence,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching sequence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sequence' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sequences/[id] - Delete sequence
export async function DELETE(
  request: Request,
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

    const { id } = params;

    // Check if sequence exists and can be deleted
    const sequence = await prisma.campaignSequence.findUnique({
      where: { id },
      include: { executions: true }
    });

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      );
    }

    // Don't allow deletion of running sequences with active executions
    if (sequence.status === 'RUNNING' && sequence.executions.some(e => e.status === 'ACTIVE')) {
      return NextResponse.json(
        { error: 'Cannot delete running sequence with active executions. Pause first.' },
        { status: 400 }
      );
    }

    // Delete sequence (cascade will handle related records)
    await prisma.campaignSequence.delete({
      where: { id }
    });

    console.log(`🗑️ Deleted sequence: ${sequence.name}`);

    return NextResponse.json({ 
      message: 'Sequence deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting sequence:', error);
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    );
  }
}

// Helper function to validate status transitions
function isValidStatusTransition(currentStatus: SequenceStatus, newStatus: SequenceStatus): boolean {
  const validTransitions: Record<SequenceStatus, SequenceStatus[]> = {
    DRAFT: ['SCHEDULED', 'RUNNING', 'CANCELLED'],
    SCHEDULED: ['RUNNING', 'CANCELLED'],
    RUNNING: ['PAUSED', 'COMPLETED', 'CANCELLED'],
    PAUSED: ['RUNNING', 'CANCELLED'],
    COMPLETED: [], // Completed sequences cannot be changed
    CANCELLED: []  // Cancelled sequences cannot be changed
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}
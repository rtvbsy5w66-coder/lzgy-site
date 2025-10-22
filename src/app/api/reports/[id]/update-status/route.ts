import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['submitted', 'in_progress', 'resolved', 'archived']),
  assignedTo: z.string().optional(),
  resolutionNote: z.string().optional(),
  internalNotes: z.string().optional(),
  comment: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id: params.id },
      select: { 
        id: true, 
        authorId: true, 
        status: true,
        title: true,
      },
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Authorization check: Only admins or report author can update
    if (user.role !== 'ADMIN' && user.id !== existingReport.authorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {
      status: validatedData.status,
      updatedAt: new Date(),
    };

    if (validatedData.assignedTo) {
      updateData.assignedTo = validatedData.assignedTo;
    }

    if (validatedData.resolutionNote) {
      updateData.resolutionNote = validatedData.resolutionNote;
    }

    if (validatedData.internalNotes) {
      updateData.internalNotes = validatedData.internalNotes;
    }

    // Set resolvedAt if status is resolved
    if (validatedData.status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: { name: true, email: true },
        },
        address: true,
        _count: {
          select: {
            attachments: true,
            history: true,
          },
        },
      },
    });

    // Create history entry
    const historyData = {
      reportId: params.id,
      changedBy: user.name || 'System',
      action: 'status_changed' as const,
      oldValue: existingReport.status,
      newValue: validatedData.status,
      comment: validatedData.comment || `Státusz módosítva: ${existingReport.status} → ${validatedData.status}`,
    };

    await prisma.reportHistory.create({ data: historyData });

    // If assigned to someone, create another history entry
    if (validatedData.assignedTo) {
      await prisma.reportHistory.create({
        data: {
          reportId: params.id,
          changedBy: user.name || 'System',
          action: 'assigned',
          newValue: validatedData.assignedTo,
          comment: `Kiosztva: ${validatedData.assignedTo}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedReport,
    });

  } catch (error) {
    console.error('Update report status error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendReportStatusUpdateEmail } from '@/lib/email';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bejelentkezés szükséges' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nincs jogosultság' },
        { status: 403 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        attachments: true,
        history: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Bejelentés nem található' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Hiba történt a bejelentés betöltése során' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bejelentkezés szükséges' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nincs jogosultság' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      status,
      urgency,
      department,
      assignedTo,
      estimatedCost,
      resolutionNote,
      internalNotes,
      statusComment,
    } = body;

    // First, fetch the current report to check if status changed
    const currentReport = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!currentReport) {
      return NextResponse.json(
        { error: 'Bejelentés nem található' },
        { status: 404 }
      );
    }

    const statusChanged = currentReport.status !== status;

    const updateData: any = {
      title,
      description,
      status,
      urgency,
      department: department || null,
      assignedTo: assignedTo || null,
      estimatedCost: estimatedCost || null,
      resolutionNote: resolutionNote || null,
      internalNotes: internalNotes || null,
    };

    // If status is changed to RESOLVED and there's a resolution note, set resolvedAt
    if (status === 'RESOLVED' && resolutionNote) {
      updateData.resolvedAt = new Date();
    }

    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: updateData,
    });

    // Create history entry if status changed
    if (statusChanged) {
      await prisma.reportHistory.create({
        data: {
          reportId: params.id,
          action: status,
          changedBy: session.user.name || session.user.email || 'Admin',
          comment: statusComment || null,
        },
      });

      // Send email notification to the user
      if (currentReport.author.email) {
        try {
          await sendReportStatusUpdateEmail({
            to: currentReport.author.email,
            reportId: updatedReport.id,
            title: updatedReport.title,
            oldStatus: currentReport.status,
            newStatus: status,
            comment: statusComment,
            userName: currentReport.author.name || 'Bejelentő',
          });
          console.log('[REPORT_UPDATE] ✅ Status update email sent to:', currentReport.author.email);
        } catch (emailError) {
          console.error('[REPORT_UPDATE] ❌ Failed to send email:', emailError);
          // Don't fail the whole request if email fails
        }
      }
    }

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Hiba történt a bejelentés frissítése során' },
      { status: 500 }
    );
  }
}

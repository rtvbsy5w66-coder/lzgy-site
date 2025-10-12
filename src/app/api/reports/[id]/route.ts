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
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get report details
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { name: true, email: true },
        },
        address: true,
        attachments: {
          select: {
            id: true,
            filename: true,
            fileUrl: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true,
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            changedBy: true,
            action: true,
            oldValue: true,
            newValue: true,
            comment: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Authorization check: Only admins or report author can view details
    if (user.role !== 'ADMIN' && user.id !== report.authorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: report,
    });

  } catch (error) {
    console.error('Get report details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
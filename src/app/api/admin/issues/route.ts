import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const urgency = searchParams.get('urgency');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) where.status = status;
    if (category) where.categoryId = category;
    if (urgency) where.urgency = urgency;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const issues = await prisma.issue.findMany({
      where,
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        category: true
      }
    });

    // Transform data for frontend
    const transformedIssues = issues.map(issue => ({
      id: issue.id,
      trackingNumber: issue.trackingNumber,
      title: issue.title,
      description: issue.description,
      location: issue.location,
      categoryId: issue.categoryId,
      urgency: issue.urgency,
      status: issue.status,
      reporterName: issue.reporterName,
      reporterEmail: issue.reporterEmail,
      customFields: issue.customFields || {},
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      issues: transformedIssues
    });

  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
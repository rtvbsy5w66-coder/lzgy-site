import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bypassAuth = searchParams.get('bypass_auth');
    
    // Check auth unless bypass is requested (for testing)
    if (!bypassAuth) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get query parameters
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (urgency && urgency !== 'all') {
      where.urgency = urgency;
    }

    // Get current user (only if not bypassing auth)
    let user = null;
    if (!bypassAuth) {
      const session = await getServerSession(authOptions);
      user = await prisma.user.findUnique({
        where: { email: session?.user?.email! },
      });

      // If regular user, only show their reports
      if (user?.role !== 'ADMIN') {
        where.authorId = user?.id;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch reports
    const [reports, totalCount] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
          address: true,
          _count: {
            select: {
              attachments: true,
              history: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('List reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
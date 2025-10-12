import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};

    // Add filters
    if (status) {
      where.status = status;
    }

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch all petitions (including draft, private, etc.)
    const petitions = await prisma.petition.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            signatures: true,
          },
        },
      },
      orderBy: [
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json(petitions);
  } catch (error) {
    console.error('Error fetching admin petitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch petitions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    
    const body = await request.json();
    
    const petition = await prisma.petition.create({
      data: {
        title: body.title,
        description: body.description,
        fullText: body.fullText,
        targetGoal: body.targetGoal || 100,
        categoryId: body.categoryId,
        tags: body.tags,
        status: body.status || 'ACTIVE', // Auto-publish as per requirements
        isPublic: body.isPublic ?? true,
        isActive: body.isActive ?? true,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        publishedAt: body.status === 'ACTIVE' ? new Date() : null,
        createdBy: body.createdBy || 'admin', // TODO: Get from session
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

    return NextResponse.json(petition, { status: 201 });
  } catch (error) {
    console.error('Error creating petition:', error);
    return NextResponse.json(
      { error: 'Failed to create petition' },
      { status: 500 }
    );
  }
}
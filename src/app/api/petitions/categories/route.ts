import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.petitionCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            petitions: {
              where: {
                isPublic: true,
                isActive: true,
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching petition categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin-only endpoint for creating categories
    const body = await request.json();
    
    // TODO: Add admin authentication check here
    
    const category = await prisma.petitionCategory.create({
      data: {
        name: body.name,
        description: body.description,
        color: body.color || '#3b82f6',
        sortOrder: body.sortOrder || 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating petition category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
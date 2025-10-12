import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { PetitionListFilters } from '@/types/petition';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: PetitionListFilters = {
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') as any || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Build where clause
    const where: any = {
      isPublic: true,
      isActive: true,
    };

    // Add status filter (default to ACTIVE for public)
    if (filters.status) {
      where.status = filters.status;
    } else {
      where.status = 'ACTIVE';
    }

    // Add category filter
    if (filters.category) {
      where.categoryId = filters.category;
    }

    // Add search filter
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Get current session
    const session = await getServerSession(authOptions);

    // Fetch petitions with relations
    const petitions = await prisma.petition.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            signatures: {
              where: {
                status: 'VERIFIED',
                isVisible: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // Active first
        { createdAt: 'desc' },
      ],
      take: filters.limit,
      skip: filters.offset,
    });

    // Check if user has signed each petition (for logged-in users)
    let userSignatures: Map<string, any> = new Map();
    if (session?.user?.email) {
      const signatures = await prisma.signature.findMany({
        where: {
          user: {
            email: session.user.email
          },
          petitionId: { in: petitions.map(p => p.id) },
          status: { in: ['PENDING_VERIFICATION', 'VERIFIED'] } // Include pending and verified
        }
      });
      signatures.forEach(signature => {
        userSignatures.set(signature.petitionId, signature);
      });
    }

    // Add signature status to each petition
    const petitionsWithSignatureStatus = petitions.map(petition => {
      const userSignature = userSignatures.get(petition.id);
      
      return {
        ...petition,
        hasSigned: !!userSignature,
        userSignature: userSignature ? {
          signedAt: userSignature.signedAt,
          status: userSignature.status,
          showName: userSignature.showName
        } : null
      };
    });

    return NextResponse.json(petitionsWithSignatureStatus);
  } catch (error) {
    console.error('Error fetching petitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch petitions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin-only endpoint for creating petitions
    const body = await request.json();
    
    // TODO: Add admin authentication check here
    
    const petition = await prisma.petition.create({
      data: {
        title: body.title,
        description: body.description,
        fullText: body.fullText,
        targetGoal: body.targetGoal || 100,
        categoryId: body.categoryId,
        tags: body.tags,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isPublic: body.isPublic ?? true,
        status: 'ACTIVE', // Auto-publish as per requirements
        publishedAt: new Date(),
        createdBy: body.createdBy,
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
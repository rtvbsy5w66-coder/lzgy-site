import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    
    const where: any = {};
    
    // Public polls only for non-admin users
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      where.isPublic = true;
      where.status = { in: ['SCHEDULED', 'ACTIVE', 'CLOSED'] };
    } else {
      // Admin can see all polls
      if (status) where.status = status;
    }
    
    if (category) where.category = category;

    // Add time-based filtering for active polls
    const now = new Date();
    if (!session?.user || session.user.role !== 'ADMIN') {
      // For public users, filter by active time windows
      where.OR = [
        { startDate: null }, // No start date restriction
        { startDate: { lte: now } }, // Started already
      ];
    }

    const polls = await prisma.poll.findMany({
      where,
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit ? parseInt(limit) : undefined,
    });

    // Check if user has voted on each poll (for logged-in users)
    let userVotes: Map<string, any> = new Map();
    if (session?.user?.email) {
      const votes = await prisma.pollVote.findMany({
        where: {
          user: {
            email: session.user.email
          },
          pollId: { in: polls.map(p => p.id) }
        },
        include: {
          option: true
        }
      });
      votes.forEach(vote => {
        userVotes.set(vote.pollId, vote);
      });
    }

    // Calculate poll status based on current time and user vote status
    const pollsWithStatus = polls.map(poll => {
      let currentStatus = poll.status;
      
      if (poll.status === 'SCHEDULED' && poll.startDate && new Date(poll.startDate) <= now) {
        currentStatus = 'ACTIVE';
      }
      
      if (poll.status === 'ACTIVE' && poll.endDate && new Date(poll.endDate) <= now) {
        currentStatus = 'CLOSED';
      }

      const userVote = userVotes.get(poll.id);
      
      return {
        ...poll,
        currentStatus,
        timeRemaining: poll.endDate ? Math.max(0, new Date(poll.endDate).getTime() - now.getTime()) / 1000 : null,
        hasVoted: !!userVote,
        userVote: userVote ? {
          optionId: userVote.optionId,
          votedAt: userVote.votedAt,
          selectedOption: userVote.option?.optionText
        } : null
      };
    });

    return NextResponse.json(pollsWithStatus);
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      timeLimit,
      isPublic,
      allowAnonymous,
      maxVotesPerUser,
      showResults,
      showLiveCount,
      options,
    } = body;

    // Validate time constraints
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Determine initial status
    let initialStatus = 'DRAFT';
    if (startDate) {
      const now = new Date();
      initialStatus = new Date(startDate) <= now ? 'ACTIVE' : 'SCHEDULED';
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        category,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        isPublic: isPublic ?? true,
        allowAnonymous: allowAnonymous ?? true,
        maxVotesPerUser: maxVotesPerUser ? parseInt(maxVotesPerUser) : null,
        showResults: showResults || 'AFTER_VOTING',
        showLiveCount: showLiveCount ?? false,
        status: initialStatus as any,
        publishedAt: initialStatus !== 'DRAFT' ? new Date() : null,
        options: {
          create: options?.map((option: any, index: number) => ({
            optionText: option.optionText,
            description: option.description,
            imageUrl: option.imageUrl,
            sortOrder: index,
          })) || [],
        },
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    );
  }
}
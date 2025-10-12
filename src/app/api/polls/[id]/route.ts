import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';
    const userId = session?.user?.id;
    
    const poll = await prisma.poll.findUnique({
      where: { id: params.id },
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        votes: userId ? {
          where: { userId },
        } : false,
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check if user can access this poll
    if (!isAdmin && (!poll.isPublic || !['SCHEDULED', 'ACTIVE', 'CLOSED'].includes(poll.status))) {
      return NextResponse.json(
        { error: 'Poll not accessible' },
        { status: 403 }
      );
    }

    // Calculate current poll status and time remaining
    const now = new Date();
    let currentStatus = poll.status;
    let timeRemaining: number | null = null;
    let timeUntilStart: number | null = null;
    let canVote = false;

    if (poll.startDate && new Date(poll.startDate) > now) {
      currentStatus = 'SCHEDULED';
      timeUntilStart = Math.floor((new Date(poll.startDate).getTime() - now.getTime()) / 1000);
    } else if (poll.endDate && new Date(poll.endDate) <= now) {
      currentStatus = 'CLOSED';
    } else if (poll.status === 'ACTIVE' || (poll.startDate && new Date(poll.startDate) <= now && (!poll.endDate || new Date(poll.endDate) > now))) {
      currentStatus = 'ACTIVE';
      canVote = true;
      if (poll.endDate) {
        timeRemaining = Math.floor((new Date(poll.endDate).getTime() - now.getTime()) / 1000);
      }
    }

    // Check voting eligibility
    let userVote = null;
    let hasVoted = false;
    let votesLeft = poll.maxVotesPerUser;

    if (userId && poll.votes) {
      userVote = poll.votes[0] || null;
      hasVoted = !!userVote;
      if (poll.maxVotesPerUser) {
        const userVoteCount = await prisma.pollVote.count({
          where: { pollId: params.id, userId },
        });
        votesLeft = Math.max(0, poll.maxVotesPerUser - userVoteCount);
        canVote = canVote && votesLeft > 0;
      }
    } else if (!poll.allowAnonymous && !userId) {
      canVote = false;
    }

    // Prepare response based on result visibility settings
    let results = null;
    if (isAdmin || 
        poll.showResults === 'LIVE' || 
        (poll.showResults === 'AFTER_VOTING' && hasVoted) ||
        (poll.showResults === 'AFTER_END' && currentStatus === 'CLOSED')) {
      
      const totalVotes = poll._count.votes;
      results = poll.options.map(option => ({
        option,
        voteCount: option._count.votes,
        percentage: totalVotes > 0 ? (option._count.votes / totalVotes) * 100 : 0,
      }));
    }

    const response = {
      ...poll,
      currentStatus,
      timeRemaining,
      timeUntilStart,
      canVote,
      hasVoted,
      votesLeft,
      userVote,
      results,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
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
      status,
      options,
    } = body;

    // Validate time constraints
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Delete existing options if new ones are provided
    if (options) {
      await prisma.pollOption.deleteMany({
        where: { pollId: params.id },
      });
    }

    const poll = await prisma.poll.update({
      where: { id: params.id },
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
        status,
        publishedAt: status !== 'DRAFT' && status !== null ? new Date() : null,
        options: options ? {
          create: options.map((option: any, index: number) => ({
            optionText: option.optionText,
            description: option.description,
            imageUrl: option.imageUrl,
            sortOrder: index,
          })),
        } : undefined,
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json(poll);
  } catch (error) {
    console.error('Error updating poll:', error);
    return NextResponse.json(
      { error: 'Failed to update poll' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
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

    await prisma.poll.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting poll:', error);
    return NextResponse.json(
      { error: 'Failed to delete poll' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { optionId, timeSpent, sessionId } = body;
    
    // Get user info
    const headersList = headers();
    const userAgent = headersList.get('user-agent');
    const forwarded = headersList.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     headersList.get('x-real-ip') || 
                     request.ip || 
                     'unknown';

    // Fetch poll with current status
    const poll = await prisma.poll.findUnique({
      where: { id: params.id },
      include: {
        options: true,
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check if poll is accessible
    if (!poll.isPublic) {
      return NextResponse.json(
        { error: 'Poll not accessible' },
        { status: 403 }
      );
    }

    // Validate poll timing
    const now = new Date();
    
    // Check if poll has started
    if (poll.startDate && new Date(poll.startDate) > now) {
      return NextResponse.json(
        { error: 'Poll has not started yet' },
        { status: 400 }
      );
    }

    // Check if poll has ended
    if (poll.endDate && new Date(poll.endDate) <= now) {
      return NextResponse.json(
        { error: 'Poll has ended' },
        { status: 400 }
      );
    }

    // Check if poll is active
    if (poll.status !== 'ACTIVE' && !(poll.status === 'SCHEDULED' && poll.startDate && new Date(poll.startDate) <= now)) {
      return NextResponse.json(
        { error: 'Poll is not currently accepting votes' },
        { status: 400 }
      );
    }

    // Validate option exists
    const selectedOption = poll.options.find(opt => opt.id === optionId);
    if (!selectedOption) {
      return NextResponse.json(
        { error: 'Invalid option selected' },
        { status: 400 }
      );
    }

    // Check authentication requirements
    if (!poll.allowAnonymous && !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required for this poll' },
        { status: 401 }
      );
    }

    const userId = session?.user?.id;
    
    // Check if user has already voted (for authenticated users)
    if (userId && poll.maxVotesPerUser !== null) {
      const existingVoteCount = await prisma.pollVote.count({
        where: {
          pollId: params.id,
          userId: userId,
        },
      });

      if (poll.maxVotesPerUser === 1 && existingVoteCount > 0) {
        return NextResponse.json(
          { error: 'You have already voted in this poll' },
          { status: 400 }
        );
      }

      if (existingVoteCount >= poll.maxVotesPerUser) {
        return NextResponse.json(
          { error: 'Maximum votes reached for this poll' },
          { status: 400 }
        );
      }
    }

    // For single-vote polls, check for existing vote by session/IP for anonymous users
    if (!userId && poll.maxVotesPerUser === 1) {
      const anonymousVoteWhere: any = { pollId: params.id };
      
      if (sessionId) {
        anonymousVoteWhere.sessionId = sessionId;
      } else {
        anonymousVoteWhere.ipAddress = ipAddress;
      }
      
      const existingAnonymousVote = await prisma.pollVote.findFirst({
        where: anonymousVoteWhere,
      });

      if (existingAnonymousVote) {
        return NextResponse.json(
          { error: 'You have already voted in this poll' },
          { status: 400 }
        );
      }
    }

    // Create the vote
    const vote = await prisma.pollVote.create({
      data: {
        pollId: params.id,
        optionId: optionId,
        userId: userId || null,
        sessionId: sessionId || null,
        ipAddress,
        userAgent,
        timeSpent: timeSpent ? parseInt(timeSpent) : null,
      },
      include: {
        option: true,
        poll: {
          include: {
            options: {
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
        },
      },
    });

    // Update poll status to ACTIVE if it was SCHEDULED and now started
    if (poll.status === 'SCHEDULED' && poll.startDate && new Date(poll.startDate) <= now) {
      await prisma.poll.update({
        where: { id: params.id },
        data: { status: 'ACTIVE' },
      });
    }

    // Prepare results if allowed
    let results = null;
    if (poll.showResults === 'AFTER_VOTING' || poll.showResults === 'LIVE') {
      const totalVotes = vote.poll._count.votes;
      results = vote.poll.options.map(option => ({
        option: {
          id: option.id,
          optionText: option.optionText,
          description: option.description,
        },
        voteCount: option._count.votes,
        percentage: totalVotes > 0 ? (option._count.votes / totalVotes) * 100 : 0,
      }));
    }

    const response = {
      success: true,
      vote: {
        id: vote.id,
        optionId: vote.optionId,
        votedAt: vote.votedAt,
      },
      results,
      message: 'Vote recorded successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
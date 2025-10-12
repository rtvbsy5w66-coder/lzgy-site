import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { AnonymousVoteRequest } from '@/types/participation';
import { applySecurityMiddleware, SECURITY_CONFIGS } from '@/lib/security-middleware';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 🔒 SECURITY: Apply voting security measures
  const securityResult = await applySecurityMiddleware(request, SECURITY_CONFIGS.PETITION_SIGN);
  if (securityResult) return securityResult;

  try {
    const pollId = params.id;
    const body: AnonymousVoteRequest = await request.json();

    // 🛡️ SECURITY: Validate input data
    if (!body.sessionId || typeof body.sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required for anonymous voting' },
        { status: 400 }
      );
    }

    if (!body.optionId || typeof body.optionId !== 'string') {
      return NextResponse.json(
        { error: 'Option ID is required' },
        { status: 400 }
      );
    }

    // Validate poll exists and supports anonymous voting
    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
        isActive: true,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        title: true,
        participationType: true,
        startDate: true,
        endDate: true,
        maxVotesPerUser: true,
        allowAnonymous: true,
        options: {
          select: {
            id: true,
            optionText: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found or not active' },
        { status: 404 }
      );
    }

    // Check if poll allows anonymous participation
    if (poll.participationType === 'REGISTERED') {
      return NextResponse.json(
        { error: 'This poll requires registered participation' },
        { status: 400 }
      );
    }

    // Check if poll has started
    if (poll.startDate && new Date() < poll.startDate) {
      return NextResponse.json(
        { error: 'Poll has not started yet' },
        { status: 400 }
      );
    }

    // Check if poll has ended
    if (poll.endDate && new Date() > poll.endDate) {
      return NextResponse.json(
        { error: 'Poll has ended' },
        { status: 400 }
      );
    }

    // Validate option exists
    const validOption = poll.options.find(opt => opt.id === body.optionId);
    if (!validOption) {
      return NextResponse.json(
        { error: 'Invalid option selected' },
        { status: 400 }
      );
    }

    // Check for duplicate vote from same session
    const existingVote = await prisma.pollVote.findFirst({
      where: {
        pollId,
        sessionId: body.sessionId,
        userId: null, // Anonymous votes have null userId
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Ön már szavazott ennél a szavazásnál anonim módon' },
        { status: 400 }
      );
    }

    // Get client IP and User Agent for analytics (hashed for privacy)
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Hash IP address for privacy
    const hashedIP = crypto.createHash('sha256').update(ipAddress).digest('hex').substring(0, 16);

    // Create anonymous vote
    const vote = await prisma.pollVote.create({
      data: {
        pollId,
        optionId: body.optionId,
        userId: null, // Anonymous vote
        sessionId: body.sessionId,
        
        // Metadata for analytics (anonymized)
        ipAddress: body.allowAnalytics ? hashedIP : null,
        userAgent: body.allowAnalytics ? userAgent.substring(0, 100) : null,
        timeSpent: body.timeSpent || null,
      },
    });

    // Get updated vote counts for the poll
    const voteCountsByOption = await prisma.pollVote.groupBy({
      by: ['optionId'],
      where: {
        pollId: pollId,
      },
      _count: {
        optionId: true,
      },
    });

    // Format results
    const results = poll.options.map(option => ({
      id: option.id,
      optionText: option.optionText,
      voteCount: voteCountsByOption.find(vc => vc.optionId === option.id)?._count.optionId || 0
    }));

    const totalVotes = poll._count.votes + 1;

    return NextResponse.json({
      success: true,
      message: 'Anonim szavazat sikeresen rögzítve!',
      voteId: vote.id,
      selectedOption: validOption,
      totalVotes,
      results: results,
      analytics: body.allowAnalytics ? {
        sessionId: body.sessionId,
        timestamp: new Date().toISOString(),
        timeSpent: body.timeSpent
      } : null
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating anonymous vote:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ön már szavazott ennél a szavazásnál' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Hiba történt az anonim szavazás során' },
      { status: 500 }
    );
  }
}

// GET method to check if anonymous voting is allowed
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id;

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
        isActive: true,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        title: true,
        participationType: true,
        startDate: true,
        endDate: true,
        allowAnonymous: true,
      }
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    const allowsAnonymous = poll.participationType === 'ANONYMOUS' || 
                          poll.participationType === 'HYBRID' ||
                          poll.allowAnonymous;

    const now = new Date();
    const isActive = (!poll.startDate || now >= poll.startDate) && 
                    (!poll.endDate || now <= poll.endDate);

    return NextResponse.json({
      allowsAnonymous,
      isActive,
      participationType: poll.participationType,
      startDate: poll.startDate,
      endDate: poll.endDate
    });

  } catch (error) {
    console.error('Error checking anonymous voting capability:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
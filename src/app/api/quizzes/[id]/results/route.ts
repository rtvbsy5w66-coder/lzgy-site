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
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('admin') === 'true';
    
    // Admin view requires admin role
    if (adminView && (!session?.user || session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized for admin view' },
        { status: 401 }
      );
    }

    // Check if quiz exists and is published (for public access)
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: {
        title: true,
        description: true,
        category: true,
        status: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // For non-admin users, only show results for published quizzes
    if (!adminView && quiz.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Quiz not available' },
        { status: 404 }
      );
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Higher limit for leaderboard
    const offset = (page - 1) * limit;

    const [results, total] = await Promise.all([
      prisma.quizResult.findMany({
        where: { quizId: params.id },
        include: {
          user: adminView ? {
            select: {
              name: true,
              email: true,
            },
          } : {
            select: {
              name: true, // Only name for public leaderboard
            },
          },
          // Only include answers for admin view
          ...(adminView && {
            answers: {
              include: {
                question: {
                  select: {
                    question: true,
                    points: true,
                  },
                },
                option: {
                  select: {
                    optionText: true,
                    isCorrect: true,
                  },
                },
              },
            },
          }),
        },
        orderBy: [
          { score: 'desc' }, // Sort by score first (highest to lowest)
          { timeSpent: 'asc' }, // Then by time (fastest to slowest)
          { completedAt: 'asc' } // Finally by completion time (earliest first)
        ],
        skip: offset,
        take: limit,
      }),
      prisma.quizResult.count({
        where: { quizId: params.id },
      }),
    ]);

    // Calculate statistics
    const stats = {
      totalAttempts: total,
      averageScore: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length * 10) / 10
        : 0,
      averagePercentage: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + (r.score / r.totalPoints) * 100, 0) / results.length * 10) / 10
        : 0,
      averageTimeSpent: results.filter(r => r.timeSpent).length > 0
        ? Math.round(results.filter(r => r.timeSpent).reduce((sum, r) => sum + (r.timeSpent || 0), 0) / results.filter(r => r.timeSpent).length)
        : null,
      highestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
      lowestScore: results.length > 0 ? Math.min(...results.map(r => r.score)) : 0,
    };

    return NextResponse.json({
      results: results.map((result, index) => ({
        id: result.id,
        score: result.score,
        totalPoints: result.totalPoints,
        percentage: Math.round((result.score / result.totalPoints) * 100),
        timeSpent: result.timeSpent,
        completedAt: result.completedAt,
        user: result.user,
        rank: offset + index + 1, // Calculate rank based on sorting
        sessionId: adminView ? result.sessionId : undefined,
        answersCount: adminView ? (result.answers?.length || 0) : undefined,
        ...(adminView && { answers: result.answers }),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
      quiz,
      isAdminView: adminView,
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz results' },
      { status: 500 }
    );
  }
}
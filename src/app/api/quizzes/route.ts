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
    
    // Public quizzes only for non-admin users
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      where.status = 'PUBLISHED';
      where.isPublic = true;
    } else {
      // Admin can see all quizzes
      if (status) where.status = status;
    }
    
    if (category) where.category = category;

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit ? parseInt(limit) : undefined,
    });

    // Check if user has completed each quiz (for logged-in users)
    let userResults: Map<string, any> = new Map();
    if (session?.user?.email) {
      const results = await prisma.quizResult.findMany({
        where: {
          user: {
            email: session.user.email
          },
          quizId: { in: quizzes.map(q => q.id) }
        }
      });
      results.forEach(result => {
        userResults.set(result.quizId, result);
      });
    }

    // Add completion status to each quiz
    const quizzesWithCompletionStatus = quizzes.map(quiz => {
      const userResult = userResults.get(quiz.id);
      
      return {
        ...quiz,
        hasCompleted: !!userResult,
        userResult: userResult ? {
          completedAt: userResult.completedAt,
          score: userResult.score,
          percentage: Math.round((userResult.score / userResult.totalPoints) * 100),
          timeSpent: userResult.timeSpent
        } : null
      };
    });

    return NextResponse.json(quizzesWithCompletionStatus);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
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
      timeLimit,
      maxAttempts,
      isPublic,
      showResults,
      questions,
    } = body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        category,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : null,
        isPublic: isPublic ?? true,
        showResults: showResults ?? true,
        status: 'DRAFT',
        questions: {
          create: questions?.map((q: any, index: number) => ({
            question: q.question,
            questionType: q.questionType || 'MULTIPLE_CHOICE',
            explanation: q.explanation,
            points: q.points || 1,
            required: q.required ?? true,
            sortOrder: index,
            options: {
              create: q.options?.map((opt: any, optIndex: number) => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect || false,
                sortOrder: optIndex,
              })) || [],
            },
          })) || [],
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
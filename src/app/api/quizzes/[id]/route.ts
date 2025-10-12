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
    
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: {
            options: {
              // Hide correct answers for non-admin users
              select: {
                id: true,
                optionText: true,
                sortOrder: true,
                isCorrect: isAdmin,
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            results: true,
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

    // Check if user can access this quiz
    if (!isAdmin && (quiz.status !== 'PUBLISHED' || !quiz.isPublic)) {
      return NextResponse.json(
        { error: 'Quiz not accessible' },
        { status: 403 }
      );
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
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
      timeLimit,
      maxAttempts,
      isPublic,
      showResults,
      status,
      questions,
    } = body;

    // Delete existing questions if new ones are provided
    if (questions) {
      await prisma.quizQuestion.deleteMany({
        where: { quizId: params.id },
      });
    }

    const quiz = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        title,
        description,
        category,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : null,
        isPublic: isPublic ?? true,
        showResults: showResults ?? true,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        questions: questions ? {
          create: questions.map((q: any, index: number) => ({
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
          })),
        } : undefined,
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
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

    await prisma.quiz.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
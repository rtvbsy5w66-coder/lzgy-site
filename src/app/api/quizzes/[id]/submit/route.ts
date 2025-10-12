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
    const { answers, timeSpent, sessionId } = body;
    
    // Get user info
    const headersList = headers();
    const userAgent = headersList.get('user-agent');
    const forwarded = headersList.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     headersList.get('x-real-ip') || 
                     request.ip || 
                     'unknown';

    // Fetch quiz with questions and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    if (quiz.status !== 'PUBLISHED' || !quiz.isPublic) {
      return NextResponse.json(
        { error: 'Quiz not accessible' },
        { status: 403 }
      );
    }

    // Check attempt limits
    if (quiz.maxAttempts && session?.user?.id) {
      const previousAttempts = await prisma.quizResult.count({
        where: {
          quizId: params.id,
          userId: session.user.id,
        },
      });

      if (previousAttempts >= quiz.maxAttempts) {
        return NextResponse.json(
          { error: 'Maximum attempts exceeded' },
          { status: 429 }
        );
      }
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;
    const processedAnswers = [];

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const userAnswer = answers.find((a: any) => a.questionId === question.id);
      
      if (userAnswer) {
        let isCorrect = false;
        let points = 0;

        if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') {
          const selectedOption = question.options.find(opt => opt.id === userAnswer.optionId);
          if (selectedOption && selectedOption.isCorrect) {
            isCorrect = true;
            points = question.points;
            score += points;
          }
        } else if (question.questionType === 'MULTIPLE_SELECT') {
          const selectedOptions = userAnswer.optionIds || [];
          const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
          
          // All correct options selected and no incorrect ones
          if (selectedOptions.length === correctOptions.length && 
              selectedOptions.every((id: string) => correctOptions.includes(id))) {
            isCorrect = true;
            points = question.points;
            score += points;
          }
        }
        // TEXT_INPUT questions need manual review, so they get 0 points initially

        processedAnswers.push({
          questionId: question.id,
          optionId: userAnswer.optionId || null,
          textAnswer: userAnswer.textAnswer || null,
          isCorrect,
          points,
        });
      } else {
        // No answer provided
        processedAnswers.push({
          questionId: question.id,
          optionId: null,
          textAnswer: null,
          isCorrect: false,
          points: 0,
        });
      }
    }

    // Save result
    const result = await prisma.quizResult.create({
      data: {
        quizId: params.id,
        userId: session?.user?.id || null,
        sessionId: sessionId || null,
        score,
        totalPoints,
        timeSpent: timeSpent ? parseInt(timeSpent) : null,
        userAgent,
        ipAddress,
        answers: {
          create: processedAnswers,
        },
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                question: true,
                explanation: true,
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
      },
    });

    // Return results based on quiz settings
    const response: any = {
      id: result.id,
      score: result.score,
      totalPoints: result.totalPoints,
      percentage: Math.round((result.score / result.totalPoints) * 100),
      timeSpent: result.timeSpent,
      completedAt: result.completedAt,
    };

    if (quiz.showResults) {
      response.answers = result.answers.map(answer => ({
        questionId: answer.questionId,
        question: answer.question.question,
        explanation: answer.question.explanation,
        userAnswer: answer.option?.optionText || answer.textAnswer,
        isCorrect: answer.isCorrect,
        points: answer.points,
        maxPoints: answer.question.points,
      }));
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
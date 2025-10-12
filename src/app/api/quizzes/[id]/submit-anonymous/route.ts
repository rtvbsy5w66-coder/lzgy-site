import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { applySecurityMiddleware, SECURITY_CONFIGS } from '@/lib/security-middleware';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 🔒 SECURITY: Apply quiz security measures
  const securityResult = await applySecurityMiddleware(request, SECURITY_CONFIGS.PETITION_SIGN);
  if (securityResult) return securityResult;

  try {
    const quizId = params.id;
    const body = await request.json();

    // 🛡️ SECURITY: Validate input data
    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { error: 'Valid answers array is required' },
        { status: 400 }
      );
    }

    // Generate session ID for anonymous submission
    const sessionId = body.sessionId || crypto.randomUUID();

    // Validate quiz exists and supports anonymous submission
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        status: 'PUBLISHED',
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found or not active' },
        { status: 404 }
      );
    }

    // For now, all published quizzes allow anonymous participation
    // In the future, this can be controlled by a participationType field

    // Quiz time constraints can be checked here in the future
    // For now, all published quizzes are available

    // Check for duplicate submission from same session
    const existingResult = await prisma.quizResult.findFirst({
      where: {
        quizId,
        sessionId,
        userId: null, // Anonymous submissions have null userId
      },
    });

    if (existingResult) {
      return NextResponse.json(
        { error: 'Ön már kitöltötte ezt a kvízt anonim módon' },
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

    // Calculate score
    let totalScore = 0;
    let totalPossibleScore = 0;
    const processedAnswers = [];

    for (const answer of body.answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      totalPossibleScore += question.points;

      if (question.questionType === 'MULTIPLE_CHOICE') {
        const selectedOption = question.options.find(opt => opt.id === answer.optionId);
        if (selectedOption?.isCorrect) {
          totalScore += question.points;
        }
        processedAnswers.push({
          questionId: question.id,
          optionId: answer.optionId,
          textAnswer: null,
          isCorrect: selectedOption?.isCorrect || false,
          points: selectedOption?.isCorrect ? question.points : 0
        });
      } else if (question.questionType === 'TEXT_INPUT') {
        // For text inputs, we'll award points based on simple logic
        // In a real app, this would be more sophisticated
        const pointsEarned = answer.textAnswer && answer.textAnswer.trim().length > 0 ? question.points : 0;
        totalScore += pointsEarned;
        processedAnswers.push({
          questionId: question.id,
          optionId: null,
          textAnswer: answer.textAnswer,
          isCorrect: pointsEarned > 0,
          points: pointsEarned
        });
      }
    }

    const percentage = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;

    // Create anonymous quiz result
    const result = await prisma.quizResult.create({
      data: {
        quizId,
        userId: null, // Anonymous submission
        sessionId,
        score: totalScore,
        totalPoints: totalPossibleScore,
        timeSpent: body.timeSpent || null,
        
        // Metadata for analytics (anonymized)
        ipAddress: body.allowAnalytics ? hashedIP : null,
        userAgent: body.allowAnalytics ? userAgent.substring(0, 100) : null,
        
        answers: {
          create: processedAnswers.map(answer => ({
            questionId: answer.questionId,
            optionId: answer.optionId,
            textAnswer: answer.textAnswer,
            isCorrect: answer.isCorrect,
            points: answer.points,
          }))
        }
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                question: true,
                explanation: true,
                points: true
              }
            },
            option: {
              select: {
                optionText: true,
                isCorrect: true
              }
            }
          }
        }
      }
    });

    // Format detailed results if quiz allows showing results
    const detailedAnswers = quiz.showResults ? result.answers.map(answer => ({
      question: answer.question.question,
      userAnswer: answer.textAnswer || answer.option?.optionText || 'Nincs válasz',
      isCorrect: answer.isCorrect,
      points: answer.points,
      maxPoints: answer.question.points,
      explanation: answer.question.explanation
    })) : null;

    return NextResponse.json({
      success: true,
      message: 'Anonim kvíz sikeresen beküldve!',
      submissionId: result.id,
      score: totalScore,
      totalPoints: totalPossibleScore,
      percentage,
      timeSpent: body.timeSpent,
      answers: detailedAnswers,
      analytics: body.allowAnalytics ? {
        sessionId,
        timestamp: new Date().toISOString(),
        timeSpent: body.timeSpent
      } : null
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating anonymous quiz submission:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ön már kitöltötte ezt a kvízt' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Hiba történt az anonim kvíz beküldése során' },
      { status: 500 }
    );
  }
}

// GET method to check if anonymous submission is allowed
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        status: true,
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // For now, all published quizzes allow anonymous participation
    const allowsAnonymous = true;
    const isActive = quiz.status === 'PUBLISHED';

    return NextResponse.json({
      allowsAnonymous,
      isActive,
      participationType: 'HYBRID', // Default to hybrid for now
      startDate: null,
      endDate: null
    });

  } catch (error) {
    console.error('Error checking anonymous quiz capability:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - please log in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user's quiz results
    const quizResults = await prisma.quizResult.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            title: true,
            category: true,
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 50 // Limit to last 50 results
    });

    // Fetch user's poll votes
    const pollVotes = await prisma.pollVote.findMany({
      where: { userId },
      include: {
        poll: {
          select: {
            title: true,
            category: true,
            status: true,
          }
        },
        option: {
          select: {
            optionText: true,
          }
        }
      },
      orderBy: { votedAt: 'desc' },
      take: 50 // Limit to last 50 votes
    });

    // Fetch user's petition signatures (both userId and email-based)
    const signatures = await prisma.signature.findMany({
      where: {
        OR: [
          { userId: userId },
          { email: session.user.email }
        ]
      },
      include: {
        petition: {
          select: {
            id: true,
            title: true,
            status: true,
            targetGoal: true,
            category: {
              select: {
                name: true,
                color: true,
              }
            },
            _count: {
              select: {
                signatures: {
                  where: {
                    status: 'VERIFIED'
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { signedAt: 'desc' },
      take: 50 // Limit to last 50 signatures
    });

    // Fetch user's event registrations (both userId and email-based, including cancelled ones for history)
    const eventRegistrations = await prisma.eventRegistration.findMany({
      where: {
        OR: [
          { userId: userId },
          ...(session.user.email ? [{ email: session.user.email }] : [])
        ]
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            startDate: true,
            endDate: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 registrations
    });

    // Fetch user's reports (bejelentések)
    const reports = await prisma.report.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 reports
    });

    // Fetch user's newsletter subscription status (new system first, then legacy)
    const modernNewsletterSubscription = session.user.email ? await prisma.newsletterSubscription.findUnique({
      where: { email: session.user.email },
      select: {
        categories: true,
        isActive: true,
        subscribedAt: true,
        lastUpdatedAt: true
      }
    }) : null;

    // Also check legacy contact system for backward compatibility
    const legacyNewsletterSubscription = await prisma.contact.findFirst({
      where: {
        OR: [
          ...(session.user.email ? [{ email: session.user.email }] : []),
          // In case user updated their email, try to find by name as well
          ...(session.user.name && session.user.email ? [{ name: session.user.name, email: session.user.email }] : [])
        ]
      },
      select: {
        newsletter: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' } // Get the most recent contact entry
    });

    // Calculate statistics
    const stats = {
      totalQuizzes: quizResults.length,
      totalPolls: pollVotes.length,
      totalPetitions: signatures.length,
      totalEvents: eventRegistrations.length,
      totalReports: reports.length,
      avgQuizScore: quizResults.length > 0
        ? Math.round(
            quizResults.reduce((sum, result) =>
              sum + ((result.score / result.totalPoints) * 100), 0
            ) / quizResults.length
          )
        : 0
    };

    return NextResponse.json({
      quizResults,
      pollVotes,
      signatures,
      eventRegistrations,
      reports,
      newsletterSubscription: modernNewsletterSubscription && modernNewsletterSubscription.isActive ? {
        isSubscribed: true,
        subscribedAt: modernNewsletterSubscription.subscribedAt,
        categories: JSON.parse(modernNewsletterSubscription.categories),
        isModern: true
      } : legacyNewsletterSubscription ? {
        isSubscribed: legacyNewsletterSubscription.newsletter,
        subscribedAt: legacyNewsletterSubscription.newsletter ? legacyNewsletterSubscription.createdAt : null,
        categories: [],
        isModern: false
      } : null,
      stats
    });

  } catch (error) {
    console.error("Error fetching user activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Simple queries without complex raw SQL
    const totalUsers = await prisma.user.count().catch(() => 0);
    const newUsersCount = await prisma.user.count({
      where: { createdAt: { gte: startDate } },
    }).catch(() => 0);

    const totalPosts = await prisma.post.count().catch(() => 0);
    const publishedPosts = await prisma.post.count({
      where: { status: 'PUBLISHED' },
    }).catch(() => 0);

    const totalEvents = await prisma.event.count().catch(() => 0);
    const upcomingEvents = await prisma.event.count({
      where: { startDate: { gte: new Date() } },
    }).catch(() => 0);

    const totalReports = await prisma.report.count().catch(() => 0);
    const pendingReports = await prisma.report.count({
      where: { status: { in: ['submitted', 'in_progress'] } },
    }).catch(() => 0);

    const totalPetitions = await prisma.petition.count().catch(() => 0);
    const activePetitions = await prisma.petition.count({
      where: { status: 'ACTIVE' },
    }).catch(() => 0);

    const totalPolls = await prisma.poll.count().catch(() => 0);
    const activePolls = await prisma.poll.count({
      where: { status: 'ACTIVE' },
    }).catch(() => 0);

    const petitionSignatures = await prisma.signature.count().catch(() => 0);
    const pollVotes = await prisma.pollVote.count().catch(() => 0);

    // Calculate growth rates
    const growthRate = {
      users: totalUsers > 0 ? ((newUsersCount / totalUsers) * 100).toFixed(1) : '0',
      posts: publishedPosts,
      events: upcomingEvents,
      reports: pendingReports,
    };

    // Engagement metrics
    const engagement = {
      petitionSignaturesAvg: totalPetitions > 0 ? Math.round(petitionSignatures / totalPetitions) : 0,
      pollVotesAvg: totalPolls > 0 ? Math.round(pollVotes / totalPolls) : 0,
      reportsPerUser: totalUsers > 0 ? (totalReports / totalUsers).toFixed(2) : '0',
    };

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsers: newUsersCount,
        totalPosts,
        publishedPosts,
        totalEvents,
        upcomingEvents,
        totalReports,
        pendingReports,
        totalPetitions,
        activePetitions,
        totalPolls,
        activePolls,
        petitionSignatures,
        pollVotes,
      },
      growth: growthRate,
      engagement,
      recentActivity: [], // Simplified - no complex raw SQL for now
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Admin Stats Overview] Error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az adatok lekérdezésekor', details: String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Statistics queries using models that exist in schema
    const [postsCount, eventsCount, contactsCount, slidesCount, reportsCount] = await Promise.all([
      prisma.post.count(),
      prisma.event.count(), 
      prisma.contact.count(), // Using contact model which exists
      prisma.slide.count(),   // Using slide model which exists
      prisma.report.count(),  // New reports count
    ]);

    // Recent items queries
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true, createdAt: true }
    });

    const recentEvents = await prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true, startDate: true }
    });

    const recentReports = await prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        title: true, 
        status: true, 
        urgency: true,
        category: true,
        createdAt: true,
        representativeName: true 
      }
    });

    return NextResponse.json({
      stats: {
        posts: postsCount,
        events: eventsCount, 
        contacts: contactsCount,
        slides: slidesCount,
        reports: reportsCount
      },
      recent: {
        posts: recentPosts,
        events: recentEvents,
        reports: recentReports
      }
    });

  } catch (error) {
    console.error("Admin stats API error:", error);
    return NextResponse.json(
      { error: "Hiba a statisztikák lekérése során" },
      { status: 500 }
    );
  }
}
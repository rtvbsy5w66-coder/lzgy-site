import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/admin/newsletter/stats - Get newsletter statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get subscriber counts
    const totalSubscribers = await prisma.contact.count({
      where: { newsletter: true }
    });

    // For now, all newsletter:true subscribers are considered active
    // In the future, you might add an 'active' field or track bounces
    const activeSubscribers = totalSubscribers;

    // Get newsletter send statistics
    // We'll create a newsletter_sends table later to track this
    // For now, return placeholder data
    const totalSent = 0; // TODO: Implement when newsletter_sends table exists
    const lastSentDate = null; // TODO: Implement when newsletter_sends table exists

    const stats = {
      totalSubscribers,
      activeSubscribers,
      totalSent,
      lastSentDate
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter statistics' },
      { status: 500 }
    );
  }
}
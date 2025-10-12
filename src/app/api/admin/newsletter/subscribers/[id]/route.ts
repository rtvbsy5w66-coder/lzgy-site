import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// DELETE /api/admin/newsletter/subscribers/[id] - Remove subscriber
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const subscriberId = params.id;

    // Check if subscriber exists
    const subscriber = await prisma.contact.findUnique({
      where: { id: subscriberId }
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    // Update newsletter subscription to false instead of deleting
    // This preserves the contact record but removes from newsletter
    await prisma.contact.update({
      where: { id: subscriberId },
      data: { newsletter: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscriber successfully removed from newsletter'
    });

  } catch (error) {
    console.error('Error removing newsletter subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscriber' },
      { status: 500 }
    );
  }
}
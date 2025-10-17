import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// PATCH /api/admin/newsletter/subscribers/[id] - Update subscriber
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    // Try to update in NewsletterSubscription table
    try {
      const updatedSubscriber = await prisma.newsletterSubscription.update({
        where: { id },
        data: { isActive },
      });

      return NextResponse.json({
        success: true,
        data: updatedSubscriber,
        message: "Subscriber updated successfully",
      });
    } catch (e) {
      // If not found in NewsletterSubscription, try Contact table
      const updatedContact = await prisma.contact.update({
        where: { id },
        data: { newsletter: isActive },
      });

      return NextResponse.json({
        success: true,
        data: updatedContact,
        message: "Subscriber updated successfully",
      });
    }
  } catch (error) {
    console.error("Error updating subscriber:", error);
    return NextResponse.json(
      { error: "Failed to update subscriber" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/newsletter/subscribers/[id] - Remove subscriber
export async function DELETE(
  request: NextRequest,
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

    // Check if subscriber exists in Contact table
    const contact = await prisma.contact.findUnique({
      where: { id: subscriberId }
    });

    if (contact) {
      // Update newsletter subscription to false instead of deleting
      await prisma.contact.update({
        where: { id: subscriberId },
        data: { newsletter: false }
      });
    } else {
      // Try NewsletterSubscription table
      await prisma.newsletterSubscription.update({
        where: { id: subscriberId },
        data: { isActive: false }
      });
    }

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
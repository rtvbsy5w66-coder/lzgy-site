import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// DELETE /api/admin/newsletter/campaigns/[id] - Delete campaign
export async function DELETE(
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

    // Delete campaign
    await prisma.newsletterCampaign.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/newsletter/campaigns/[id] - Update campaign
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

    // Update campaign
    const updatedCampaign = await prisma.newsletterCampaign.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: "Campaign updated successfully",
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// GET /api/admin/newsletter/campaigns/[id] - Get single campaign
export async function GET(
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

    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
      include: {
        abTestCampaigns: true,
        _count: {
          select: {
            analytics: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

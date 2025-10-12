import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";

// GET /api/partners - Get active partners for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = {
      isActive: true, // Only active partners
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    const partners = await prisma.partner.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        link: true,
        category: true,
        width: true,
        height: true,
        sortOrder: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ],
    });

    // Transform for AppleStyleBadgeBanner format
    const badgeItems = partners.map(partner => ({
      id: partner.id,
      title: partner.name,
      imageUrl: partner.imageUrl,
      imageAlt: partner.description || partner.name,
      link: partner.link || undefined,
      priority: partner.sortOrder <= 3, // First 4 items get priority loading
      category: partner.category,
      width: partner.width,
      height: partner.height,
    }));

    return NextResponse.json(badgeItems);
  } catch (error) {
    console.error("Error fetching partners:", error);
    
    // Return empty array instead of error to prevent UI crashes
    return NextResponse.json([]);
  }
}
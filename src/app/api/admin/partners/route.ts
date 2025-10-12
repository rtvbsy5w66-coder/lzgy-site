import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Validation schema for partner creation/update
const partnerSchema = z.object({
  name: z.string().min(1, "A név kötelező").max(255, "A név túl hosszú"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Kép URL kötelező").max(500, "URL túl hosszú"), // Allow both URLs and relative paths
  link: z.string().optional(), // Simplified - just accept any string or undefined
  category: z.enum(["TECHNOLOGY", "SPONSOR", "MEDIA", "ORGANIZATION", "SERVICE", "OTHER"]).default("SPONSOR"),
  width: z.number().int().min(50).max(1000).optional().default(600), // Bigger max size
  height: z.number().int().min(30).max(500).optional().default(200), // Bigger max size
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/admin/partners - Get all partners
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nincs jogosultság" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const partners = await prisma.partner.findMany({
      where,
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { error: "Hiba történt a partnerek betöltésekor" },
      { status: 500 }
    );
  }
}

// POST /api/admin/partners - Create new partner
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nincs jogosultság" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("📝 Received partner data:", JSON.stringify(body, null, 2));
    
    // Simplified validation - just ensure required fields exist
    if (!body.name || !body.imageUrl) {
      console.log("❌ Missing required fields:", { name: body.name, imageUrl: body.imageUrl });
      return NextResponse.json(
        { error: "Name and imageUrl are required" },
        { status: 400 }
      );
    }
    
    // Prepare data with defaults
    const validatedData = {
      name: body.name,
      description: body.description || "Banner partner",
      imageUrl: body.imageUrl,
      link: body.link || null,
      category: body.category || "SPONSOR",
      width: body.width || 600,
      height: body.height || 200,
      sortOrder: body.sortOrder || 0,
      isActive: body.isActive !== false, // Default to true
    };

    // Check if partner with same name already exists
    const existingPartner = await prisma.partner.findFirst({
      where: { name: validatedData.name }
    });

    if (existingPartner) {
      console.log("❌ Partner already exists with name:", validatedData.name);
      return NextResponse.json(
        { error: `Már létezik partner ezzel a névvel: ${validatedData.name}` },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Érvénytelen adatok", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating partner:", error);
    return NextResponse.json(
      { error: "Hiba történt a partner létrehozásakor" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Validation schema for partner update
const partnerUpdateSchema = z.object({
  name: z.string().min(1, "A név kötelező").max(255, "A név túl hosszú"),
  description: z.string().optional(),
  imageUrl: z.string().url("Érvényes URL szükséges").max(500, "URL túl hosszú"),
  link: z.string().url("Érvényes URL szükséges").max(500, "URL túl hosszú").optional(),
  category: z.enum(["TECHNOLOGY", "SPONSOR", "MEDIA", "ORGANIZATION", "SERVICE", "OTHER"]),
  width: z.number().int().min(50).max(500).optional(),
  height: z.number().int().min(30).max(300).optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

// GET /api/admin/partners/[id] - Get partner by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nincs jogosultság" },
        { status: 401 }
      );
    }

    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Partner nem található" },
        { status: 404 }
      );
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Error fetching partner:", error);
    return NextResponse.json(
      { error: "Hiba történt a partner betöltésekor" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/partners/[id] - Update partner
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nincs jogosultság" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = partnerUpdateSchema.parse(body);

    // Check if partner exists
    const existingPartner = await prisma.partner.findUnique({
      where: { id: params.id }
    });

    if (!existingPartner) {
      return NextResponse.json(
        { error: "Partner nem található" },
        { status: 404 }
      );
    }

    // Check if another partner with same name exists (excluding current)
    const duplicatePartner = await prisma.partner.findFirst({
      where: { 
        name: validatedData.name,
        id: { not: params.id }
      }
    });

    if (duplicatePartner) {
      return NextResponse.json(
        { error: "Már létezik partner ezzel a névvel" },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(partner);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Érvénytelen adatok", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating partner:", error);
    return NextResponse.json(
      { error: "Hiba történt a partner frissítésekor" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/partners/[id] - Delete partner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nincs jogosultság" },
        { status: 401 }
      );
    }

    // Check if partner exists
    const existingPartner = await prisma.partner.findUnique({
      where: { id: params.id }
    });

    if (!existingPartner) {
      return NextResponse.json(
        { error: "Partner nem található" },
        { status: 404 }
      );
    }

    await prisma.partner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { error: "Hiba történt a partner törlésekor" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/events/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Az esemény nem található." },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Hiba történt az esemény lekérése közben." },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const event = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        status: body.status,
        imageUrl: body.imageUrl,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Hiba történt az esemény módosítása közben." },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Az esemény sikeresen törölve." });
  } catch (error) {
    return NextResponse.json(
      { error: "Hiba történt az esemény törlése közben." },
      { status: 500 }
    );
  }
}

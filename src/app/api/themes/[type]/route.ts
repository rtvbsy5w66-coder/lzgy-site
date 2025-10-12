import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type: typeParam } = await params;
    const type = typeParam.toUpperCase();
    const themes = await prisma.theme.findMany({
      where: {
        type: type as any,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return NextResponse.json(themes);
  } catch (error) {
    console.error("GET /api/themes/[type] error:", error);
    return NextResponse.json(
      { error: "Hiba történt a témák lekérése közben." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type: typeParam } = await params;
    const type = typeParam.toUpperCase();
    const body = await request.json();

    // Update the theme
    const theme = await prisma.theme.update({
      where: {
        id: body.id,
      },
      data: {
        fromColor: body.fromColor,
        toColor: body.toColor,
        textColor: body.textColor,
      },
    });

    return NextResponse.json(theme);
  } catch (error) {
    console.error("PUT /api/themes/[type] error:", error);
    return NextResponse.json(
      { error: "Hiba történt a téma frissítése közben." },
      { status: 500 }
    );
  }
}

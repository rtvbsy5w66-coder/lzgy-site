// src/app/api/category-colors/route.ts
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Kategória színek lekérése
export async function GET() {
  try {
    const categoryColors = await prisma.categoryColor.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(categoryColors);
  } catch (error) {
    console.error('[CATEGORY_COLORS_GET] Database error:', error);
    return NextResponse.json(
      { error: 'Nem sikerült betölteni a kategória színeket' },
      { status: 500 }
    );
  }
}

// POST - Új kategória szín létrehozása
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, color, description, sortOrder } = body;

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Kategória név és szín megadása kötelező' },
        { status: 400 }
      );
    }

    const categoryColor = await prisma.categoryColor.create({
      data: {
        name,
        color,
        description: description || null,
        sortOrder: sortOrder || 0
      }
    });

    return NextResponse.json(categoryColor);
  } catch (error) {
    console.error('[CATEGORY_COLORS_POST] Error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a kategória szín létrehozása során' },
      { status: 500 }
    );
  }
}

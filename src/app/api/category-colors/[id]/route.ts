// src/app/api/category-colors/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// PUT - Kategória szín frissítése
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, color, description, sortOrder, isActive } = body;

    const categoryColor = await prisma.categoryColor.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        color: color || undefined,
        description: description !== undefined ? (description || null) : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    return NextResponse.json(categoryColor);
  } catch (error) {
    console.error('[CATEGORY_COLORS_PUT] Error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a kategória szín frissítése során' },
      { status: 500 }
    );
  }
}

// DELETE - Kategória szín törlése
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.categoryColor.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CATEGORY_COLORS_DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a kategória szín törlése során' },
      { status: 500 }
    );
  }
}

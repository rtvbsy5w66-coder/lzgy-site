// src/app/api/posts/[id]/route.ts
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateSlug } from "@/utils/posts";

// GET - Egy bejegyzés lekérése
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        newsCategory: true,
      },
    });

    if (!post) {
      return new NextResponse("Bejegyzés nem található", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_GET]", error);
    return new NextResponse("Hiba történt", { status: 500 });
  }
}

// PATCH - Bejegyzés módosítása
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('[POST_PATCH] Updating post:', id);
    console.log('[POST_PATCH] Body:', body);

    // Ha változott a cím, generáljunk új slug-ot
    const slug = body.title ? generateSlug(body.title) : undefined;

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt || null,
        slug: slug,
        status: body.status,
        imageUrl: body.imageUrl || null,
        newsCategoryId: body.newsCategoryId || null,
        subcategory: body.subcategory || null,
        createdAt: body.createdAt ? new Date(body.createdAt) : undefined,
      },
      include: {
        newsCategory: true,
      },
    });

    console.log('[POST_PATCH] ✅ Updated successfully');
    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_PATCH] ❌ Error:", error);
    return NextResponse.json(
      { error: "Hiba történt a módosítás során", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT - Alias for PATCH (same functionality)
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}

// DELETE - Bejegyzés törlése
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.post.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return NextResponse.json(
      { error: "Hiba történt a törlés során", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

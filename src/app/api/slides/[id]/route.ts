import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { SlideType } from "@prisma/client";
import {
  validateVideoData,
  prepareVideoData,
  validateMediaUrl,
} from "@/utils/validators/slideValidators";
import { unlink } from "fs/promises";
import path from "path";

// GET egy specifikus slide lekérése
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slide = await prisma.slide.findUnique({
      where: {
        id,
      },
    });

    if (!slide) {
      return NextResponse.json(
        { error: "A slide nem található" },
        { status: 404 }
      );
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error("Error in GET /api/slides/[id]:", error);
    return NextResponse.json(
      { error: "Hiba történt a slide lekérése során" },
      { status: 500 }
    );
  }
}

// PATCH /api/slides/[id] - Részleges slide módosítás (pl. sorrend)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await request.json();
    console.log("Patching slide:", { id, data: json });

    // Ha csak sorrend módosítás történik
    if (typeof json.order === "number" && Object.keys(json).length === 1) {
      const currentSlide = await prisma.slide.findUnique({
        where: { id },
      });

      if (!currentSlide) {
        return NextResponse.json(
          { error: "A slide nem található" },
          { status: 404 }
        );
      }

      // Többi slide átrendezése
      if (json.order > currentSlide.order) {
        await prisma.slide.updateMany({
          where: {
            AND: [
              { order: { gt: currentSlide.order } },
              { order: { lte: json.order } },
              { id: { not: id } },
            ],
          },
          data: { order: { decrement: 1 } },
        });
      } else if (json.order < currentSlide.order) {
        await prisma.slide.updateMany({
          where: {
            AND: [
              { order: { gte: json.order } },
              { order: { lt: currentSlide.order } },
              { id: { not: id } },
            ],
          },
          data: { order: { increment: 1 } },
        });
      }

      const updatedSlide = await prisma.slide.update({
        where: { id },
        data: { order: json.order },
      });

      return NextResponse.json(updatedSlide);
    }

    // Egyéb módosítások esetén átirányítjuk PUT-ra
    return PUT(request, { params });
  } catch (error) {
    console.error("Error in PATCH /api/slides/[id]:", error);
    return NextResponse.json(
      {
        error: "Hiba történt a slide módosítása során",
        details: error instanceof Error ? error.message : "Ismeretlen hiba",
      },
      { status: 500 }
    );
  }
}

// PUT /api/slides/[id] - Slide módosítása
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await request.json();
    console.log("Updating slide:", { id, data: json });

    // Slide típus ellenőrzése
    if (json.type && !Object.values(SlideType).includes(json.type)) {
      return NextResponse.json(
        { error: "Érvénytelen slide típus" },
        { status: 400 }
      );
    }

    // Videó adatok validálása
    try {
      if (json.type) {
        validateVideoData(json);
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Validációs hiba" },
        { status: 400 }
      );
    }

    // Media URL validálása
    if (json.mediaUrl) {
      try {
        validateMediaUrl(json.mediaUrl, json.type);
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error ? error.message : "URL validációs hiba",
          },
          { status: 400 }
        );
      }
    }

    // Ha sorrend módosítás történik
    if (typeof json.order === "number") {
      const currentSlide = await prisma.slide.findUnique({
        where: { id },
      });

      if (!currentSlide) {
        return NextResponse.json(
          { error: "A slide nem található" },
          { status: 404 }
        );
      }

      // Többi slide átrendezése
      if (json.order > currentSlide.order) {
        await prisma.slide.updateMany({
          where: {
            AND: [
              { order: { gt: currentSlide.order } },
              { order: { lte: json.order } },
              { id: { not: id } },
            ],
          },
          data: { order: { decrement: 1 } },
        });
      } else {
        await prisma.slide.updateMany({
          where: {
            AND: [
              { order: { gte: json.order } },
              { order: { lt: currentSlide.order } },
              { id: { not: id } },
            ],
          },
          data: { order: { increment: 1 } },
        });
      }
    }

    // Slide adatok előkészítése
    const updateData = prepareVideoData(json);

    const updatedSlide = await prisma.slide.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error("Error in PUT /api/slides/[id]:", error);
    return NextResponse.json(
      {
        error: "Hiba történt a slide módosítása során",
        details: error instanceof Error ? error.message : "Ismeretlen hiba",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/slides/[id] - Slide törlése
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Először lekérjük a slide-ot
    const slide = await prisma.slide.findUnique({
      where: {
        id,
      },
    });

    if (!slide) {
      return NextResponse.json(
        { error: "A slide nem található" },
        { status: 404 }
      );
    }

    // Ha van hozzá tartozó média fájl, töröljük azt is
    if (slide.mediaUrl) {
      try {
        const filePath = path.join(process.cwd(), "public", slide.mediaUrl);
        await unlink(filePath);
      } catch (error) {
        console.error("Hiba a média fájl törlése során:", error);
        // Nem dobunk hibát, mert a slide-ot mindenképp törölni szeretnénk
      }
    }

    // Töröljük a slide-ot
    await prisma.slide.delete({
      where: {
        id,
      },
    });

    // Átrendezzük a többi slide order értékét
    await prisma.slide.updateMany({
      where: {
        order: {
          gt: slide.order,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "A slide sikeresen törölve",
    });
  } catch (error) {
    console.error("Error in DELETE /api/slides/[id]:", error);
    return NextResponse.json(
      {
        error: "Hiba történt a slide törlése során",
        details: error instanceof Error ? error.message : "Ismeretlen hiba",
      },
      { status: 500 }
    );
  }
}

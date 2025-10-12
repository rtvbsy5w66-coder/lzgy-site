// src/app/api/upload/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Konstansok
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nincs feltöltött fájl" },
        { status: 400 }
      );
    }

    // Fájlméret ellenőrzése
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "A fájl mérete nem lehet nagyobb 100MB-nál" },
        { status: 400 }
      );
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    // Fájltípus ellenőrzése
    if (isVideo && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Nem támogatott videó formátum. Használj MP4 vagy WebM formátumot.",
        },
        { status: 400 }
      );
    }

    if (isImage && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Nem támogatott kép formátum. Használj JPEG, PNG, GIF vagy WebP formátumot.",
        },
        { status: 400 }
      );
    }

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "Csak kép vagy videó fájlok tölthetők fel" },
        { status: 400 }
      );
    }

    try {
      // Upload to Vercel Blob Storage
      const blob = await put(file.name, file, {
        access: 'public',
        contentType: file.type,
      });

      return NextResponse.json({
        url: blob.url,
        type: isVideo ? "video" : "image",
        message: `${isVideo ? "Videó" : "Kép"} sikeresen feltöltve`,
      });
    } catch (error) {
      console.error("Hiba a fájl mentése során:", error);
      return NextResponse.json(
        { error: "Hiba történt a fájl mentése során" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Általános hiba a feltöltés során:", error);
    return NextResponse.json(
      { error: "Hiba történt a feltöltés során" },
      { status: 500 }
    );
  }
}


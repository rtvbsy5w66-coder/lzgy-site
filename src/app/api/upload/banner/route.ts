import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

// POST /api/upload/banner - Upload banner image
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nincs jogosultság" },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nincs fájl megadva" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Csak kép fájlok engedélyezettek (JPEG, PNG, WebP, SVG)" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "A fájl mérete maximum 5MB lehet" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const filename = `banner-${randomUUID()}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "banners");
    
    try {
      await writeFile(join(uploadsDir, filename), buffer);
    } catch (error) {
      // Try to create directory and write again
      const { mkdir } = await import("fs/promises");
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(join(uploadsDir, filename), buffer);
    }

    const imageUrl = `/uploads/banners/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error("Error uploading banner image:", error);
    return NextResponse.json(
      { error: "Hiba történt a fájl feltöltésekor" },
      { status: 500 }
    );
  }
}
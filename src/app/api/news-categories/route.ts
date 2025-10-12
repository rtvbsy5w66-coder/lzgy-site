// src/app/api/news-categories/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createApiResponse } from "@/lib/api-helpers";

// GET /api/news-categories - Hírek kategóriák listázása (ADATBÁZISBÓL!)
export async function GET() {
  try {
    // Adatbázisból olvasás
    const dbCategories = await prisma.newsCategory.findMany({
      where: {
        isActive: true, // Csak aktív kategóriák
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Formázás az API response-hoz
    const categoriesWithDetails = dbCategories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      colors: {
        primary: category.color,
        secondary: category.color + '20', // Halvány verzió
      }
    }));

    return createApiResponse(
      categoriesWithDetails,
      `${categoriesWithDetails.length} hírek kategória betöltve`
    );
  } catch (error) {
    console.error("[NEWS_CATEGORIES_GET]", error);
    return NextResponse.json(
      { error: "Hiba a hírek kategóriák betöltése közben" },
      { status: 500 }
    );
  }
}
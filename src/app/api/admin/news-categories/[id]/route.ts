// src/app/api/admin/news-categories/[id]/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  createApiResponse, 
  createApiError, 
  createValidationError, 
  validateRequiredFields,
  API_MESSAGES 
} from "@/lib/api-helpers";
import { handleApiError } from "@/lib/error-handler";

// GET /api/admin/news-categories/[id] - Get single news category
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.newsCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!category) {
      return createApiError("Kategória nem található", 404);
    }

    return createApiResponse(category, "Kategória betöltve");
  } catch (error) {
    return handleApiError(error, "NEWS_CATEGORY_GET");
  }
}

// PUT /api/admin/news-categories/[id] - Update news category
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();

    // Validate required fields
    const validation = validateRequiredFields(data, ['name']);
    if (!validation.isValid) {
      return createValidationError(validation.errors);
    }

    // Validate color format (hex color)
    if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      return createValidationError(['A szín mezőnek érvényes hex formátumban kell lennie (pl. #3b82f6)']);
    }

    // Check if category exists
    const existingCategory = await prisma.newsCategory.findUnique({
      where: { id: params.id }
    });

    if (!existingCategory) {
      return createApiError("Kategória nem található", 404);
    }

    const category = await prisma.newsCategory.update({
      where: { id: params.id },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        color: data.color || existingCategory.color,
        sortOrder: data.sortOrder ?? existingCategory.sortOrder,
        isActive: data.isActive ?? existingCategory.isActive
      }
    });

    return createApiResponse(category, API_MESSAGES.UPDATED);
  } catch (error) {
    return handleApiError(error, "NEWS_CATEGORY_PUT");
  }
}

// DELETE /api/admin/news-categories/[id] - Delete news category
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check if category exists
    const existingCategory = await prisma.newsCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!existingCategory) {
      return createApiError("Kategória nem található", 404);
    }

    // Check if category has posts
    if (existingCategory._count.posts > 0) {
      return createApiError(
        `Nem törölhető a kategória, mert ${existingCategory._count.posts} cikk használja`, 
        409
      );
    }

    await prisma.newsCategory.delete({
      where: { id: params.id }
    });

    return createApiResponse(null, API_MESSAGES.DELETED);
  } catch (error) {
    return handleApiError(error, "NEWS_CATEGORY_DELETE");
  }
}
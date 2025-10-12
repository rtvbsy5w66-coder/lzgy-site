// src/app/api/admin/news-categories/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  createApiResponse, 
  createApiError, 
  createValidationError, 
  validateRequiredFields,
  API_MESSAGES 
} from "@/lib/api-helpers";
import { handleApiError } from "@/lib/error-handler";
import { requireAdminAuth } from "@/lib/auth-middleware";

// GET /api/admin/news-categories - List all news categories
export async function GET(req: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  const authError = await requireAdminAuth(req);
  if (authError) return authError;
  try {
    const categories = await prisma.newsCategory.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    return createApiResponse(categories, `${categories.length} kategória betöltve`);
  } catch (error) {
    return handleApiError(error, "NEWS_CATEGORIES_GET");
  }
}

// POST /api/admin/news-categories - Create new news category
export async function POST(req: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  const authError = await requireAdminAuth(req);
  if (authError) return authError;
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

    const category = await prisma.newsCategory.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        color: data.color || '#3b82f6',
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive !== false
      }
    });

    return createApiResponse(category, API_MESSAGES.CREATED, 201);
  } catch (error) {
    return handleApiError(error, "NEWS_CATEGORIES_POST");
  }
}
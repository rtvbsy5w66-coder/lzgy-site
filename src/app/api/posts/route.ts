// src/app/api/posts/route.ts
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/utils/posts";
import {
  createApiResponse,
  createApiError,
  createValidationError,
  validateRequiredFields,
  API_MESSAGES
} from "@/lib/api-helpers";
import { handleApiError } from "@/lib/error-handler";

// POST /api/posts - Új bejegyzés létrehozása
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Kötelező mezők validációja
    const validation = validateRequiredFields(data, ['title', 'content']);
    if (!validation.isValid) {
      return createValidationError(validation.errors);
    }

    // Létrehozzuk a slug-ot a címből
    const slug = generateSlug(data.title);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        slug: slug,
        status: data.status || 'DRAFT',
        category: data.category || null,
        newsCategoryId: data.newsCategoryId || null,
        subcategory: data.subcategory || null,
        excerpt: data.excerpt || null,
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      },
      include: {
        newsCategory: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        }
      }
    });

    return createApiResponse(post, API_MESSAGES.CREATED, 201);
  } catch (error) {
    return handleApiError(error, "POSTS_POST");
  }
}

// GET /api/posts - Enhanced posts listing with filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    // Convert params to numbers/filters
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const skip = limitNum && pageNum > 1 ? (pageNum - 1) * limitNum : undefined;

    let posts: any[] = [];

    try {
      // Build where clause with category filtering
      const whereClause: any = {};
      if (status) whereClause.status = status as any;
      if (category) whereClause.category = category;

      // Support filtering by newsCategoryId
      const newsCategoryId = searchParams.get('newsCategoryId');
      if (newsCategoryId) whereClause.newsCategoryId = newsCategoryId;

      posts = await prisma.post.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          newsCategory: {
            select: {
              id: true,
              name: true,
              color: true,
            }
          }
        },
        ...(limitNum && { take: limitNum }),
        ...(skip && { skip })
      });

    } catch (dbError) {
      console.error('[POSTS_GET] Database error:', dbError);
      posts = [];
    }

    const count = posts.length;
    const filters = [
      status && `${status} státusszal`,
      category && `${category} kategóriával`
    ].filter(Boolean).join(' és ');

    console.log(`[POSTS_GET] ✅ Returning ${count} posts${filters ? ' (' + filters + ')' : ''}`);

    return createApiResponse(posts, `${count} bejegyzés lekérve${filters ? ' (' + filters + ')' : ''}`);
  } catch (error) {
    return handleApiError(error, "POSTS_GET");
  }
}

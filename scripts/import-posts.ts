/**
 * Bulk Import Script for Posts
 *
 * Usage:
 * 1. Készíts egy JSON fájlt az importálandó tartalmakkal (pl. posts-import.json)
 * 2. Futtasd: npx tsx scripts/import-posts.ts <json-file-path>
 *
 * JSON formátum:
 * [
 *   {
 *     "title": "Cím",
 *     "content": "Teljes tartalom...",
 *     "excerpt": "Kivonat (opcionális)",
 *     "status": "PUBLISHED" | "DRAFT" | "ARCHIVED",
 *     "imageUrl": "https://example.com/image.jpg (opcionális)",
 *     "categoryName": "Kategória neve (opcionális)",
 *     "publishedAt": "2024-01-01T10:00:00Z (opcionális, alapértelmezett: most)"
 *   }
 * ]
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ImportPost {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  imageUrl?: string;
  categoryName?: string;
  publishedAt?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove multiple hyphens
}

async function importPosts(jsonFilePath: string) {
  console.log('🚀 Starting bulk post import...\n');

  // Read JSON file
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ File not found: ${jsonFilePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
  const posts: ImportPost[] = JSON.parse(fileContent);

  console.log(`📄 Found ${posts.length} posts to import\n`);

  // Fetch all categories for mapping
  const categories = await prisma.newsCategory.findMany();
  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

  let successCount = 0;
  let errorCount = 0;
  const errors: { post: string; error: string }[] = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const index = i + 1;

    try {
      console.log(`[${index}/${posts.length}] Importing: "${post.title}"...`);

      // Generate unique slug
      let slug = generateSlug(post.title);
      let slugCounter = 1;
      while (await prisma.post.findUnique({ where: { slug } })) {
        slug = `${generateSlug(post.title)}-${slugCounter}`;
        slugCounter++;
      }

      // Find category ID if categoryName provided
      let categoryId: string | undefined;
      if (post.categoryName) {
        categoryId = categoryMap.get(post.categoryName.toLowerCase());
        if (!categoryId) {
          console.warn(`  ⚠️  Category "${post.categoryName}" not found, skipping category assignment`);
        }
      }

      // Create post
      const createdPost = await prisma.post.create({
        data: {
          title: post.title,
          slug,
          content: post.content,
          excerpt: post.excerpt,
          status: post.status || 'DRAFT',
          imageUrl: post.imageUrl,
          newsCategoryId: categoryId,
          createdAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
          updatedAt: new Date(),
        },
      });

      console.log(`  ✅ Created: ${createdPost.id} (slug: ${slug})`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to import: ${error}`);
      errors.push({
        post: post.title,
        error: error instanceof Error ? error.message : String(error),
      });
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log('\n⚠️  Errors:');
    errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. "${err.post}": ${err.error}`);
    });
  }

  await prisma.$disconnect();
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Usage: npx tsx scripts/import-posts.ts <json-file-path>');
  console.log('\nExample JSON format:');
  console.log(`
[
  {
    "title": "Első bejegyzés",
    "content": "Ez a teljes tartalom...",
    "excerpt": "Rövid kivonat",
    "status": "PUBLISHED",
    "imageUrl": "https://example.com/image.jpg",
    "categoryName": "Hírek",
    "publishedAt": "2024-01-15T10:00:00Z"
  }
]
  `);
  process.exit(1);
}

const jsonFilePath = path.resolve(args[0]);
importPosts(jsonFilePath).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

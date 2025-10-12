import { PrismaClient } from "@prisma/client";
import { NEWS_CATEGORIES, NEWS_CATEGORY_DESCRIPTIONS, NEWS_CATEGORY_COLORS } from "../constants/news-categories";

const prisma = new PrismaClient();

async function migrateCategories() {
  console.log("🚀 Starting category migration...");

  try {
    // Create news categories from constants
    const categoryMigrations = NEWS_CATEGORIES.map(async (categoryName, index) => {
      const description = NEWS_CATEGORY_DESCRIPTIONS[categoryName];
      const color = NEWS_CATEGORY_COLORS[categoryName].primary;

      // Check if category already exists
      const existing = await prisma.newsCategory.findFirst({
        where: { name: categoryName }
      });

      if (existing) {
        console.log(`📦 Category "${categoryName}" already exists, skipping...`);
        return existing;
      }

      // Create new category
      const newCategory = await prisma.newsCategory.create({
        data: {
          name: categoryName,
          description,
          color,
          isActive: true,
          sortOrder: index,
        }
      });

      console.log(`✅ Created category: ${categoryName} (${color})`);
      return newCategory;
    });

    const categories = await Promise.all(categoryMigrations);
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`- Total categories processed: ${NEWS_CATEGORIES.length}`);
    console.log(`- Categories in database: ${categories.length}`);

    // Optionally migrate existing posts with legacy categories
    console.log(`\n🔄 Looking for posts with legacy categories to migrate...`);
    
    const postsWithLegacyCategories = await prisma.post.findMany({
      where: {
        category: { not: null },
        newsCategoryId: null
      },
      select: {
        id: true,
        title: true,
        category: true
      }
    });

    if (postsWithLegacyCategories.length > 0) {
      console.log(`Found ${postsWithLegacyCategories.length} posts with legacy categories:`);
      
      for (const post of postsWithLegacyCategories) {
        if (post.category && NEWS_CATEGORIES.includes(post.category as any)) {
          // Find matching new category
          const matchingCategory = categories.find(cat => cat.name === post.category);
          
          if (matchingCategory) {
            await prisma.post.update({
              where: { id: post.id },
              data: { 
                newsCategoryId: matchingCategory.id,
                // Optionally keep the old category for backward compatibility
                // category: post.category 
              }
            });
            
            console.log(`✅ Migrated post "${post.title}" to category "${matchingCategory.name}"`);
          } else {
            console.log(`⚠️  No matching category found for post "${post.title}" with category "${post.category}"`);
          }
        } else {
          console.log(`⚠️  Post "${post.title}" has unknown legacy category: "${post.category}"`);
        }
      }
    } else {
      console.log(`No posts with legacy categories found.`);
    }

    console.log(`\n🎉 Category migration completed successfully!`);
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCategories()
    .then(() => {
      console.log("Migration script completed.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateCategories };
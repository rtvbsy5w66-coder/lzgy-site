// Script to update posts to use new series categories
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Updating posts to new series categories...\n');

  // Get category IDs
  const mzpCategory = await prisma.newsCategory.findUnique({
    where: { name: 'MZP tévedsz!' }
  });

  const korrupcioCategory = await prisma.newsCategory.findUnique({
    where: { name: 'A korrupció öl' }
  });

  if (!mzpCategory || !korrupcioCategory) {
    console.error('❌ Categories not found!');
    return;
  }

  // Update "MZP tévedsz!" posts
  const mzpPosts = await prisma.post.updateMany({
    where: {
      subcategory: { contains: 'MZP' }
    },
    data: {
      newsCategoryId: mzpCategory.id,
      subcategory: null // Remove subcategory as it's now the main category
    }
  });
  console.log(`✅ Updated ${mzpPosts.count} "MZP tévedsz!" posts to orange`);

  // Update "A korrupció öl" posts
  const korrupcioPosts = await prisma.post.updateMany({
    where: {
      subcategory: { contains: 'korrupció' }
    },
    data: {
      newsCategoryId: korrupcioCategory.id,
      subcategory: null // Remove subcategory as it's now the main category
    }
  });
  console.log(`✅ Updated ${korrupcioPosts.count} "A korrupció öl" posts to dark red`);

  console.log('\n✅ All posts updated!');
  console.log('Refresh the /hirek page to see different colored cards!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

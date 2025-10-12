// Script to revert posts back to "Sorozatok" category with subcategories
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Reverting posts back to Sorozatok category...\n');

  // Get "Sorozatok" category ID
  const sorozatokCategory = await prisma.newsCategory.findUnique({
    where: { name: 'Sorozatok' }
  });

  if (!sorozatokCategory) {
    console.error('❌ Sorozatok category not found!');
    return;
  }

  // Revert "MZP tévedsz!" posts
  const mzpPosts = await prisma.post.updateMany({
    where: {
      title: { contains: 'MZP' }
    },
    data: {
      newsCategoryId: sorozatokCategory.id,
      subcategory: 'MZP tévedsz!'
    }
  });
  console.log(`✅ Reverted ${mzpPosts.count} MZP posts to Sorozatok with subcategory`);

  // Revert "A korrupció öl" posts
  const korrupcioPosts = await prisma.post.updateMany({
    where: {
      title: { contains: 'korrupció' }
    },
    data: {
      newsCategoryId: sorozatokCategory.id,
      subcategory: 'A korrupció öl'
    }
  });
  console.log(`✅ Reverted ${korrupcioPosts.count} korrupció posts to Sorozatok with subcategory`);

  console.log('\n✅ All posts reverted to Sorozatok category!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

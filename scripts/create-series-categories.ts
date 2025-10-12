// Script to create series categories
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Creating series categories...\n');

  // Create "MZP tévedsz!" category with orange color
  const mzpCategory = await prisma.newsCategory.create({
    data: {
      name: 'MZP tévedsz!',
      description: 'MZP tévedsz! sorozat bejegyzései',
      color: '#f97316',  // Orange
      isActive: true
    }
  });
  console.log('✅ Created:', mzpCategory.name, '- Color:', mzpCategory.color);

  // Create "A korrupció öl" category with dark red color
  const korrupcioCategory = await prisma.newsCategory.create({
    data: {
      name: 'A korrupció öl',
      description: 'A korrupció öl sorozat bejegyzései',
      color: '#991b1b',  // Dark red
      isActive: true
    }
  });
  console.log('✅ Created:', korrupcioCategory.name, '- Color:', korrupcioCategory.color);

  console.log('\n✅ Series categories created successfully!');
  console.log('\nNext steps:');
  console.log('1. Go to /admin/posts');
  console.log('2. Edit each post and change category from "Sorozatok" to the appropriate series category');
  console.log('3. Remove subcategory field if no longer needed');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating petition categories...');

  // Create the three initial categories
  const categories = [
    {
      name: 'Környezet',
      description: 'Környezetvédelmi és fenntarthatósági témák',
      color: '#22c55e', // Green
      sortOrder: 0,
    },
    {
      name: 'Közlekedés',
      description: 'Közlekedési infrastruktúra és mobilitási kérdések',
      color: '#3b82f6', // Blue
      sortOrder: 1,
    },
    {
      name: 'Oktatás',
      description: 'Oktatási rendszer és képzési lehetőségek',
      color: '#f59e0b', // Amber
      sortOrder: 2,
    },
  ];

  const createdCategories = [];

  for (const categoryData of categories) {
    try {
      // Check if category already exists
      const existingCategory = await prisma.petitionCategory.findUnique({
        where: { name: categoryData.name }
      });

      if (existingCategory) {
        console.log(`Category "${categoryData.name}" already exists, skipping...`);
        createdCategories.push(existingCategory);
        continue;
      }

      // Create new category
      const category = await prisma.petitionCategory.create({
        data: categoryData
      });

      createdCategories.push(category);
      console.log(`✅ Created category: ${category.name} (ID: ${category.id})`);
    } catch (error) {
      console.error(`❌ Error creating category "${categoryData.name}":`, error);
    }
  }

  console.log(`\n🎉 Successfully set up ${createdCategories.length} petition categories:`);
  
  createdCategories.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}`);
    console.log(`   - ID: ${category.id}`);
    console.log(`   - Color: ${category.color}`);
    console.log(`   - Description: ${category.description}`);
    console.log('');
  });

  console.log('✅ Petition categories are ready for use!');
}

main()
  .catch((e) => {
    console.error('Error seeding petition categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
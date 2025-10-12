import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test petition...');

  // Get Környezet category
  const environmentCategory = await prisma.petitionCategory.findFirst({
    where: { name: 'Környezet' }
  });

  if (!environmentCategory) {
    console.error('Environment category not found!');
    process.exit(1);
  }

  // Create test petition
  const petition = await prisma.petition.create({
    data: {
      title: 'Zöld energiára való átállás támogatása',
      description: 'Kérjük a helyi önkormányzatot, hogy támogassa a megújuló energia projektek megvalósítását a kerületben.',
      fullText: `
A klímaváltozás sürgető problémákat jelent városunk számára. Ezért kezdeményezzük, hogy a helyi önkormányzat:

1. **Napelempark létesítése**: Hozzon létre egy közösségi napelemparkot a város szélén
2. **Energiahatékonyság**: Modernizálja a közintézmények energiarendszereit
3. **Elektromos közlekedés**: Bővítse az elektromos autók töltőhálózatát
4. **Zöld épületek**: Támogassa a környezetbarát építkezéseket adókedvezményekkel

Ezekkel a lépésekkel jelentősen csökkenthetjük a város szén-dioxid kibocsátását és példát mutathatunk más településeknek.

A petíció célja, hogy 2025-re a város energiafogyasztásának legalább 30%-a megújuló forrásokból származzon.
      `,
      targetGoal: 500,
      categoryId: environmentCategory.id,
      tags: 'zöld energia, klíma, megújuló energia, környezetvédelem',
      status: 'ACTIVE',
      isPublic: true,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      publishedAt: new Date(),
      createdBy: 'admin',
    },
    include: {
      category: true,
      _count: {
        select: {
          signatures: true,
        },
      },
    },
  });

  console.log('✅ Test petition created successfully:');
  console.log(`ID: ${petition.id}`);
  console.log(`Title: ${petition.title}`);
  console.log(`Category: ${petition.category.name}`);
  console.log(`Target Goal: ${petition.targetGoal} signatures`);
  console.log(`Status: ${petition.status}`);
  console.log(`End Date: ${petition.endDate?.toLocaleDateString('hu-HU')}`);
  console.log(`\n📱 Test the petition at: http://localhost:3001/peticiok/${petition.id}`);
  console.log(`📋 View all petitions at: http://localhost:3001/peticiok`);
}

main()
  .catch((e) => {
    console.error('Error creating test petition:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
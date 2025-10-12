import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('📦 Hírek kategóriák seed-elése...');

  const categories = [
    { name: 'Hírek', description: 'Általános hírek és aktualitások', color: '#3b82f6', sortOrder: 1 },
    { name: 'Események', description: 'Rendezvények és események hírei', color: '#10b981', sortOrder: 2 },
    { name: 'Közlemények', description: 'Hivatalos közlemények és bejelentések', color: '#f59e0b', sortOrder: 3 },
    { name: 'Sajtóközlemények', description: 'Sajtó számára készült hivatalos közlemények', color: '#ef4444', sortOrder: 4 },
    { name: 'Kampány', description: 'Kampányhoz kapcsolódó hírek és információk', color: '#8b5cf6', sortOrder: 5 },
    { name: 'V. kerület', description: 'V. kerületi képviselői munkához kapcsolódó hírek és fejlesztések', color: '#dc2626', sortOrder: 6 },
    { name: 'Sorozatok', description: 'Sorozatos bejegyzések és kampányok', color: '#8b5cf6', sortOrder: 10 },
  ];

  for (const cat of categories) {
    const result = await prisma.newsCategory.upsert({
      where: { name: cat.name },
      update: {
        description: cat.description,
        color: cat.color,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        description: cat.description,
        color: cat.color,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    console.log(`✅ ${result.name} - ${result.id}`);
  }

  console.log('\n🎉 Minden kategória létrehozva/frissítve!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

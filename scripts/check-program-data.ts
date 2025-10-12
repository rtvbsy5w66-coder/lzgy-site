// scripts/check-program-data.ts
import { prisma } from '../src/lib/prisma';

async function checkProgramData() {
  try {
    const count = await prisma.programPoint.count({
      where: { isActive: true }
    });

    console.log(`\n📊 Programpontok száma az adatbázisban: ${count}`);

    if (count > 0) {
      const points = await prisma.programPoint.findMany({
        where: { isActive: true },
        take: 3,
        select: {
          id: true,
          title: true,
          category: true,
          priority: true,
        }
      });

      console.log('\n🔍 Első 3 programpont:');
      points.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.title} (${p.category}) - Prioritás: ${p.priority}`);
      });
    } else {
      console.log('\n⚠️  Az adatbázis üres - nincs programpont!');
    }

  } catch (error) {
    console.error('❌ Hiba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProgramData();

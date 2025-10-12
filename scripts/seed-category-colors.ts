// scripts/seed-category-colors.ts
import { prisma } from '../src/lib/prisma';

const CATEGORY_COLORS = [
  {
    name: "Szociálpolitika",
    color: "#f59e0b",
    description: "Családtámogatás, szociális lakhatás és társadalmi felzárkóztatás",
    sortOrder: 1
  },
  {
    name: "Oktatáspolitika",
    color: "#3b82f6",
    description: "Digitális oktatás, pedagógus támogatás és felsőoktatás fejlesztése",
    sortOrder: 2
  },
  {
    name: "Egészségügy",
    color: "#ef4444",
    description: "Várólisták felszámolása, egészségügyi dolgozók támogatása és megelőzés",
    sortOrder: 3
  },
  {
    name: "Közlekedés",
    color: "#8b5cf6",
    description: "Ingyenes tömegközlekedés, elektromos közlekedés és vasútfejlesztés",
    sortOrder: 4
  },
  {
    name: "Turizmus és vendéglátás",
    color: "#22c55e",
    description: "Kulturális turizmus, gyógyturizmus és vidéki turizmus fejlesztése",
    sortOrder: 5
  },
  {
    name: "Honvédelem",
    color: "#6b7280",
    description: "Katonai modernizáció, veterán támogatás és polgári védelem",
    sortOrder: 6
  },
  {
    name: "Rendvédelem",
    color: "#1f2937",
    description: "Közbiztonság növelése, kiberbűnözés elleni küzdelem és igazságszolgáltatás",
    sortOrder: 7
  },
  {
    name: "Nyugdíjasok támogatása",
    color: "#ec4899",
    description: "Nyugdíjemelés, idősellátás és aktív időskor programok",
    sortOrder: 8
  },
  {
    name: "Integritás és elszámoltatás",
    color: "#0891b2",
    description: "Átlátható közbeszerzés, korrupcióellenes intézkedések és etikai normák",
    sortOrder: 9
  }
];

async function main() {
  console.log('🌱 Kategória színek seed indítása...\n');

  for (const category of CATEGORY_COLORS) {
    const existing = await prisma.categoryColor.findUnique({
      where: { name: category.name }
    });

    if (existing) {
      console.log(`⚠️  "${category.name}" már létezik, frissítés...`);
      await prisma.categoryColor.update({
        where: { name: category.name },
        data: {
          color: category.color,
          description: category.description,
          sortOrder: category.sortOrder
        }
      });
    } else {
      console.log(`✅ "${category.name}" létrehozása...`);
      await prisma.categoryColor.create({
        data: category
      });
    }
  }

  const count = await prisma.categoryColor.count({ where: { isActive: true } });
  console.log(`\n✨ Kész! ${count} kategória szín az adatbázisban.`);
}

main()
  .catch((e) => {
    console.error('❌ Hiba:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

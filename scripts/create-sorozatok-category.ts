/**
 * Create "Sorozatok" category and series posts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating "Sorozatok" category and series...\n');

  // 1. Create "Sorozatok" category
  console.log('📁 Creating category: Sorozatok');
  const sorozatokCategory = await prisma.newsCategory.upsert({
    where: { name: 'Sorozatok' },
    update: {},
    create: {
      name: 'Sorozatok',
      description: 'Sorozatos bejegyzések és kampányok',
      color: '#8b5cf6', // Purple color for series
      isActive: true,
      sortOrder: 10,
    },
  });
  console.log(`  ✅ Created: ${sorozatokCategory.id} (${sorozatokCategory.name})\n`);

  // 2. Create "A korrupció öl" series intro post
  console.log('📝 Creating: A korrupció öl - Sorozat bevezető');
  const korrupcioOl = await prisma.post.create({
    data: {
      title: 'A korrupció öl - Sorozat bevezető',
      slug: 'a-korrupcio-ol-sorozat-bevezeto',
      content: `# A korrupció öl - Sorozat

Ez egy új sorozat, amelyben a korrupció magyarországi jelenségeit és következményeit vizsgálom meg.

## Miről szól a sorozat?

A korrupció nem csak erkölcsi probléma - konkrét emberéleteket, egészséget és jövőket veszélyeztet. Ebben a sorozatban konkrét eseteket, adatokat és történeteket mutatok be, amelyek szemléltetik, hogy:

- Hogyan hat a korrupció az egészségügyre
- Milyen következményei vannak az oktatásban
- Hogyan befolyásolja a közlekedési biztonságot
- Miként rombolja a közbizalmat

## Következő részek:

1. **Egészségügy:** Amikor a korrupció miatt emberek halnak meg
2. **Oktatás:** A korrupció, ami a jövőnket lopja
3. **Infrastruktúra:** Életveszélyes hidak és utak
4. **Közbeszerzések:** Milliárdok, amik eltűnnek

Kövessétek a sorozatot, hogy teljes képet kapjatok!`,
      excerpt: 'Új sorozat indul: A korrupció nem csak erkölcsi probléma - életeket veszélyeztet. Ismerjétek meg a tényeket!',
      status: 'PUBLISHED',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&fit=crop&crop=center',
      newsCategoryId: sorozatokCategory.id,
      createdAt: new Date('2024-01-10T10:00:00Z'),
      updatedAt: new Date(),
    },
  });
  console.log(`  ✅ Created: ${korrupcioOl.id}\n`);

  // 3. Create "MZP, tévedsz!" series intro post
  console.log('📝 Creating: MZP, tévedsz! - Sorozat bevezető');
  const mzpTevedsz = await prisma.post.create({
    data: {
      title: 'MZP, tévedsz! - Sorozat bevezető',
      slug: 'mzp-tevedsz-sorozat-bevezeto',
      content: `# MZP, tévedsz! - Sorozat

Egy új sorozat, amelyben Márki-Zay Péter egyes kijelentéseit, döntéseit és politikai lépéseit elemzem konstruktív kritikával.

## Miért ezt a címet?

Nem ellenségként, hanem építő kritikusként szeretnék hozzászólni az ellenzéki politikához. A cél nem a személyeskedés, hanem:

- **Faktaellenőrzés:** Amikor a kijelentések nem felelnek meg a valóságnak
- **Stratégiai kritika:** Amikor jobb megoldások léteznek
- **Kommunikációs hibák:** Amikor az üzenet nem jut el az emberekhez
- **Alternatívák:** Mit tehetnénk másképp?

## Témák, amiket érinteni fogunk:

1. **Gazdaságpolitika:** Alternatív megközelítések
2. **Kampánystratégia:** Mi működött, mi nem?
3. **Kommunikáció:** Hogyan lehetne hatékonyabb?
4. **Szövetségépítés:** Miként lehetne szélesebb összefogás?

## Fontos:

Ez nem személyeskedés. Ez konstruktív kritika, mert hiszek abban, hogy csak a hibák felismerésével és kijavításával lehetünk sikeresebbek.

**Egyetértesz vagy nem? Kommentelj, vitatkozzunk!**`,
      excerpt: 'Konstruktív kritikai sorozat: elemzések, faktaellenőrzés és alternatív javaslatok Márki-Zay Péter politikájához.',
      status: 'PUBLISHED',
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&fit=crop&crop=center',
      newsCategoryId: sorozatokCategory.id,
      createdAt: new Date('2024-01-15T14:00:00Z'),
      updatedAt: new Date(),
    },
  });
  console.log(`  ✅ Created: ${mzpTevedsz.id}\n`);

  // Summary
  console.log('='.repeat(60));
  console.log('✅ Sikeresen létrehozva:');
  console.log(`  📁 Kategória: ${sorozatokCategory.name}`);
  console.log(`  📝 Sorozat 1: A korrupció öl`);
  console.log(`  📝 Sorozat 2: MZP, tévedsz!`);
  console.log('='.repeat(60));
  console.log('\n🌐 Megtekinthető:');
  console.log(`  - http://localhost:3000/hirek`);
  console.log(`  - http://localhost:3000/admin/posts`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

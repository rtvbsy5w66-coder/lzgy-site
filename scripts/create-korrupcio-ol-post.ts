/**
 * Create example post: Luxusórák vs. műtéti várólisták
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating "Luxusórák vs. műtéti várólisták" post...\n');

  // Find Sorozatok category
  const sorozatokCategory = await prisma.newsCategory.findUnique({
    where: { name: 'Sorozatok' },
  });

  if (!sorozatokCategory) {
    console.error('❌ "Sorozatok" category not found. Please run create-sorozatok-category.ts first.');
    process.exit(1);
  }

  // Create the post
  const post = await prisma.post.create({
    data: {
      title: 'Luxusórák vs. műtéti várólisták: A korrupció két arca',
      slug: 'luxusorak-vs-muteti-varolistak-a-korrupcio-ket-arca',
      content: `# Luxusórák vs. műtéti várólisták: A korrupció két arca

**A korrupció öl sorozat - 1. rész**

Míg egészségügyi vezetők luxusórákat viselnek, addig emberek halnak meg a végtelen várólistákon. Ez nem véletlenszerű összefüggés - ez ok-okozati kapcsolat.

## A számok, amik megdöbbentenek

**2023-as adatok:**
- 📊 Átlagos váróidő csípőprotézis műtétre: **18-24 hónap**
- 📊 Szívműtétre várakozók száma: **több mint 5000 fő**
- 📊 Onkológiai kezelésre várakozás: **3-6 hónap**

Közben:
- 💎 Egészségügyi vezető órakollekcióját becsült érték: **50+ millió Ft**
- 💎 Közbeszerzések "túlfizetése": **milliárdos nagyságrend**
- 💎 Hálópénz orvosoknak: **évi 100+ milliárd Ft**

## Mi Éva története

Mi Éva, 67 éves nyugdíjas, 2 éve várakozik csípőprotézis műtétre. Már alig tud járni, folyamatos fájdalomcsillapítókon él.

*"Amikor a kórházban megkérdeztem, miért tart ez ennyire, azt mondták: nincs elég orvos, nincs elég műtő. De közben látom a hírekben, hogy milliárdokat költenek felesleges dolgokra."*

## A kapcsolat: Hogyan öl a korrupció?

### 1. **Ellopott források**
Minden egyes korrupt ügylet pénzt von el az egészségügyből:
- CT/MRI gépek hiánya
- Szakorvos hiány (alacsony bérek miatt elvándorlás)
- Leromlott kórházi infrastruktúra

### 2. **Torz prioritások**
A döntéshozók nem a betegek érdekeit nézik:
- Közpénzből fizetett luxusórák és autók
- "Barátoknak" juttatott közbeszerzések
- Politikai szempontok egészségügyi szakmai helyett

### 3. **Bizalomvesztés**
A korrupció miatt orvosok mennek külföldre:
- Magyarországon: ~400.000 Ft nettó kezdő orvosi bér
- Németországban: ~1.200.000 Ft (átszámítva)

## Mit tehetünk?

**Rövid távon:**
1. Átláthatóság kikényszerítése - nyilvános közbeszerzési adatok
2. Antikorrupciós egység létrehozása az egészségügyben
3. Whistleblower védelem bevezetése

**Hosszú távon:**
1. Rendszerszintű reformok
2. Független ellenőrzés
3. Európai uniós források feletti szigorú kontroll

## Következtetés

**Ez nem elvont probléma.** Ez nem csak "politikai csúsztatás". **Ez emberéletekről szól.**

Minden egyes korrupt ügylet:
- ❌ Egy műtét, ami elmarad
- ❌ Egy orvos, aki külföldre megy
- ❌ Egy beteg, aki szenved

**A korrupció öl. Szó szerint.**

---

📢 **Kövess a sorozatban!** Következő rész: *"Tankönyvek és kenőpénz: Amikor gyerekek fizetik a számlát"*

💬 **Te mit gondolsz?** Kommentelj, oszd meg a tapasztalataidat!`,
      excerpt: 'A korrupció öl sorozat 1. része: Míg vezetők luxusórákat viselnek, emberek halnak meg a várólistákon. Konkrét adatok, igaz történetek.',
      status: 'PUBLISHED',
      imageUrl: 'https://images.unsplash.com/photo-1584036533827-45bce166ad94?w=800&fit=crop&crop=center',
      newsCategoryId: sorozatokCategory.id,
      subcategory: 'A korrupció öl',
      createdAt: new Date('2024-01-20T09:00:00Z'),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Post created successfully!');
  console.log(`   ID: ${post.id}`);
  console.log(`   Title: ${post.title}`);
  console.log(`   Category: ${sorozatokCategory.name}`);
  console.log(`   Subcategory: ${post.subcategory}`);
  console.log('\n🌐 View at:');
  console.log(`   - http://localhost:3000/hirek/${post.slug}`);
  console.log(`   - http://localhost:3000/hirek (select "Sorozatok" category)`);
  console.log(`   - http://localhost:3000/admin/posts/${post.id}/edit`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

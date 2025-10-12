const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test categories with diverse colors
const testCategories = [
  {
    name: "Helyi Politika",
    description: "Városi és helyi közügyek",
    color: "#dc2626", // Red
    sortOrder: 1
  },
  {
    name: "Gazdaság",
    description: "Gazdasági hírek és elemzések",
    color: "#059669", // Green
    sortOrder: 2
  },
  {
    name: "Oktatás",
    description: "Oktatási hírek és fejlesztések",
    color: "#2563eb", // Blue
    sortOrder: 3
  },
  {
    name: "Környezetvédelem",
    description: "Környezetvédelmi kezdeményezések",
    color: "#16a34a", // Emerald
    sortOrder: 4
  },
  {
    name: "Közlekedés",
    description: "Közlekedési hírek és fejlesztések",
    color: "#ea580c", // Orange
    sortOrder: 5
  },
  {
    name: "Kultúra",
    description: "Kulturális események és hírek",
    color: "#7c3aed", // Purple
    sortOrder: 6
  },
  {
    name: "Sport",
    description: "Helyi sport hírek",
    color: "#0891b2", // Cyan
    sortOrder: 7
  },
  {
    name: "Közösség",
    description: "Közösségi események és hírek",
    color: "#be185d", // Pink
    sortOrder: 8
  }
];

// Test articles with various content
const testArticles = [
  {
    title: "Új közpark megnyitása a város központjában",
    content: `<p>A városi önkormányzat örömmel jelentette be, hogy a hosszú várakozás után végre megnyílik az új közpark a város központjában. A park modern játszóterekkel, sétaösvényekkel és zöld területekkel várja a családokat.</p>
    
    <p>A beruházás során több mint 500 új fát ültettek el, és modern öntözőrendszert alakítottak ki. A park különleges vonzereje a központi szökőkút, amely este színes világítással kápráztatja el a látogatókat.</p>
    
    <p>"Ez a park valóban a közösség szívének központja lesz" - nyilatkozta a polgármester a megnyitó ünnepségen.</p>`,
    excerpt: "A városi önkormányzat örömmel jelentette be az új közpark megnyitását modern játszóterekkel és zöld területekkel.",
    category: "Helyi Politika",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop"
  },
  {
    title: "Helyi vállalkozások támogatási programja indul",
    content: `<p>Az önkormányzat új támogatási programot indít a helyi kis- és középvállalkozások segítésére. A program keretében akár 5 millió forint vissza nem térítendő támogatást kaphatnak a vállalkozások fejlesztési célokra.</p>
    
    <p>A pályázat különösen kedvez azoknak a vállalkozásoknak, amelyek munkahelyeket teremtenek vagy környezetbarát technológiákat alkalmaznak. A jelentkezési határidő március 31.</p>`,
    excerpt: "Új támogatási program indul helyi vállalkozásoknak, akár 5 millió forint vissza nem térítendő támogatással.",
    category: "Gazdaság"
  },
  {
    title: "Digitális oktatási eszközök minden iskolában",
    content: `<p>A város minden általános és középiskolája korszerű digitális oktatási eszközöket kap a következő tanévtől. A beruházás részeként interaktív táblák, tabletek és laptopok kerülnek az osztálytermekbe.</p>
    
    <p>A program célja, hogy felkészítse a diákokat a 21. század kihívásaira és lehetővé tegye a modern oktatási módszerek alkalmazását. A pedagógusok számára speciális képzéseket is szerveznek.</p>`,
    excerpt: "Minden helyi iskola korszerű digitális oktatási eszközöket kap, interaktív táblákkal és modern technológiával.",
    category: "Oktatás",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop"
  },
  {
    title: "Újrahasznosítási központ nyílik a városban",
    content: `<p>Hamarosan megnyílik a város új újrahasznosítási központja, ahol a lakosok ingyen leadhatják elektronikai hulladékaikat, használt bútorokat és egyéb újrahasznosítható anyagokat.</p>
    
    <p>A központ modern technológiával dolgozik fel különféle hulladékokat, és lehetőség nyílik arra is, hogy a javítható tárgyakat helyben megjavítsák. Ez jelentős lépés a körforgásos gazdaság felé.</p>`,
    excerpt: "Új újrahasznosítási központ nyílik, ahol ingyen leadható az elektronikai hulladék és más újrahasznosítható anyag.",
    category: "Környezetvédelem"
  },
  {
    title: "Kerékpárút-hálózat bővítése folytatódik",
    content: `<p>A város folytatja a kerékpárút-hálózat fejlesztését. Az idei évben további 15 kilométer biztonságos kerékpárút épül ki, amely összeköti a lakóövezeteket a munkahelyekkel és oktatási intézményekkel.</p>
    
    <p>Az új szakaszok között szerepel a főutca menti védett kerékpársáv és a parkokat összekötő rekreációs útvonal is. A beruházás várhatóan nyárig befejeződik.</p>`,
    excerpt: "További 15 kilométer kerékpárút épül ki idén, összekapcsolva a lakóövezeteket a munkahelyekkel.",
    category: "Közlekedés",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
  },
  {
    title: "Városi művészeti fesztivál szeptemberben",
    content: `<p>Szeptemberben rendezik meg az első Városi Művészeti Fesztivált, amely három napon keresztül színes programokkal várja a művészet szerelmeseit. A fesztiválon helyi és országos művészek is bemutatkoznak.</p>
    
    <p>A programban szerepelnek kiállítások, koncertek, színházi előadások és workshopok is. A rendezvény célja, hogy bemutassa a helyi kulturális értékeket és tehetségeket.</p>`,
    excerpt: "Három napos művészeti fesztivál szeptemberben helyi és országos művészekkel, kiállításokkal és koncertekkel.",
    category: "Kultúra"
  },
  {
    title: "Helyi futballklub bajnokságot nyert",
    content: `<p>A városi futballklub történelmi győzelmet aratott: megnyerte a megyei bajnokságot és feljutott a magasabb osztályba. A csapat fantasztikus szezont tudhat maga mögött.</p>
    
    <p>A sikeres szezon mögött a város támogatása és a szurkolók hűsége állt. A klub vezetősége már tervezi a következő szezon felkészülését és új játékosok igazolását.</p>`,
    excerpt: "A városi futballklub megnyerte a megyei bajnokságot és feljutott a magasabb osztályba.",
    category: "Sport",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop"
  },
  {
    title: "Közösségi kert projekt az óvárosban",
    content: `<p>Új közösségi kert projekt indult az óváros szívében, ahol a lakosok együtt gondozhatnak zöldségeket és gyümölcsöket. A kezdeményezés célja a közösség építése és a helyi élelmiszer-termelés támogatása.</p>
    
    <p>A kertben mindenki számára biztosított egy kis parcella, ahol saját ötletei szerint gazdálkodhat. Közös programok és workshop-ok is várják az érdeklődőket.</p>`,
    excerpt: "Közösségi kert projekt az óvárosban, ahol a lakosok együtt termeszthetnek zöldségeket és gyümölcsöket.",
    category: "Közösség"
  },
  {
    title: "Energiahatékony épületek a városban",
    content: `<p>A város ambiciózus tervet dolgozott ki az energiahatékonyság növelésére. A következő években minden közintézményben korszerű fűtési és világítási rendszereket telepítenek.</p>
    
    <p>A projekt részeként napelemeket is felszerelnek a közintézmények tetőire, ami jelentős mértékben csökkenti majd a város energiafogyasztását és károsanyag-kibocsátását.</p>`,
    excerpt: "Energiahatékonysági program indul: napelemek és korszerű rendszerek minden közintézményben.",
    category: "Környezetvédelem",
    imageUrl: "https://images.unsplash.com/photo-1493946740644-2d8a1f1a6aff?w=800&h=600&fit=crop"
  },
  {
    title: "Új buszmegálló modern technológiával",
    content: `<p>A város legforgalmasabb pontján új, modern buszmegálló épült, amely digitális információs táblákkal és ingyenes wifi-vel várja az utasokat. A megálló tervezésénél különös figyelmet fordítottak a környezetbarát megoldásokra.</p>
    
    <p>A fedett váróhelyiség kényelmes ülőhelyeket biztosít, és esős időben is szárazon tartja az utasokat. A LED világítás energiatakarékos és biztonságos közlekedést tesz lehetővé este is.</p>`,
    excerpt: "Modern buszmegálló épült digitális táblákkal, ingyenes wifi-vel és környezetbarát megoldásokkal.",
    category: "Közlekedés"
  }
];

async function seedTestContent() {
  try {
    console.log('🌱 Test tartalom feltöltése kezdődik...');

    // Create categories
    console.log('📂 Kategóriák létrehozása...');
    const createdCategories = [];
    
    for (const category of testCategories) {
      const existing = await prisma.newsCategory.findUnique({
        where: { name: category.name }
      });
      
      if (!existing) {
        const created = await prisma.newsCategory.create({
          data: category
        });
        createdCategories.push(created);
        console.log(`✅ Kategória létrehozva: ${created.name} (${created.color})`);
      } else {
        createdCategories.push(existing);
        console.log(`ℹ️  Kategória már létezik: ${existing.name}`);
      }
    }

    // Create articles
    console.log('\n📰 Cikkek létrehozása...');
    
    for (const article of testArticles) {
      // Find category
      const category = createdCategories.find(cat => cat.name === article.category);
      
      if (!category) {
        console.log(`❌ Kategória nem található: ${article.category}`);
        continue;
      }

      // Generate slug
      const slug = article.title
        .toLowerCase()
        .replace(/[áàâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòôöő]/g, 'o')
        .replace(/[úùûüű]/g, 'u')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if article already exists
      const existing = await prisma.post.findUnique({
        where: { slug }
      });

      if (!existing) {
        const created = await prisma.post.create({
          data: {
            title: article.title,
            slug,
            content: article.content,
            excerpt: article.excerpt,
            status: 'PUBLISHED',
            newsCategoryId: category.id,
            imageUrl: article.imageUrl || null
          }
        });
        
        console.log(`✅ Cikk létrehozva: ${created.title} (${category.name})`);
      } else {
        console.log(`ℹ️  Cikk már létezik: ${article.title}`);
      }
    }

    console.log('\n🎉 Test tartalom feltöltése befejezve!');
    console.log(`📊 Összesen ${createdCategories.length} kategória és ${testArticles.length} cikk`);
    
  } catch (error) {
    console.error('❌ Hiba a test tartalom feltöltése során:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestContent();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Additional test articles - mix of image and image-less posts
const additionalArticles = [
  {
    title: "Új parkolási rendszer bevezetése a belvárosban",
    content: `<p>A városi közgyűlés döntése értelmében új parkolási rendszer kerül bevezetésre a belváros területén. A változtatás célja a forgalom csökkentése és a környezetszennyezés mérséklése.</p>
    
    <p>Az új rendszer magában foglalja a fizetős parkolózónák kibővítését és a P+R parkolók létrehozását a város peremén. A lakosság számára kedvezményes éves bérletek is elérhetőek lesznek.</p>`,
    excerpt: "Új parkolási rendszer kerül bevezetésre a belvárosban a forgalom csökkentése érdekében.",
    category: "Helyi Politika"
  },
  {
    title: "Helyi vállalkozók képzési programja",
    content: `<p>A Kereskedelmi és Iparkamara együttműködésében új képzési program indul a helyi kis- és középvállalkozók számára. A program célja a digitális készségek fejlesztése és a modern üzletvezetési módszerek megismertetése.</p>
    
    <p>A résztvevők megtanulhatják az online marketing alapjait, az e-kereskedelmi platformok használatát és a modern könyvelési rendszerek kezelését.</p>`,
    excerpt: "Új képzési program indul a helyi vállalkozók digitális készségeinek fejlesztésére.",
    category: "Gazdaság",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
  },
  {
    title: "Nyelvoktatási program bővítése",
    content: `<p>A város nyelvi programja jelentősen bővül: angol és német mellett francia és spanyol nyelvtanfolyamok is indulnak a felnőttek számára. A program célja a helyi lakosság nyelvtudásának fejlesztése.</p>
    
    <p>A kurzusok különböző szinteken érhetőek el, kezdőtől haladóig. A jelentkezés már megkezdődött, és kedvezményes áron vehetnek részt a helyi lakosok.</p>`,
    excerpt: "Bővül a város nyelvi programja francia és spanyol tanfolyamokkal.",
    category: "Oktatás"
  },
  {
    title: "Zöld energia projekt lakossági támogatással",
    content: `<p>Új zöld energia projekt indul a városban, amelynek keretében napelemes rendszerek telepítését támogatja az önkormányzat. A program célja a megújuló energia használatának népszerűsítése.</p>
    
    <p>A pályázók akár 50%-os támogatást kaphatnak a napelemes rendszerek telepítési költségeihez. A program keretében 100 háztartás vehet részt.</p>`,
    excerpt: "50%-os támogatással segíti az önkormányzat a napelemes rendszerek telepítését.",
    category: "Környezetvédelem"
  },
  {
    title: "Új tömegközlekedési mobilalkalmazás",
    content: `<p>Modern mobilalkalmazás segíti a tömegközlekedés használatát. Az app valós időben mutatja a járatok pozícióját, és lehetővé teszi a jegyvásárlást is telefonról.</p>
    
    <p>Az alkalmazás tartalmazza az összes helyi járat menetrendjét, útvonaltervezőt és késési értesítéseket is. A felhasználók visszajelzéseket is küldhetnek a szolgáltatás minőségéről.</p>`,
    excerpt: "Új mobilalkalmazás segíti a tömegközlekedés használatát valós idejű információkkal.",
    category: "Közlekedés"
  },
  {
    title: "Múzeumok éjszakája rendezvénysorozat",
    content: `<p>Különleges rendezvénysorozat keretében nyitják meg kapuikat éjszaka is a helyi múzeumok. A Múzeumok Éjszakája programsorozat során interaktív kiállítások és vezetések várják a látogatókat.</p>
    
    <p>A résztvevő intézmények között szerepel a helytörténeti múzeum, a kortárs művészeti galéria és a természettudományi gyűjtemény is.</p>`,
    excerpt: "Múzeumok Éjszakája rendezvénysorozat interaktív programokkal és vezetésekkel.",
    category: "Kultúra",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
  },
  {
    title: "Ifjúsági sportbajnokság szervezése",
    content: `<p>Több sportágban rendeznek bajnokságot a helyi ifjúsági csapatok számára. A versenysorozat célja a sport népszerűsítése és a tehetségek felkutatása.</p>
    
    <p>A bajnokság labdarúgás, kosárlabda, kézilabda és atletika kategóriákban indul. A győztes csapatok regionális versenyeken vehetnek részt.</p>`,
    excerpt: "Több sportágban rendeznek ifjúsági bajnokságot a helyi csapatok számára.",
    category: "Sport"
  },
  {
    title: "Házi orvosi rendelők korszerűsítése",
    content: `<p>A város összes házi orvosi rendelője korszerűsítésen esik át a következő évben. A fejlesztés modern diagnosztikai eszközök beszerzését és a váróhelyiségek felújítását is magában foglalja.</p>
    
    <p>Az új berendezések lehetővé teszik a pontosabb diagnózist és gyorsabb ellátást. A projekt része a digitális egészségügyi rendszerek bevezetése is.</p>`,
    excerpt: "Modern diagnosztikai eszközökkel újulnak meg a házi orvosi rendelők.",
    category: "Közösség"
  },
  {
    title: "Startup inkubátor program indítása",
    content: `<p>Új startup inkubátor program segíti a kezdő vállalkozásokat. A program keretében mentorálás, irodahely és kezdőtőke is rendelkezésre áll a résztvevők számára.</p>
    
    <p>A kiválasztott startupok 6 hónapos intenzív fejlesztési programban vehetnek részt, amely üzleti tréningeket és networking lehetőségeket is tartalmaz.</p>`,
    excerpt: "Startup inkubátor program mentorálással és kezdőtőkével segíti a vállalkozásokat.",
    category: "Gazdaság"
  },
  {
    title: "Közösségi komposztálási program",
    content: `<p>Környezetbarát kezdeményezés keretében közösségi komposztálási pontok létesülnek a város különböző részein. A program célja a szerves hulladék mennyiségének csökkentése.</p>
    
    <p>A lakók ingyen leadhatják növényi hulladékaikat, amelyből kiváló minőségű komposztot állítanak elő. A kész komposzt térítésmentesen visszajuttatható a kertekbe.</p>`,
    excerpt: "Közösségi komposztálási pontok létesülnek a szerves hulladék hasznosítására.",
    category: "Környezetvédelem",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop"
  },
  {
    title: "Digitális könyvtári szolgáltatások bővítése",
    content: `<p>A városi könyvtár digitális szolgáltatásai jelentősen bővülnek. E-könyvek, online adatbázisok és virtuális konferenciák is elérhetőek lesznek a beiratkozott olvasók számára.</p>
    
    <p>Az új platform lehetővé teszi a könyvek online foglalását, hosszabbítását és a könyvtári programokra való jelentkezést is. Ingyenes wifi és számítógép-használat is biztosított.</p>`,
    excerpt: "Digitális szolgáltatások bővülnek a városi könyvtárban e-könyvekkel és online adatbázisokkal.",
    category: "Oktatás"
  },
  {
    title: "Elektromos autók töltőhálózata",
    content: `<p>Széles körű elektromos autó töltőhálózat kiépítése kezdődik a városban. A töltőpontok stratégiai helyeken, parkolóházakban és bevásárlóközpontokban kerülnek elhelyezésre.</p>
    
    <p>Az első ütemben 20 gyorstöltő állomás létesül, amelyek lehetővé teszik a járművek gyors feltöltését. A szolgáltatás mobilalkalmazáson keresztül érhető el.</p>`,
    excerpt: "20 gyorstöltő állomással bővül az elektromos autók töltőhálózata.",
    category: "Közlekedés"
  }
];

async function addMoreTestContent() {
  try {
    console.log('📰 További teszt tartalom hozzáadása...');

    // Get existing categories
    const categories = await prisma.newsCategory.findMany({
      where: { isActive: true }
    });

    console.log(`📂 Talált kategóriák: ${categories.length} db`);

    // Create additional articles
    for (const article of additionalArticles) {
      const category = categories.find(cat => cat.name === article.category);
      
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
        
        const imageStatus = article.imageUrl ? "🖼️  " : "📝 ";
        console.log(`✅ ${imageStatus} Cikk létrehozva: ${created.title} (${category.name})`);
      } else {
        console.log(`ℹ️  Cikk már létezik: ${article.title}`);
      }
    }

    // Summary
    const totalPosts = await prisma.post.count({
      where: { status: 'PUBLISHED' }
    });

    const postsPerCategory = await prisma.post.groupBy({
      by: ['newsCategoryId'],
      where: { status: 'PUBLISHED' },
      _count: {
        id: true
      }
    });

    console.log('\n📊 STATISZTIKÁK:');
    console.log(`📰 Összes publikált cikk: ${totalPosts} db`);
    console.log('\n📂 Cikkek kategóriánként:');
    
    for (const stat of postsPerCategory) {
      const category = categories.find(c => c.id === stat.newsCategoryId);
      if (category) {
        console.log(`   ${category.name}: ${stat._count.id} cikk`);
      }
    }

    console.log('\n🎉 További teszt tartalom hozzáadása befejezve!');
    
  } catch (error) {
    console.error('❌ Hiba a további tartalom hozzáadásakor:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreTestContent();
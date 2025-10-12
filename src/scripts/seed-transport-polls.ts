import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating transport and urban planning polls...');

  // Calculate dates
  const now = new Date();
  const startDate = now;
  const endDate = new Date();
  endDate.setDate(now.getDate() + 30); // 30 days from now

  // Poll 1: Sustainable Transport
  const poll1 = await prisma.poll.create({
    data: {
      title: "Fenntartható közlekedés ösztönzése a kerületben",
      description: "Milyen típusú közösségi közlekedési fejlesztéseket tartana legfontosabbnak a következő 5 évben a kerület fenntarthatósági céljai érdekében?",
      category: "Közlekedés",
      startDate: startDate,
      endDate: endDate,
      timeLimit: null, // No time limit for individual voting
      isPublic: true,
      allowAnonymous: true,
      maxVotesPerUser: 1,
      showResults: 'AFTER_VOTING',
      showLiveCount: true,
      status: 'ACTIVE',
      publishedAt: now,
      options: {
        create: [
          {
            optionText: 'Elektromos buszok bevezetése',
            description: 'Környezetbarát elektromos buszflotta kiépítése a kerület közösségi közlekedésében',
            sortOrder: 0,
          },
          {
            optionText: 'Kerékpárutak bővítése',
            description: 'Biztonságos és összefüggő kerékpárút-hálózat kiépítése a kerület egész területén',
            sortOrder: 1,
          },
          {
            optionText: 'Közösségi roller/bicikli rendszerek fejlesztése',
            description: 'Megosztott mikromobilitási szolgáltatások (MOL Bubi, e-roller) állomások bővítése',
            sortOrder: 2,
          },
          {
            optionText: 'Park&Ride parkolók kiépítése',
            description: 'Ingyenes vagy kedvezményes parkolók létesítése a tömegközlekedési végállomások közelében',
            sortOrder: 3,
          },
        ],
      },
    },
    include: {
      options: true,
    },
  });

  // Poll 2: Green Areas and Transport
  const poll2 = await prisma.poll.create({
    data: {
      title: "Zöldterületek és közlekedés kapcsolata",
      description: "Hogyan lehetne jobban integrálni a zöldterületeket és a közlekedést úgy, hogy a városi élhetőség javuljon?",
      category: "Városfejlesztés",
      startDate: startDate,
      endDate: endDate,
      timeLimit: null,
      isPublic: true,
      allowAnonymous: true,
      maxVotesPerUser: 1,
      showResults: 'AFTER_VOTING',
      showLiveCount: true,
      status: 'ACTIVE',
      publishedAt: now,
      options: {
        create: [
          {
            optionText: 'Több fasor és árnyékolt buszmegálló',
            description: 'Zöld infrastruktúra fejlesztése a tömegközlekedési megállóhelyeken és útvonalon',
            sortOrder: 0,
          },
          {
            optionText: 'Autómentes övezetek bővítése',
            description: 'Sétálóutcák és autómentes zónák kialakítása több zöldfelülettel',
            sortOrder: 1,
          },
          {
            optionText: 'Biciklitárolók a parkok közelében',
            description: 'Biztonságos kerékpártárolók telepítése minden park és zöldterület bejáratánál',
            sortOrder: 2,
          },
          {
            optionText: 'Városi kertprojektek közlekedési csomópontoknál',
            description: 'Közösségi kertek és növénytermesztési lehetőségek a főbb közlekedési csomópontok körül',
            sortOrder: 3,
          },
        ],
      },
    },
    include: {
      options: true,
    },
  });

  // Poll 3: Digital Services
  const poll3 = await prisma.poll.create({
    data: {
      title: "Digitális szolgáltatások a közösségi közlekedésben",
      description: "Mely digitális megoldások segítenék leginkább a lakosság tájékozódását és utazási élményét?",
      category: "Digitalizáció",
      startDate: startDate,
      endDate: endDate,
      timeLimit: null,
      isPublic: true,
      allowAnonymous: true,
      maxVotesPerUser: 1,
      showResults: 'AFTER_VOTING',
      showLiveCount: true,
      status: 'ACTIVE',
      publishedAt: now,
      options: {
        create: [
          {
            optionText: 'Valós idejű menetrend-app',
            description: 'Mobilalkalmazás, amely valós időben mutatja a járatok érkezési idejét és esetleges késéseket',
            sortOrder: 0,
          },
          {
            optionText: 'Integrált jegy- és bérletkezelő applikáció',
            description: 'Egységes digitális platform minden közlekedési eszköz jegyének és bérletének kezelésére',
            sortOrder: 1,
          },
          {
            optionText: 'Mobilos utazástervező',
            description: 'Intelligens útvonaltervező több közlekedési mód kombinációjával (multimodális)',
            sortOrder: 2,
          },
          {
            optionText: 'Panasz- és javaslatkezelő digitális felület',
            description: 'Online platform, ahol a lakosság visszajelzéseket adhat a közlekedési szolgáltatásokról',
            sortOrder: 3,
          },
        ],
      },
    },
    include: {
      options: true,
    },
  });

  console.log('Successfully created 3 transport polls:');
  console.log(`1. ${poll1.title} (ID: ${poll1.id})`);
  console.log(`   - ${poll1.options.length} options`);
  console.log(`   - Active until: ${poll1.endDate?.toLocaleDateString('hu-HU')}`);
  
  console.log(`2. ${poll2.title} (ID: ${poll2.id})`);
  console.log(`   - ${poll2.options.length} options`);
  console.log(`   - Active until: ${poll2.endDate?.toLocaleDateString('hu-HU')}`);
  
  console.log(`3. ${poll3.title} (ID: ${poll3.id})`);
  console.log(`   - ${poll3.options.length} options`);
  console.log(`   - Active until: ${poll3.endDate?.toLocaleDateString('hu-HU')}`);

  console.log('\n✅ All polls are now active and visible on /szavazasok');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
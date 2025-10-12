import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Teszt adatok létrehozása...\n');

  // Először ellenőrizzük/létrehozzuk a kategóriákat
  console.log('📁 Kategóriák ellenőrzése...');

  let petitionCategory = await prisma.petitionCategory.findFirst({
    where: { name: 'Környezetvédelem' }
  });

  if (!petitionCategory) {
    petitionCategory = await prisma.petitionCategory.create({
      data: {
        name: 'Környezetvédelem',
        description: 'Környezetvédelmi petíciók',
        color: '#10b981',
        isActive: true,
        sortOrder: 1
      }
    });
  }

  // 1. TESZT PETÍCIÓ
  console.log('📝 Teszt petíció létrehozása...');
  const petition = await prisma.petition.create({
    data: {
      title: 'TESZT - Zöld Energiára Való Áttérés Budapest V. Kerületében',
      description: 'Budapest V. kerületének sürgősen át kell térnie megújuló energiaforrásokra. Ez egy teszt petíció, amit szabadon aláírhatsz.',
      fullText: `
        <h2>Miért fontos ez a petíció?</h2>
        <p>Budapest V. kerületének sürgősen át kell térnie megújuló energiaforrásokra. Ez egy teszt petíció, amit szabadon aláírhatsz.</p>

        <h3>Céljaink:</h3>
        <ul>
          <li>100% megújuló energia 2030-ra</li>
          <li>Napelem panelek minden közintézményen</li>
          <li>Elektromos autók támogatása</li>
          <li>Zöld területek növelése</li>
        </ul>

        <h3>Mit várunk el?</h3>
        <p>A kerületi önkormányzattól várjuk, hogy:</p>
        <ol>
          <li>Készítsen részletes tervet a zöld átállásra</li>
          <li>Biztosítson költségvetést a napelem telepítésekre</li>
          <li>Hozzon létre ösztönzőket a lakók számára</li>
        </ol>
      `,
      categoryId: petitionCategory.id,
      targetGoal: 1000,
      participationType: 'HYBRID',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 nap múlva
      status: 'ACTIVE',
      isPublic: true,
      isActive: true,
      publishedAt: new Date()
    }
  });
  console.log(`✅ Petíció létrehozva: ${petition.title} (ID: ${petition.id})\n`);

  // 2. TESZT SZAVAZÁS (POLL)
  console.log('🗳️  Teszt szavazás létrehozása...');
  const poll = await prisma.poll.create({
    data: {
      title: 'TESZT - Melyik közlekedési fejlesztés a legfontosabb?',
      description: 'Szavazz a kerület következő közlekedési projektjére! Ez egy példa szavazás.',
      category: 'Közlekedés',
      participationType: 'HYBRID',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 nap múlva
      status: 'ACTIVE',
      isPublic: true,
      allowAnonymous: true,
      maxVotesPerUser: 1,
      showResults: 'AFTER_VOTING',
      showLiveCount: true,
      options: {
        create: [
          {
            optionText: 'Kerékpárutak bővítése',
            description: 'Új kerékpársávok kiépítése a főutcákon',
            sortOrder: 0
          },
          {
            optionText: 'Elektromos buszok beszerzése',
            description: 'A kerület buszvonalait elektromos járművekkel lecserélni',
            sortOrder: 1
          },
          {
            optionText: 'Parkolóhelyek növelése',
            description: 'Mélygarázsok építése a lakónegyedekben',
            sortOrder: 2
          },
          {
            optionText: 'Gyalogos zónák kiterjesztése',
            description: 'További utcák lezárása az autók elől',
            sortOrder: 3
          }
        ]
      }
    }
  });
  console.log(`✅ Szavazás létrehozva: ${poll.title} (ID: ${poll.id})\n`);

  // 4. TESZT ESEMÉNY
  console.log('📅 Teszt esemény létrehozása...');

  const eventStartDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  eventStartDate.setHours(9, 0, 0, 0); // 9:00 AM

  const eventEndDate = new Date(eventStartDate);
  eventEndDate.setHours(13, 0, 0, 0); // 13:00 (1:00 PM)

  const event = await prisma.event.create({
    data: {
      title: 'TESZT - Közösségi Takarítás a Dunakorzón',
      description: `
        <h2>Csatlakozz hozzánk!</h2>
        <p>Segíts megtisztítani a Dunakorzót! Ez egy teszt esemény, amit szabadon regisztrálhatsz.</p>

        <h3>Program:</h3>
        <ul>
          <li><strong>9:00</strong> - Gyülekező a Lánchíd budai hídfőjénél</li>
          <li><strong>9:30-12:00</strong> - Közös takarítás</li>
          <li><strong>12:00-13:00</strong> - Közös ebéd (biztosítjuk)</li>
        </ul>

        <h3>Mit hozz magaddal?</h3>
        <ul>
          <li>Kényelmes ruházat</li>
          <li>Kesztyű (ha van)</li>
          <li>Ivóvíz</li>
        </ul>

        <p><strong>A szemétgyűjtő zsákokat és szerszámokat mi biztosítjuk!</strong></p>
      `,
      location: 'Dunakorzó, Budapest V. kerület',
      startDate: eventStartDate,
      endDate: eventEndDate,
      maxAttendees: 50,
      status: 'UPCOMING'
    }
  });
  console.log(`✅ Esemény létrehozva: ${event.title} (ID: ${event.id})\n`);

  console.log('\n🎉 MINDEN TESZT ADAT SIKERESEN LÉTREHOZVA!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 ÖSSZEFOGLALÓ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📝 Petíció ID:  ${petition.id}`);
  console.log(`   Cím: ${petition.title}`);
  console.log(`   Aláírás cél: ${petition.targetGoal}`);
  console.log(`   URL: /peticiok/${petition.id}\n`);

  console.log(`🗳️  Szavazás ID: ${poll.id}`);
  console.log(`   Cím: ${poll.title}`);
  console.log(`   Opciók: 4 db`);
  console.log(`   URL: /szavazasok/${poll.id}\n`);

  console.log(`📅 Esemény ID:  ${event.id}`);
  console.log(`   Cím: ${event.title}`);
  console.log(`   Dátum: ${event.startDate.toLocaleDateString('hu-HU')}`);
  console.log(`   URL: /esemenyek\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 PRODUCTION TESZTELÉS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📝 Petíció:`);
  console.log(`   https://lovas-political-site-ten.vercel.app/peticiok/${petition.id}\n`);
  console.log(`🗳️  Szavazás:`);
  console.log(`   https://lovas-political-site-ten.vercel.app/szavazasok/${poll.id}\n`);
  console.log(`📅 Esemény:`);
  console.log(`   https://lovas-political-site-ten.vercel.app/esemenyek\n`);
}

main()
  .catch((e) => {
    console.error('❌ Hiba történt:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

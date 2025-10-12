import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const quizzes = [
  {
    "title": "EU a Zsebedben - Mindennapi Előnyök",
    "description": "Tudtad, hogy naponta profitálsz az EU tagságból? Teszteld tudásod a roaming szabályozástól az élelmiszer-biztonságig!",
    "category": "Általános",
    "difficulty": "EASY",
    "timeLimit": 15,
    "maxAttempts": 3,
    "isPublic": true,
    "showResults": true,
    "status": "PUBLISHED",
    "questions": [
      {
        "question": "Mennyit spóroltunk az EU roaming szabályozásával az első 6 hónapban 2017-ben?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 1,
        "explanation": "Az Európai Bizottság jelentése szerint a fogyasztók 2 milliárd eurót spóroltak az első hat hónapban a 'Roam Like at Home' bevezetése után. Forrás: European Commission (2025), Report on the review of the roaming market.",
        "options": [
          {"text": "500 millió euró", "isCorrect": false, "order": 1},
          {"text": "1 milliárd euró", "isCorrect": false, "order": 2},
          {"text": "2 milliárd euró", "isCorrect": true, "order": 3},
          {"text": "5 milliárd euró", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hányszor nőtt a mobil adathasználat külföldön 2017 és 2024 között?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 2,
        "explanation": "A mobil adatfogyasztás külföldön 48-szorosára nőtt 2017 Q3 és 2024 Q3 között az EU roaming szabályok eredményeként. Forrás: European Commission (2025), Roaming Market Review.",
        "options": [
          {"text": "10-szeresére", "isCorrect": false, "order": 1},
          {"text": "25-szöröséré", "isCorrect": false, "order": 2},
          {"text": "48-szorosára", "isCorrect": true, "order": 3},
          {"text": "100-szorosára", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány ember részesült a roaming szabályok előnyeiből 2017 júniusa óta?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 3,
        "explanation": "170 millió európai állampolgár használta a pótdíjmentes roaming szolgáltatást 2017 júniusa óta. Forrás: European Commission (2025), SWD(2025) 164 final.",
        "options": [
          {"text": "50 millió", "isCorrect": false, "order": 1},
          {"text": "100 millió", "isCorrect": false, "order": 2},
          {"text": "170 millió", "isCorrect": true, "order": 3},
          {"text": "250 millió", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Mennyibe kerülne a Schengen határokon belüli ellenőrzések újbóli bevezetése évente?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 4,
        "explanation": "Az Európai Parlament tanulmánya szerint a határellenőrzések újraindítása évente 5-18 milliárd euróba, 10 év alatt 100-230 milliárd euróba kerülne. Forrás: Karakas, C. (2016), EPRS PE 579.074.",
        "options": [
          {"text": "1-3 milliárd euró", "isCorrect": false, "order": 1},
          {"text": "5-18 milliárd euró", "isCorrect": true, "order": 2},
          {"text": "20-30 milliárd euró", "isCorrect": false, "order": 3},
          {"text": "50-100 milliárd euró", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány napod van online vásárlás után meggondolni magad és visszaküldeni a terméket?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 5,
        "explanation": "Az EU Fogyasztói Jogok Irányelve (2011/83/EU) 14 napos elállási jogot biztosít minden online és távolsági vásárlásra, indoklás nélkül. Forrás: Directive 2011/83/EU on consumer rights.",
        "options": [
          {"text": "7 nap", "isCorrect": false, "order": 1},
          {"text": "14 nap", "isCorrect": true, "order": 2},
          {"text": "21 nap", "isCorrect": false, "order": 3},
          {"text": "30 nap", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Minimum hány év garancia jár minden EU-ban vásárolt termékre?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 6,
        "explanation": "Az EU jogszabályok minimum 2 év jótállást írnak elő minden árura, amit az EU-ban vásárolsz. Forrás: Directive (EU) 2019/771 on sale of goods.",
        "options": [
          {"text": "6 hónap", "isCorrect": false, "order": 1},
          {"text": "1 év", "isCorrect": false, "order": 2},
          {"text": "2 év", "isCorrect": true, "order": 3},
          {"text": "3 év", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Mi az EU élelmiszer-biztonsági politikájának alapelve?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 7,
        "explanation": "Az EU az óvatosság elvét ('precautionary principle') alkalmazza: ha a biztonság nem egyértelmű, a terméket betiltják, amíg be nem bizonyítják, hogy biztonságos. Forrás: Regulation (EC) No 178/2002, General Food Law.",
        "options": [
          {"text": "Utólagos ellenőrzés", "isCorrect": false, "order": 1},
          {"text": "Óvatosság elve", "isCorrect": true, "order": 2},
          {"text": "Piaci szabályozás", "isCorrect": false, "order": 3},
          {"text": "Önkéntes megfelelés", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány országot fed le a Safety Gate veszélyes termékek riasztási rendszere?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 8,
        "explanation": "A Safety Gate rendszer 31 országot foglal magában: mind a 27 EU tagállamot, plusz Norvégiát, Izlandot és Liechtensteint. Forrás: European Commission, General Product Safety Regulation (2023).",
        "options": [
          {"text": "27 ország", "isCorrect": false, "order": 1},
          {"text": "31 ország", "isCorrect": true, "order": 2},
          {"text": "35 ország", "isCorrect": false, "order": 3},
          {"text": "40 ország", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány európai fogyasztó úgy érzi, hogy tiszteletben tartják a jogait?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 9,
        "explanation": "Az Európai Bizottság felmérése szerint a fogyasztók 70%-a érzi úgy, hogy a kereskedők tiszteletben tartják jogaikat. Forrás: European Commission (2024), Consumer Protection Policy Key Data.",
        "options": [
          {"text": "45%", "isCorrect": false, "order": 1},
          {"text": "55%", "isCorrect": false, "order": 2},
          {"text": "70%", "isCorrect": true, "order": 3},
          {"text": "85%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hányan érintkeznek naponta a Schengen belső határaival?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 10,
        "explanation": "Naponta 3,5 millió ember lép át Schengen belső határokat anélkül, hogy útlevelet kellene felmutatnia. Forrás: Council of the European Union (2025), The Schengen area explained.",
        "options": [
          {"text": "500 ezer", "isCorrect": false, "order": 1},
          {"text": "1,5 millió", "isCorrect": false, "order": 2},
          {"text": "3,5 millió", "isCorrect": true, "order": 3},
          {"text": "7 millió", "isCorrect": false, "order": 4}
        ]
      }
    ]
  },
  {
    "title": "Schengen Szabadság Teszt",
    "description": "A határok nélküli Európa csodája! Ismerd meg a Schengen övezet gazdasági és társadalmi hatásait.",
    "category": "Politika",
    "difficulty": "EASY",
    "timeLimit": 15,
    "maxAttempts": 3,
    "isPublic": true,
    "showResults": true,
    "status": "PUBLISHED",
    "questions": [
      {
        "question": "Hány országot foglal magában jelenleg a Schengen övezet?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 1,
        "explanation": "29 ország: 27 EU tagállam plusz Izland, Liechtenstein, Norvégia és Svájc. Bulgária és Románia 2025. január 1-től légúton és tengeri úton is csatlakozott. Forrás: Council of the European Union (2025).",
        "options": [
          {"text": "22 ország", "isCorrect": false, "order": 1},
          {"text": "27 ország", "isCorrect": false, "order": 2},
          {"text": "29 ország", "isCorrect": true, "order": 3},
          {"text": "35 ország", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány százalékkal növelte a Schengen a tagállamok közötti kereskedelmet?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 2,
        "explanation": "Tudományos tanulmányok szerint a Schengen megállapodás átlagosan 2,81-3%-kal növelte a kétoldalú kereskedelmet a tagországok között. Forrás: Davis & Gift (2014), The World Economy.",
        "options": [
          {"text": "0,5-1%", "isCorrect": false, "order": 1},
          {"text": "2,81-3%", "isCorrect": true, "order": 2},
          {"text": "5-7%", "isCorrect": false, "order": 3},
          {"text": "10-15%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány ember utazhat szabadon a Schengen övezetben?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 3,
        "explanation": "Több mint 450 millió ember élvezi a szabad mozgás előnyeit a Schengen övezetben. Forrás: European Commission, Schengen Area information.",
        "options": [
          {"text": "250 millió", "isCorrect": false, "order": 1},
          {"text": "350 millió", "isCorrect": false, "order": 2},
          {"text": "450 millió", "isCorrect": true, "order": 3},
          {"text": "600 millió", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Mennyit veszítene az EU GDP-je a Schengen összeomlása esetén évente?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 4,
        "explanation": "A teljes Schengen összeomlás évi 0,31% GDP csökkenést jelentene, ami körülbelül 39,3 milliárd eurónak felel meg. Forrás: Felbermayr et al. (2018), Journal of Common Market Studies.",
        "options": [
          {"text": "10 milliárd euró", "isCorrect": false, "order": 1},
          {"text": "25 milliárd euró", "isCorrect": false, "order": 2},
          {"text": "39 milliárd euró", "isCorrect": true, "order": 3},
          {"text": "75 milliárd euró", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány millió üzleti utazás történik évente a Schengen területen?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 5,
        "explanation": "Évente körülbelül 24 millió üzleti út és 57 millió határokon átnyúló áruszállítás történik. Forrás: European Parliament (2016), Cost of non-Schengen study.",
        "options": [
          {"text": "10 millió", "isCorrect": false, "order": 1},
          {"text": "24 millió", "isCorrect": true, "order": 2},
          {"text": "40 millió", "isCorrect": false, "order": 3},
          {"text": "60 millió", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Mennyi ideig kellene várni átlagosan a határon, ha visszaállnának az ellenőrzések?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 6,
        "explanation": "A határellenőrzések visszaállítása esetén az átlagos várakozási idő személygépjárművek esetében 13-47 perc lenne. Forrás: European Parliament (2016), IPOL Study.",
        "options": [
          {"text": "5-10 perc", "isCorrect": false, "order": 1},
          {"text": "13-47 perc", "isCorrect": true, "order": 2},
          {"text": "60-90 perc", "isCorrect": false, "order": 3},
          {"text": "120 perc", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Mennyi a közúton szállított áruk értéke évente a Schengen határokon át?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 7,
        "explanation": "A Schengen határokon keresztül közúton szállított áruk értéke évente eléri a 2,8 billió eurót. Forrás: European Parliament Study (2016).",
        "options": [
          {"text": "500 milliárd euró", "isCorrect": false, "order": 1},
          {"text": "1,2 billió euró", "isCorrect": false, "order": 2},
          {"text": "2,8 billió euró", "isCorrect": true, "order": 3},
          {"text": "5 billió euró", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány ember dolgozik másik Schengen országban, mint ahol él?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 8,
        "explanation": "Közel 1,7 millió ember dolgozik másik Schengen országban (határokon átnyúló munkavállalók). Forrás: European Commission, Schengen Area statistics.",
        "options": [
          {"text": "500 ezer", "isCorrect": false, "order": 1},
          {"text": "1,7 millió", "isCorrect": true, "order": 2},
          {"text": "3 millió", "isCorrect": false, "order": 3},
          {"text": "5 millió", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány milliárd eurót veszítene a turizmus évente határellenőrzések esetén?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 9,
        "explanation": "A turisztikai ágazat évente 10-20 milliárd eurót veszítene, ha visszaállnának a határellenőrzések. Forrás: European Parliament (2016), PE 578.974.",
        "options": [
          {"text": "2-5 milliárd euró", "isCorrect": false, "order": 1},
          {"text": "10-20 milliárd euró", "isCorrect": true, "order": 2},
          {"text": "30-40 milliárd euró", "isCorrect": false, "order": 3},
          {"text": "50-60 milliárd euró", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány út történik a Schengen területen belül évente?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 10,
        "explanation": "Az európaiak évente több mint 1,25 milliárd utazást tesznek a Schengen területen belül. Forrás: Council of the European Union (2025).",
        "options": [
          {"text": "500 millió", "isCorrect": false, "order": 1},
          {"text": "900 millió", "isCorrect": false, "order": 2},
          {"text": "1,25 milliárd", "isCorrect": true, "order": 3},
          {"text": "2 milliárd", "isCorrect": false, "order": 4}
        ]
      }
    ]
  }
];

async function main() {
  console.log('🚀 Starting quiz import...\n');

  for (const quizData of quizzes) {
    const { questions, ...quizInfo } = quizData as any;

    console.log(`📝 Creating quiz: ${quizInfo.title}`);

    const quiz = await prisma.quiz.create({
      data: {
        ...quizInfo,
        publishedAt: new Date(),
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            questionType: q.type,
            points: q.points,
            sortOrder: q.order,
            explanation: q.explanation,
            options: {
              create: q.options.map((opt: any) => ({
                optionText: opt.text,
                isCorrect: opt.isCorrect,
                sortOrder: opt.order
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    console.log(`✅ Created: ${quiz.title} (${quiz.questions.length} questions)\n`);
  }

  console.log('🎉 Import complete! Created 2 quizzes.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

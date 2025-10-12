import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Remaining 6 quizzes from the user's artifact
const quizzes = [
  {
    "title": "EU Fogyasztóvédelem: Jogaid Ismerete",
    "description": "Tudod, milyen jogaid vannak online vásárláskor? Az EU a világ legerősebb fogyasztóvédelmi rendszerével rendelkezik!",
    "category": "Jog",
    "difficulty": "MEDIUM",
    "timeLimit": 20,
    "maxAttempts": 2,
    "isPublic": true,
    "showResults": true,
    "status": "PUBLISHED",
    "questions": [
      {
        "question": "Mennyi időd van meggondolni magad online vásárlás után az EU-ban?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 1,
        "explanation": "Az EU Fogyasztói Jogok Irányelve (2011/83/EU) kötelezően 14 napos elállási jogot biztosít minden online és távolsági vásárlásra. Forrás: Directive 2011/83/EU.",
        "options": [
          {"text": "7 nap", "isCorrect": false, "order": 1},
          {"text": "14 nap", "isCorrect": true, "order": 2},
          {"text": "21 nap", "isCorrect": false, "order": 3},
          {"text": "30 nap", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Meddig hosszabbodik meg az elállási jog, ha a kereskedő nem tájékoztat róla?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 2,
        "explanation": "Ha a kereskedő nem tájékoztat az elállási jogról, az automatikusan 1 évre (12 hónapra) hosszabbodik meg. Forrás: Directive 2011/83/EU, Article 10.",
        "options": [
          {"text": "30 napra", "isCorrect": false, "order": 1},
          {"text": "3 hónapra", "isCorrect": false, "order": 2},
          {"text": "6 hónapra", "isCorrect": false, "order": 3},
          {"text": "1 évre", "isCorrect": true, "order": 4}
        ]
      },
      {
        "question": "Minimum hány év jótállás jár minden EU-ban vásárolt termékre?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 3,
        "explanation": "Az EU jogszabályok minimum 2 év jótállást írnak elő minden árura. A garancia alatt javított termékekre további 1 év jár. Forrás: Directive (EU) 2019/771.",
        "options": [
          {"text": "6 hónap", "isCorrect": false, "order": 1},
          {"text": "1 év", "isCorrect": false, "order": 2},
          {"text": "2 év", "isCorrect": true, "order": 3},
          {"text": "5 év", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány napon belül kell visszatérítenie a vásárlási árat a kereskedőnek elállás esetén?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 4,
        "explanation": "A kereskedő 14 napon belül köteles visszatéríteni a teljes vásárlási árat, miután megkapta az elállási nyilatkozatot. Forrás: Directive 2011/83/EU.",
        "options": [
          {"text": "7 napon belül", "isCorrect": false, "order": 1},
          {"text": "14 napon belül", "isCorrect": true, "order": 2},
          {"text": "21 napon belül", "isCorrect": false, "order": 3},
          {"text": "30 napon belül", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány hónapon belül feltételezik, hogy a hiba már a vásárláskor fennállt?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 5,
        "explanation": "Az első 1 évben (egyes országokban 2 évben) a hibát úgy tekintik, hogy az már a vásárláskor is fennállt, a bizonyítás terhe a kereskedőé. Forrás: Directive (EU) 2019/771.",
        "options": [
          {"text": "3 hónap", "isCorrect": false, "order": 1},
          {"text": "6 hónap", "isCorrect": false, "order": 2},
          {"text": "1 év", "isCorrect": true, "order": 3},
          {"text": "2 év", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Az online kereskedők hány százaléka nem tartja be az EU fogyasztóvédelmi szabályokat?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 6,
        "explanation": "2025-ös felmérés szerint a használt termékeket árusító online kereskedők több mint fele (50%+) nem felel meg az EU fogyasztóvédelmi szabályoknak. Forrás: European Commission (2025), Consumer protection sweep.",
        "options": [
          {"text": "25%", "isCorrect": false, "order": 1},
          {"text": "35%", "isCorrect": false, "order": 2},
          {"text": "50%+", "isCorrect": true, "order": 3},
          {"text": "70%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Mennyit veszítenek évente a fogyasztók az online jogaik megsértése miatt az EU-ban?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 7,
        "explanation": "A fogyasztók évente körülbelül 770 millió euró kárt szenvednek az online jogaik megsértése miatt. Forrás: European Commission (2024), Consumer reports.",
        "options": [
          {"text": "200 millió euró", "isCorrect": false, "order": 1},
          {"text": "500 millió euró", "isCorrect": false, "order": 2},
          {"text": "770 millió euró", "isCorrect": true, "order": 3},
          {"text": "1,5 milliárd euró", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "A fogyasztók hány százaléka aggódik a személyes adatok engedély nélküli gyűjtése miatt?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 8,
        "explanation": "A fogyasztók 71%-a aggódik a személyes adatok beleegyezés nélküli gyűjtése miatt az online vásárlások során. Forrás: European Commission (2024).",
        "options": [
          {"text": "45%", "isCorrect": false, "order": 1},
          {"text": "58%", "isCorrect": false, "order": 2},
          {"text": "71%", "isCorrect": true, "order": 3},
          {"text": "85%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány százaléka az EU állampolgároknak vásárolt már határon átnyúlóan az EU-n belül?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 9,
        "explanation": "2020-ban az EU állampolgárok 31%-a vásárolt másik EU országból online. Ez a szám folyamatosan növekszik. Forrás: Eurostat (2020).",
        "options": [
          {"text": "15%", "isCorrect": false, "order": 1},
          {"text": "25%", "isCorrect": false, "order": 2},
          {"text": "31%", "isCorrect": true, "order": 3},
          {"text": "48%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Mekkora értéket ért el a határokon átnyúló online kereskedelem 2021-ben az EU-ban?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 10,
        "explanation": "Az EU határokon átnyúló online piaca 2021-ben elérte a 171 milliárd eurót, 17%-os éves növekedéssel. Forrás: CBCommerce Europe (2022).",
        "options": [
          {"text": "85 milliárd euró", "isCorrect": false, "order": 1},
          {"text": "125 milliárd euró", "isCorrect": false, "order": 2},
          {"text": "171 milliárd euró", "isCorrect": true, "order": 3},
          {"text": "250 milliárd euró", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "A határokon átnyúló fogyasztói panaszok hány százaléka kapcsolódik e-kereskedelemhez?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 11,
        "explanation": "A határokon átnyúló fogyasztói panaszok közel 70%-a az online kereskedelemmel kapcsolatos. Forrás: European Consumer Centre Network.",
        "options": [
          {"text": "40%", "isCorrect": false, "order": 1},
          {"text": "55%", "isCorrect": false, "order": 2},
          {"text": "70%", "isCorrect": true, "order": 3},
          {"text": "85%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Milyen hatást gyakorolt az EU fogyasztóvédelmi irányelv a fogyasztói bizalomra?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 12,
        "explanation": "Tudományos tanulmány kimutatta, hogy az Unfair Commercial Practices Directive jelentős pozitív hatást gyakorolt a fogyasztói bizalomra és a határokon átnyúló vásárlásokra. Forrás: Roesch et al. (2020), Information Economics and Policy.",
        "options": [
          {"text": "Negatív hatás", "isCorrect": false, "order": 1},
          {"text": "Semleges hatás", "isCorrect": false, "order": 2},
          {"text": "Pozitív hatás", "isCorrect": true, "order": 3},
          {"text": "Vegyes hatás", "isCorrect": false, "order": 4}
        ]
      }
    ]
  },
  {
    "title": "Kohéziós Politika - Ki Profitál?",
    "description": "Az EU legnagyobb költségvetési tétele! Fedezd fel, hogyan javítja a kohéziós politika régiók életét utak, iskolák, kórházak építésével.",
    "category": "Gazdaság",
    "difficulty": "MEDIUM",
    "timeLimit": 20,
    "maxAttempts": 2,
    "isPublic": true,
    "showResults": true,
    "status": "PUBLISHED",
    "questions": [
      {
        "question": "Mennyit hoz vissza GDP-ben minden 1 euró, amit kohéziós politikára költünk 2030-ra?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 1,
        "explanation": "Az EU Joint Research Centre 2024-es tanulmánya szerint minden 1 euró befektetés 1,3 euró GDP-t generál 2030-ra, és közel 3 eurót 2043-ra. Forrás: JRC (2024), RHOMOLO assessment.",
        "options": [
          {"text": "0,8 euró", "isCorrect": false, "order": 1},
          {"text": "1,0 euró", "isCorrect": false, "order": 2},
          {"text": "1,3 euró", "isCorrect": true, "order": 3},
          {"text": "2,0 euró", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Mennyi a kohéziós politika költségvetése 2021-2027 között?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 2,
        "explanation": "A 2021-2027-es időszakra 376 milliárd eurót különítettek el kohéziós politikára. A 2014-2020 időszak 356 milliárd volt (+49 milliárd REACT-EU). Forrás: European Commission (2023).",
        "options": [
          {"text": "200 milliárd euró", "isCorrect": false, "order": 1},
          {"text": "300 milliárd euró", "isCorrect": false, "order": 2},
          {"text": "376 milliárd euró", "isCorrect": true, "order": 3},
          {"text": "500 milliárd euró", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "A kohéziós politika az összes kormányzati beruházás hány százalékát jelenti az EU-ban?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 3,
        "explanation": "A kohéziós politika az összes kormányzati beruházás 13%-át jelenti EU szinten, míg a kevésbé fejlett tagállamokban ez 51%-ot tesz ki. Forrás: European Commission (2023).",
        "options": [
          {"text": "5%", "isCorrect": false, "order": 1},
          {"text": "10%", "isCorrect": false, "order": 2},
          {"text": "13%", "isCorrect": true, "order": 3},
          {"text": "20%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány km TEN-T vasútvonal épül, fejlesztik vagy korszerűsítik a kohéziós alapokból?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 4,
        "explanation": "3 900 km TEN-T vasútvonalat építenek, fejlesztenek vagy korszerűsítenek a 2021-2027-es kohéziós forrásokból. Forrás: European Commission (2023).",
        "options": [
          {"text": "1 500 km", "isCorrect": false, "order": 1},
          {"text": "2 500 km", "isCorrect": false, "order": 2},
          {"text": "3 900 km", "isCorrect": true, "order": 3},
          {"text": "5 000 km", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány otthon kap nagy sebességű internet hozzáférést a kohéziós forrásokból?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 5,
        "explanation": "3,1 millió háztartás kap nagy sebességű digitális infrastruktúra hozzáférést a kohéziós politika keretében. Forrás: European Commission (2023).",
        "options": [
          {"text": "1 millió", "isCorrect": false, "order": 1},
          {"text": "2 millió", "isCorrect": false, "order": 2},
          {"text": "3,1 millió", "isCorrect": true, "order": 3},
          {"text": "5 millió", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány kutatónak javulnak a munkakörülményei a kohéziós befektetések által?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 6,
        "explanation": "83 000 kutató kap hozzáférést javított kutatási létesítményekhez a kohéziós politika révén. Forrás: European Commission (2023).",
        "options": [
          {"text": "25 000", "isCorrect": false, "order": 1},
          {"text": "50 000", "isCorrect": false, "order": 2},
          {"text": "83 000", "isCorrect": true, "order": 3},
          {"text": "120 000", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány vállalatot támogatnak az intelligens növekedési kezdeményezésekben?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 7,
        "explanation": "725 000 vállalatot támogatnak intelligens növekedési (smart growth) kezdeményezésekben a 2021-2027-es időszakban. Forrás: European Commission (2023).",
        "options": [
          {"text": "250 000", "isCorrect": false, "order": 1},
          {"text": "500 000", "isCorrect": false, "order": 2},
          {"text": "725 000", "isCorrect": true, "order": 3},
          {"text": "1 000 000", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány munkanélküli kap támogatást a kohéziós politika keretében?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 8,
        "explanation": "6,5 millió munkanélküli ember kap támogatást (képzés, elhelyezkedési segítség) a kohéziós politika révén. Forrás: European Commission (2023).",
        "options": [
          {"text": "2 millió", "isCorrect": false, "order": 1},
          {"text": "4 millió", "isCorrect": false, "order": 2},
          {"text": "6,5 millió", "isCorrect": true, "order": 3},
          {"text": "10 millió", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány százalékkal nő a GDP egy régióban az Objective 1 programban való részvétel miatt?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 9,
        "explanation": "Az Objective 1 programban való részvétel 1,6 százalékponttal növeli a GDP/fő növekedését. Forrás: Becker et al. (2010), Journal of Public Economics.",
        "options": [
          {"text": "0,5%", "isCorrect": false, "order": 1},
          {"text": "1,0%", "isCorrect": false, "order": 2},
          {"text": "1,6%", "isCorrect": true, "order": 3},
          {"text": "3,0%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Mennyivel csökkentik a kohéziós beruházások a regionális GDP különbségeket 2030-ra?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 10,
        "explanation": "A regionális GDP/fő különbségek körülbelül 3%-kal csökkennek 2030-ra a kohéziós politikai beavatkozások eredményeként. Forrás: JRC (2024).",
        "options": [
          {"text": "1%", "isCorrect": false, "order": 1},
          {"text": "3%", "isCorrect": true, "order": 2},
          {"text": "5%", "isCorrect": false, "order": 3},
          {"text": "10%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "A zöld munkahelyek hány százalékát teszik ki a foglalkoztatásnak a fejlett régiókban?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 11,
        "explanation": "A zöld munkahelyek a fejlettebb régiókban a foglalkoztatás 25%-át teszik ki, míg a kevésbé fejlett régiókban csak 7%-át. Forrás: European Commission (2020), Convergence study.",
        "options": [
          {"text": "10%", "isCorrect": false, "order": 1},
          {"text": "15%", "isCorrect": false, "order": 2},
          {"text": "25%", "isCorrect": true, "order": 3},
          {"text": "35%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "A vidéki területek hány százalékát állítják elő a megújuló energiából származó villamosenergiának?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 12,
        "explanation": "A vidéki területek a megújuló technológiákból származó villamosenergia 72%-át termelik. Forrás: European Commission (2020).",
        "options": [
          {"text": "45%", "isCorrect": false, "order": 1},
          {"text": "58%", "isCorrect": false, "order": 2},
          {"text": "72%", "isCorrect": true, "order": 3},
          {"text": "85%", "isCorrect": false, "order": 4}
        ]
      }
    ]
  }
];

async function main() {
  console.log('🚀 Starting import of remaining EU quizzes...\n');

  let imported = 0;
  let skipped = 0;

  for (const quizData of quizzes) {
    const { questions, ...quizInfo } = quizData as any;

    // Check if quiz already exists
    const existing = await prisma.quiz.findFirst({
      where: { title: quizInfo.title }
    });

    if (existing) {
      console.log(`⏭️  Skipping: ${quizInfo.title} (already exists)\n`);
      skipped++;
      continue;
    }

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
    imported++;
  }

  console.log(`\n🎉 Import complete! Imported: ${imported}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

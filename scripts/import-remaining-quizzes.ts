import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const quizzes = [
  {
    "title": "Erasmus+ Kvíz: Tanulj, Dolgozz, Utazz!",
    "description": "Az Erasmus+ program megváltoztatta milliók életét! Teszteld tudásod Európa legsikeresebb oktatási mobilitási programjáról.",
    "category": "Általános",
    "difficulty": "MEDIUM",
    "timeLimit": 20,
    "maxAttempts": 2,
    "isPublic": true,
    "showResults": true,
    "status": "PUBLISHED",
    "questions": [
      {
        "question": "Hány százalékkal kisebb a hosszú távú munkanélküliség veszélye Erasmus hallgatóknál?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 1,
        "explanation": "Az Erasmus Impact Study szerint az Erasmus diákok 50%-kal kisebb eséllyel lesznek hosszú távon munkanélküliek. Forrás: Brandenburg et al. (2014), Publications Office of the EU.",
        "options": [
          {"text": "25%", "isCorrect": false, "order": 1},
          {"text": "35%", "isCorrect": false, "order": 2},
          {"text": "50%", "isCorrect": true, "order": 3},
          {"text": "65%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Milyen arányban alacsonyabb az Erasmus ösztöndíjasok munkanélküliségi rátája 5 évvel a végzés után?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 2,
        "explanation": "Öt évvel a diploma megszerzése után az Erasmus résztvevők munkanélküliségi rátája 23%-kal alacsonyabb (7% vs 9%). Forrás: Brandenburg et al. (2014), Erasmus Impact Study.",
        "options": [
          {"text": "10%", "isCorrect": false, "order": 1},
          {"text": "15%", "isCorrect": false, "order": 2},
          {"text": "23%", "isCorrect": true, "order": 3},
          {"text": "30%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "A munkaadók hány százaléka keres olyan személyiségjegyeket, amelyeket az Erasmus fejleszt?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 3,
        "explanation": "A munkaadók 92%-a olyan tulajdonságokat keres (tolerancia, önbizalom, problémamegoldás), amelyeket az Erasmus tapasztalat jelentősen fejleszt. Forrás: Erasmus Impact Study (2014).",
        "options": [
          {"text": "75%", "isCorrect": false, "order": 1},
          {"text": "82%", "isCorrect": false, "order": 2},
          {"text": "92%", "isCorrect": true, "order": 3},
          {"text": "98%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Az Erasmus gyakornokok hány százaléka kap állásajánlatot a fogadó cégtől?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 4,
        "explanation": "Az Erasmus gyakornokok több mint egyharmada (33%+) állásajánlatot kap attól a vállalattól, ahol gyakorlatot végzett. Forrás: Brandenburg et al. (2014).",
        "options": [
          {"text": "15%", "isCorrect": false, "order": 1},
          {"text": "25%", "isCorrect": false, "order": 2},
          {"text": "33%+", "isCorrect": true, "order": 3},
          {"text": "45%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány százalékkal nőnek az elhelyezkedési képességet növelő személyiségjegyek az Erasmus után?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 5,
        "explanation": "A kulcsfontosságú elhelyezkedési képességet növelő személyiségjegyek átlagosan 42%-kal növekednek az Erasmus tapasztalat után. Forrás: Erasmus Impact Study (2014).",
        "options": [
          {"text": "20%", "isCorrect": false, "order": 1},
          {"text": "30%", "isCorrect": false, "order": 2},
          {"text": "42%", "isCorrect": true, "order": 3},
          {"text": "55%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Milyen arányban több Erasmus hallgató találja meg életpartnerét másik nemzetiségű társban?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 6,
        "explanation": "Az Erasmus résztvevők 33%-ának van más nemzetiségű életpartnere, míg ez a nem mobil diákoknál csak 13% (154%-os növekedés). Forrás: Brandenburg et al. (2014).",
        "options": [
          {"text": "33% vs 13%", "isCorrect": true, "order": 1},
          {"text": "25% vs 10%", "isCorrect": false, "order": 2},
          {"text": "40% vs 20%", "isCorrect": false, "order": 3},
          {"text": "50% vs 25%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány 'Erasmus baba' született a program eredményeként?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 7,
        "explanation": "Az EU Bizottság becslése szerint több mint 1 millió 'Erasmus baba' született olyan párok kapcsolatából, akik az Erasmus program alatt találkoztak. Forrás: European Commission estimates.",
        "options": [
          {"text": "250 ezer", "isCorrect": false, "order": 1},
          {"text": "500 ezer", "isCorrect": false, "order": 2},
          {"text": "1 millió", "isCorrect": true, "order": 3},
          {"text": "2 millió", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Az Erasmus ösztöndíjasok hány százaléka költözik másik országba a végzés után?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 8,
        "explanation": "Az Erasmus résztvevők 40%-a költözik másik országba a diploma megszerzése után, szemben a nem mobil hallgatók 23%-ával. Forrás: Erasmus Impact Study (2014).",
        "options": [
          {"text": "25%", "isCorrect": false, "order": 1},
          {"text": "30%", "isCorrect": false, "order": 2},
          {"text": "40%", "isCorrect": true, "order": 3},
          {"text": "55%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Az Erasmus ösztöndíjasok hány százaléka alapított saját vállalkozást?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 9,
        "explanation": "Minden tizedik Erasmus ösztöndíjas (10%) elindította saját vállalkozását, ami jelentősen magasabb a nem mobil hallgatók arányánál. Forrás: Brandenburg et al. (2014).",
        "options": [
          {"text": "5%", "isCorrect": false, "order": 1},
          {"text": "10%", "isCorrect": true, "order": 2},
          {"text": "15%", "isCorrect": false, "order": 3},
          {"text": "20%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Hány százalékuk talált állást 12 hónapon belül az Erasmus ösztöndíjasoknak?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 10,
        "explanation": "Az Erasmus résztvevők 98%-a talált állást 12 hónapon belül, csak 2%-uknak kellett ennél hosszabb idő, szemben a nem mobil diákok 4%-ával. Forrás: Erasmus Impact Study (2014).",
        "options": [
          {"text": "90%", "isCorrect": false, "order": 1},
          {"text": "94%", "isCorrect": false, "order": 2},
          {"text": "98%", "isCorrect": true, "order": 3},
          {"text": "100%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "Az Erasmus résztvevők hány százaléka fejlesztette elhelyezkedési képességeit?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 11,
        "explanation": "A mobil hallgatók több mint 51%-a jelentősen fejlesztette elhelyezkedési képességeit a külföldi tartózkodás alatt. Forrás: Brandenburg et al. (2014).",
        "options": [
          {"text": "35%", "isCorrect": false, "order": 1},
          {"text": "42%", "isCorrect": false, "order": 2},
          {"text": "51%", "isCorrect": true, "order": 3},
          {"text": "68%", "isCorrect": false, "order": 4}
        ]
      },
      {
        "question": "A munkaadók hány százaléka ad nagyobb felelősséget nemzetközi tapasztalattal rendelkező dolgozóknak?",
        "type": "MULTIPLE_CHOICE",
        "points": 10,
        "order": 12,
        "explanation": "A munkaadók 64%-a nyilatkozta, hogy a nemzetközi tapasztalattal rendelkező munkatársak nagyobb szakmai felelősséget kapnak. Forrás: Erasmus Impact Study (2014).",
        "options": [
          {"text": "45%", "isCorrect": false, "order": 1},
          {"text": "54%", "isCorrect": false, "order": 2},
          {"text": "64%", "isCorrect": true, "order": 3},
          {"text": "78%", "isCorrect": false, "order": 4}
        ]
      }
    ]
  }
];

async function main() {
  console.log('🚀 Starting remaining quizzes import...\n');

  for (const quizData of quizzes) {
    const { questions, ...quizInfo } = quizData as any;

    // Check if quiz already exists
    const existing = await prisma.quiz.findFirst({
      where: { title: quizInfo.title }
    });

    if (existing) {
      console.log(`⏭️  Skipping: ${quizInfo.title} (already exists)\n`);
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
  }

  console.log('🎉 Import complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

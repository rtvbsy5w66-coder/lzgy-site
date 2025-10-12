import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating Rogán Antal quiz...');

  const quiz = await prisma.quiz.create({
    data: {
      title: "Mit mondtak ki a bíróságok Rogán Antal ügyében?",
      description: "5 kérdéses kvíz, amely valós bírósági ítéleteket és sajtóinformációkat különít el, edukatív céllal.",
      category: "Közélet",
      timeLimit: 10,
      maxAttempts: 3,
      isPublic: true,
      showResults: true,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      questions: {
        create: [
          {
            question: 'Milyen típusú ügyben született jogerős ítélet arról, hogy Juhász Péter nyilvánosan "bűnözőnek" nevezhette Rogán Antalt?',
            questionType: 'MULTIPLE_CHOICE',
            explanation: 'A bíróság személyiségi jogi/becsületsértési perben hozott ítéletet, amelyben kimondta, hogy a "bűnöző" kifejezés véleménynyilvánításnak minősül.',
            points: 1,
            required: true,
            sortOrder: 0,
            options: {
              create: [
                {
                  optionText: 'Büntetőper, mert Rogánt bűncselekmény miatt elítélték',
                  isCorrect: false,
                  sortOrder: 0,
                },
                {
                  optionText: 'Személyiségi jogi / becsületsértési per',
                  isCorrect: true,
                  sortOrder: 1,
                },
                {
                  optionText: 'Korrupciós bűncselekmény miatti elmarasztaló ítélet',
                  isCorrect: false,
                  sortOrder: 2,
                },
                {
                  optionText: 'Ingatlanügyekben hozott büntetőbírósági ítélet',
                  isCorrect: false,
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            question: 'Jogerős bírósági ítélet szerint Rogán Antalt elítélték-e bűncselekmény miatt?',
            questionType: 'TRUE_FALSE',
            explanation: 'Rogán Antal ellen nem született jogerős elmarasztaló büntetőbírósági ítélet bűncselekmény miatt.',
            points: 1,
            required: true,
            sortOrder: 1,
            options: {
              create: [
                {
                  optionText: 'Igen',
                  isCorrect: false,
                  sortOrder: 0,
                },
                {
                  optionText: 'Nem',
                  isCorrect: true,
                  sortOrder: 1,
                },
              ],
            },
          },
          {
            question: 'Melyik portál számolt be arról, hogy a bíróság másodfokon is elutasította Rogán keresetét Juhász Péter ellen?',
            questionType: 'MULTIPLE_CHOICE',
            explanation: 'A 24.hu portál számolt be a másodfokú bírósági döntésről.',
            points: 1,
            required: true,
            sortOrder: 2,
            options: {
              create: [
                {
                  optionText: 'Telex',
                  isCorrect: false,
                  sortOrder: 0,
                },
                {
                  optionText: '24.hu',
                  isCorrect: true,
                  sortOrder: 1,
                },
                {
                  optionText: '444',
                  isCorrect: false,
                  sortOrder: 2,
                },
                {
                  optionText: 'HVG',
                  isCorrect: false,
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            question: 'Mit mondott ki a bíróság arról, hogy a "bűnöző" szó Juhász Péter szájából milyen minősítés?',
            questionType: 'MULTIPLE_CHOICE',
            explanation: 'A bíróság kimondta, hogy a "bűnöző" kifejezés politikai vélemény és értékítélet, nem pedig tényállítás.',
            points: 1,
            required: true,
            sortOrder: 3,
            options: {
              create: [
                {
                  optionText: 'Jogilag tényállítás',
                  isCorrect: false,
                  sortOrder: 0,
                },
                {
                  optionText: 'Politikai vélemény, értékítélet',
                  isCorrect: true,
                  sortOrder: 1,
                },
                {
                  optionText: 'Büntetőjogi tényállás bizonyítása',
                  isCorrect: false,
                  sortOrder: 2,
                },
                {
                  optionText: 'Becsületsértés',
                  isCorrect: false,
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            question: 'Milyen ügyek miatt került Rogán Antal neve gyakran a sajtóba az elmúlt években?',
            questionType: 'MULTIPLE_CHOICE',
            explanation: 'Rogán Antal neve főként ingatlanvásárlások és -értékesítések kapcsán került a sajtó figyelmébe.',
            points: 1,
            required: true,
            sortOrder: 4,
            options: {
              create: [
                {
                  optionText: 'Ingatlanvásárlások és -értékesítések',
                  isCorrect: true,
                  sortOrder: 0,
                },
                {
                  optionText: 'Kábítószer-kereskedelem',
                  isCorrect: false,
                  sortOrder: 1,
                },
                {
                  optionText: 'Emberrablás',
                  isCorrect: false,
                  sortOrder: 2,
                },
                {
                  optionText: 'Közbeszerzési bűnszervezet ügye',
                  isCorrect: false,
                  sortOrder: 3,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  console.log('Quiz created successfully:', quiz.title);
  console.log('Quiz ID:', quiz.id);
  console.log('Questions created:', quiz.questions.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
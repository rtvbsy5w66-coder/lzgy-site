import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adatbázis feltöltése...');

  await prisma.poll.upsert({
    where: { id: 'poll-1' },
    update: {},
    create: {
      id: 'poll-1',
      title: 'Milyen témában szeretnél több hírt?',
      status: 'ACTIVE',
      startDate: new Date(),
      options: { create: [
        { optionText: 'Oktatás', sortOrder: 1 },
        { optionText: 'Egészségügy', sortOrder: 2 },
      ]},
    },
  });

  const cat = await prisma.petitionCategory.upsert({
    where: { name: 'Általános' },
    update: {},
    create: { name: 'Általános' },
  });

  await prisma.petition.upsert({
    where: { id: 'pet-1' },
    update: {},
    create: {
      id: 'pet-1',
      title: 'Zöld parkok',
      description: 'Több zöld terület!',
      targetGoal: 1000,
      status: 'ACTIVE',
      startDate: new Date(),
      categoryId: cat.id,
    },
  });

  await prisma.quiz.upsert({
    where: { id: 'quiz-1' },
    update: {},
    create: {
      id: 'quiz-1',
      title: 'Politikai kvíz',
      status: 'PUBLISHED',
      questions: { create: [{
        question: 'Hány évre választják a miniszterelnököt?',
        sortOrder: 1,
        options: { create: [
          { optionText: '4 év', isCorrect: true, sortOrder: 1 },
          { optionText: '5 év', isCorrect: false, sortOrder: 2 },
        ]},
      }]},
    },
  });

  console.log('✅ Adatbázis feltöltve! Poll, Petition, Quiz létrehozva.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

#!/usr/bin/env tsx
/**
 * Production Data Import Script
 *
 * Importálja az éles adatokat a data/ könyvtárból
 *
 * Használat:
 *   npx tsx scripts/import-production-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, '../data');

interface ImportStats {
  categories: number;
  posts: number;
  events: number;
  quizzes: number;
  polls: number;
  partners: number;
  petitions: number;
  errors: string[];
}

const stats: ImportStats = {
  categories: 0,
  posts: 0,
  events: 0,
  quizzes: 0,
  polls: 0,
  partners: 0,
  petitions: 0,
  errors: []
};

async function importNewsCategories() {
  const filePath = path.join(DATA_DIR, 'news-categories.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  news-categories.json nem található, átugorva...');
    return;
  }

  console.log('📁 Hírkategóriák importálása...');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  for (const category of data.categories) {
    try {
      await prisma.newsCategory.create({
        data: {
          name: category.name,
          description: category.description,
          color: category.color,
          isActive: category.isActive ?? true,
          sortOrder: category.sortOrder ?? 0
        }
      });
      stats.categories++;
    } catch (error: any) {
      stats.errors.push(`NewsCategory "${category.name}": ${error.message}`);
    }
  }
  console.log(`✅ ${stats.categories} hírkategória importálva\n`);
}

async function importPosts() {
  const filePath = path.join(DATA_DIR, 'posts.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  posts.json nem található, átugorva...');
    return;
  }

  console.log('📰 Bejegyzések importálása...');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  for (const post of data.posts) {
    try {
      // Find category if specified
      let newsCategoryId = null;
      if (post.categoryName) {
        const category = await prisma.newsCategory.findUnique({
          where: { name: post.categoryName }
        });
        newsCategoryId = category?.id;
      }

      await prisma.post.create({
        data: {
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          status: post.status || 'DRAFT',
          category: post.category,
          newsCategoryId,
          subcategory: post.subcategory,
          imageUrl: post.imageUrl,
          createdAt: post.createdAt ? new Date(post.createdAt) : undefined,
          publishedAt: post.status === 'PUBLISHED' ? new Date() : null
        }
      });
      stats.posts++;
    } catch (error: any) {
      stats.errors.push(`Post "${post.title}": ${error.message}`);
    }
  }
  console.log(`✅ ${stats.posts} bejegyzés importálva\n`);
}

async function importEvents() {
  const filePath = path.join(DATA_DIR, 'events.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  events.json nem található, átugorva...');
    return;
  }

  console.log('📅 Események importálása...');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  for (const event of data.events) {
    try {
      await prisma.event.create({
        data: {
          title: event.title,
          description: event.description,
          location: event.location,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          status: event.status || 'UPCOMING',
          maxAttendees: event.maxAttendees,
          imageUrl: event.imageUrl
        }
      });
      stats.events++;
    } catch (error: any) {
      stats.errors.push(`Event "${event.title}": ${error.message}`);
    }
  }
  console.log(`✅ ${stats.events} esemény importálva\n`);
}

async function importQuizzes() {
  const quizzesDir = path.join(DATA_DIR, 'quizzes');
  if (!fs.existsSync(quizzesDir)) {
    console.log('⚠️  data/quizzes/ könyvtár nem található, átugorva...');
    return;
  }

  console.log('❓ Kvízek importálása...');
  const files = fs.readdirSync(quizzesDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    try {
      const quiz = JSON.parse(fs.readFileSync(path.join(quizzesDir, file), 'utf-8'));

      await prisma.quiz.create({
        data: {
          title: quiz.title,
          description: quiz.description,
          status: quiz.status || 'DRAFT',
          category: quiz.category,
          difficulty: quiz.difficulty || 'MEDIUM',
          timeLimit: quiz.timeLimit,
          maxAttempts: quiz.maxAttempts,
          isPublic: quiz.isPublic ?? true,
          showResults: quiz.showResults ?? true,
          publishedAt: quiz.status === 'PUBLISHED' ? new Date() : null,
          questions: {
            create: quiz.questions.map((q: any, idx: number) => ({
              question: q.question,
              questionType: q.questionType || 'MULTIPLE_CHOICE',
              explanation: q.explanation,
              points: q.points || 1,
              required: q.required ?? true,
              sortOrder: q.sortOrder ?? idx,
              options: {
                create: q.options.map((opt: any, optIdx: number) => ({
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect || false,
                  sortOrder: opt.sortOrder ?? optIdx
                }))
              }
            }))
          }
        }
      });
      stats.quizzes++;
    } catch (error: any) {
      stats.errors.push(`Quiz "${file}": ${error.message}`);
    }
  }
  console.log(`✅ ${stats.quizzes} kvíz importálva\n`);
}

async function importPolls() {
  const filePath = path.join(DATA_DIR, 'polls.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  polls.json nem található, átugorva...');
    return;
  }

  console.log('🗳️  Szavazások importálása...');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  for (const poll of data.polls) {
    try {
      await prisma.poll.create({
        data: {
          title: poll.title,
          description: poll.description,
          status: poll.status || 'DRAFT',
          participationType: poll.participationType || 'ANONYMOUS',
          category: poll.category,
          startDate: poll.startDate ? new Date(poll.startDate) : null,
          endDate: poll.endDate ? new Date(poll.endDate) : null,
          timeLimit: poll.timeLimit,
          isPublic: poll.isPublic ?? true,
          allowAnonymous: poll.allowAnonymous ?? true,
          maxVotesPerUser: poll.maxVotesPerUser,
          showResults: poll.showResults || 'AFTER_VOTING',
          showLiveCount: poll.showLiveCount ?? false,
          isActive: poll.isActive ?? true,
          publishedAt: poll.status === 'ACTIVE' ? new Date() : null,
          options: {
            create: poll.options.map((opt: any, idx: number) => ({
              text: opt.text,
              description: opt.description,
              sortOrder: opt.sortOrder ?? idx
            }))
          }
        }
      });
      stats.polls++;
    } catch (error: any) {
      stats.errors.push(`Poll "${poll.title}": ${error.message}`);
    }
  }
  console.log(`✅ ${stats.polls} szavazás importálva\n`);
}

async function importPartners() {
  const filePath = path.join(DATA_DIR, 'partners.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  partners.json nem található, átugorva...');
    return;
  }

  console.log('🤝 Partnerek importálása...');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  for (const partner of data.partners) {
    try {
      await prisma.partner.create({
        data: {
          name: partner.name,
          description: partner.description,
          logoUrl: partner.logoUrl,
          websiteUrl: partner.websiteUrl,
          isActive: partner.isActive ?? true,
          sortOrder: partner.sortOrder ?? 0
        }
      });
      stats.partners++;
    } catch (error: any) {
      stats.errors.push(`Partner "${partner.name}": ${error.message}`);
    }
  }
  console.log(`✅ ${stats.partners} partner importálva\n`);
}

async function importPetitions() {
  const filePath = path.join(DATA_DIR, 'petitions.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  petitions.json nem található, átugorva...');
    return;
  }

  console.log('📝 Petíciók importálása...');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  for (const petition of data.petitions) {
    try {
      await prisma.petition.create({
        data: {
          title: petition.title,
          description: petition.description,
          content: petition.content,
          status: petition.status || 'DRAFT',
          categoryId: petition.categoryId,
          targetSignatures: petition.targetSignatures || 1000,
          startDate: petition.startDate ? new Date(petition.startDate) : new Date(),
          endDate: petition.endDate ? new Date(petition.endDate) : null,
          isPublic: petition.isPublic ?? true
        }
      });
      stats.petitions++;
    } catch (error: any) {
      stats.errors.push(`Petition "${petition.title}": ${error.message}`);
    }
  }
  console.log(`✅ ${stats.petitions} petíció importálva\n`);
}

async function printSummary() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 IMPORT ÖSSZEFOGLALÓ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`✅ Sikeres importok:`);
  console.log(`   - Hírkategóriák:  ${stats.categories}`);
  console.log(`   - Bejegyzések:    ${stats.posts}`);
  console.log(`   - Események:      ${stats.events}`);
  console.log(`   - Kvízek:         ${stats.quizzes}`);
  console.log(`   - Szavazások:     ${stats.polls}`);
  console.log(`   - Partnerek:      ${stats.partners}`);
  console.log(`   - Petíciók:       ${stats.petitions}`);

  const total = stats.categories + stats.posts + stats.events +
                stats.quizzes + stats.polls + stats.partners + stats.petitions;
  console.log(`\n   ÖSSZESEN:        ${total} rekord\n`);

  if (stats.errors.length > 0) {
    console.log(`❌ Hibák (${stats.errors.length}):`);
    stats.errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('🎉 Minden adat sikeresen importálva, hiba nélkül!');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function main() {
  console.log('🚀 Production adatok importálása...\n');

  // Ellenőrizd, hogy létezik-e a data/ könyvtár
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ HIBA: A data/ könyvtár nem található a projekt gyökerében!`);
    console.log('\n📝 Hozd létre a következő struktúrát:');
    console.log('   data/');
    console.log('   ├── news-categories.json');
    console.log('   ├── posts.json');
    console.log('   ├── events.json');
    console.log('   ├── polls.json');
    console.log('   ├── partners.json');
    console.log('   ├── petitions.json');
    console.log('   └── quizzes/');
    console.log('       ├── quiz1.json');
    console.log('       └── quiz2.json\n');
    process.exit(1);
  }

  try {
    // Import sorrendben (függőségek miatt)
    await importNewsCategories();
    await importPosts();
    await importEvents();
    await importQuizzes();
    await importPolls();
    await importPartners();
    await importPetitions();

    await printSummary();

    console.log('✅ Import befejezve!');
  } catch (error) {
    console.error('❌ Kritikus hiba történt:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

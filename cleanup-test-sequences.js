#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupTestSequences() {
  try {
    console.log('🧹 Teszt sequences törlése...');
    
    // Find test sequences
    const testSequences = await prisma.campaignSequence.findMany({
      where: {
        OR: [
          { name: { contains: 'TESZT' } },
          { name: { contains: 'TRACKING' } },
          { name: { contains: 'KÉPES' } },
          { name: { contains: 'DEMO' } }
        ]
      },
      include: {
        executions: true,
        emails: true
      }
    });
    
    console.log(`📋 ${testSequences.length} teszt sequence találva:`);
    testSequences.forEach(seq => {
      console.log(`  - ${seq.name} (${seq.executions.length} execution, ${seq.emails.length} email)`);
    });
    
    if (testSequences.length === 0) {
      console.log('✅ Nincs törlendő teszt sequence');
      return;
    }
    
    // Delete executions first (because of foreign key constraints)
    for (const sequence of testSequences) {
      if (sequence.executions.length > 0) {
        console.log(`🗑️ Executions törlése: ${sequence.name}`);
        await prisma.sequenceExecution.deleteMany({
          where: { sequenceId: sequence.id }
        });
      }
    }
    
    // Delete the sequences (emails will be cascade deleted)
    const deleteResult = await prisma.campaignSequence.deleteMany({
      where: {
        OR: [
          { name: { contains: 'TESZT' } },
          { name: { contains: 'TRACKING' } },
          { name: { contains: 'KÉPES' } },
          { name: { contains: 'DEMO' } }
        ]
      }
    });
    
    console.log(`✅ ${deleteResult.count} teszt sequence törölve!`);
    
    // Show remaining sequences
    const remainingSequences = await prisma.campaignSequence.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        _count: {
          select: {
            executions: true,
            emails: true
          }
        }
      }
    });
    
    console.log(`\n📋 MEGMARADT SEQUENCES (${remainingSequences.length}):`);
    if (remainingSequences.length === 0) {
      console.log('  (nincs sequence)');
    } else {
      remainingSequences.forEach(seq => {
        console.log(`  ✅ ${seq.name} (${seq.status}) - ${seq._count.executions} exec, ${seq._count.emails} emails`);
      });
    }
    
  } catch (error) {
    console.error('❌ Törlési hiba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestSequences();
#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createImageExecutions() {
  try {
    console.log('🖼️ Képes teszt executions létrehozása...');
    
    const sequenceId = 'cmg3y496u0000vhv016qvov6z';
    
    // Calculate timing for image emails
    const now = new Date();
    const email1Due = new Date(now.getTime()); // Azonnal
    
    console.log(`⏰ KÉPES Email #1 esedékes: ${email1Due.toLocaleString('hu-HU')} (AZONNAL)`);
    console.log(`📷 Képek: 200×150 → 400×300 → 600×400 → 800×400 px`);
    
    // Create executions for image test emails
    const executions = await prisma.sequenceExecution.createMany({
      data: [
        {
          sequenceId: sequenceId,
          subscriberEmail: 'jakabgipsz865@gmail.com',
          subscriberName: 'Image Test User 1',
          status: 'ACTIVE',
          currentStep: 1,
          nextEmailDue: email1Due
        },
        {
          sequenceId: sequenceId,
          subscriberEmail: 'plscallmegiorgio@gmail.com',
          subscriberName: 'Image Test User 2',
          status: 'ACTIVE',
          currentStep: 1,
          nextEmailDue: email1Due
        }
      ]
    });
    
    console.log(`✅ ${executions.count} képes execution létrehozva!`);
    console.log('📧 Címzettek: jakabgipsz865@gmail.com, plscallmegiorgio@gmail.com');
    console.log('🖼️ Az első képes email azonnal küldésre kerül!');
    console.log('\n🎨 VÁRT KÉPES EMAILEK:');
    console.log('📷 Email #1: Kis kép (200×150) - azonnal');
    console.log('🖼️ Email #2: Közepes kép (400×300) - 1 perc múlva');
    console.log('🎭 Email #3: Nagy kép (600×400) - 3 perc múlva');
    console.log('🌟 Email #4: MEGA banner (800×400) - 4 perc múlva');
    
  } catch (error) {
    console.error('❌ Hiba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createImageExecutions();
#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTrackingExecutions() {
  try {
    console.log('🎯 Tracking teszt executions létrehozása...');
    
    const sequenceId = 'cmg3yu9fr0000ro2qvc0077s1';
    
    // Calculate timing for tracking emails
    const now = new Date();
    const email1Due = new Date(now.getTime()); // Azonnal
    
    console.log(`⏰ TRACKING Email #1 esedékes: ${email1Due.toLocaleString('hu-HU')} (AZONNAL)`);
    console.log(`🎯 Tracking funkciók: megnyitás pixel + klikk követés`);
    
    // Create executions for tracking test emails
    const executions = await prisma.sequenceExecution.createMany({
      data: [
        {
          sequenceId: sequenceId,
          subscriberEmail: 'jakabgipsz865@gmail.com',
          subscriberName: 'Tracking Test User 1',
          status: 'ACTIVE',
          currentStep: 1,
          nextEmailDue: email1Due
        },
        {
          sequenceId: sequenceId,
          subscriberEmail: 'plscallmegiorgio@gmail.com',
          subscriberName: 'Tracking Test User 2',
          status: 'ACTIVE',
          currentStep: 1,
          nextEmailDue: email1Due
        }
      ]
    });
    
    console.log(`✅ ${executions.count} tracking execution létrehozva!`);
    console.log('📧 Címzettek: jakabgipsz865@gmail.com, plscallmegiorgio@gmail.com');
    console.log('🎯 Az első tracking email azonnal küldésre kerül!');
    console.log('\\n📊 VÁRT TRACKING EMAILEK:');
    console.log('🎯 Email #1: Tracking pixel teszt - azonnal');
    console.log('🎯 Email #2: Klikk tracking teszt - 2 perc múlva');
    console.log('\\n📈 TRACKING TESZTELÉS:');
    console.log('1. 📖 Nyisd meg mindkét emailt');
    console.log('2. 🖱️ Kattints a linkekre');
    console.log('3. 📊 Ellenőrizd az admin panelben a statisztikákat');
    console.log('4. 🎯 Várható: 100% megnyitási és klikk arány');
    
  } catch (error) {
    console.error('❌ Hiba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTrackingExecutions();
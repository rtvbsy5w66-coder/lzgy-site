#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestExecutions() {
  try {
    console.log('🚀 Teszt executions létrehozása...');
    
    const sequenceId = 'cmg3uljjr0000imjq180ph65k';
    
    // Calculate next email due times
    const now = new Date();
    const email1Due = new Date(now.getTime()); // Azonnal
    const email2Due = new Date(now.getTime() + 1 * 60 * 1000); // 1 perc múlva
    const email3Due = new Date(now.getTime() + 3 * 60 * 1000); // 3 perc múlva
    
    console.log(`⏰ Email #1 esedékes: ${email1Due.toLocaleString('hu-HU')}`);
    console.log(`⏰ Email #2 esedékes: ${email2Due.toLocaleString('hu-HU')}`);
    console.log(`⏰ Email #3 esedékes: ${email3Due.toLocaleString('hu-HU')}`);
    
    // Create executions for test emails
    const executions = await prisma.sequenceExecution.createMany({
      data: [
        {
          sequenceId: sequenceId,
          subscriberEmail: 'jakabgipsz865@gmail.com',
          subscriberName: 'Test User 1',
          status: 'ACTIVE',
          currentStep: 1,
          nextEmailDue: email1Due
        },
        {
          sequenceId: sequenceId,
          subscriberEmail: 'plscallmegiorgio@gmail.com',
          subscriberName: 'Test User 2',
          status: 'ACTIVE',
          currentStep: 1,
          nextEmailDue: email1Due
        }
      ]
    });
    
    console.log(`✅ ${executions.count} execution létrehozva!`);
    console.log('📧 Címzettek: jakabgipsz865@gmail.com, plscallmegiorgio@gmail.com');
    console.log('🎯 Az első email azonnal küldésre kerül!');
    
  } catch (error) {
    console.error('❌ Hiba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestExecutions();
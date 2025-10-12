#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function debugPrisma() {
  console.log('🔍 Debugging Prisma client...');
  
  try {
    const prisma = new PrismaClient();
    
    console.log('✅ Prisma client created');
    console.log('Available models:', Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));
    
    // Test if campaignSequence is available
    if (prisma.campaignSequence) {
      console.log('✅ campaignSequence model is available');
      
      try {
        const count = await prisma.campaignSequence.count();
        console.log(`✅ Database connection working. Found ${count} sequences.`);
        
        if (count > 0) {
          const sequences = await prisma.campaignSequence.findMany({
            take: 2,
            include: {
              emails: true,
              executions: true
            }
          });
          console.log(`📋 Sample sequences:`, sequences.map(s => ({ id: s.id, name: s.name, status: s.status })));
        }
      } catch (dbError) {
        console.error('❌ Database query error:', dbError.message);
      }
    } else {
      console.error('❌ campaignSequence model NOT available');
      console.log('Available prisma properties:', Object.getOwnPropertyNames(prisma));
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Prisma error:', error.message);
  }
}

debugPrisma();
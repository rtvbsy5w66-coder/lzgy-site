#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkEmailTracking() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Email tracking adatok ellenőrzése...');
    
    // Keressük meg a képes teszt sequence-t
    const imageSequence = await prisma.campaignSequence.findFirst({
      where: {
        name: {
          contains: 'KÉPES TESZT'
        }
      },
      include: {
        emails: {
          orderBy: { order: 'asc' }
        },
        executions: {
          include: {
            logs: true
          }
        }
      }
    });
    
    if (!imageSequence) {
      console.log('❌ Képes teszt sequence nem található');
      return;
    }
    
    console.log(`✅ Sequence megtalálva: ${imageSequence.name}`);
    console.log(`📧 Emailek száma: ${imageSequence.emails.length}`);
    console.log(`👥 Executions száma: ${imageSequence.executions.length}`);
    
    // Részletes execution adatok
    imageSequence.executions.forEach((execution, index) => {
      console.log(`\n📊 Execution #${index + 1}:`);
      console.log(`  Email: ${execution.subscriberEmail}`);
      console.log(`  Név: ${execution.subscriberName}`);
      console.log(`  Státusz: ${execution.status}`);
      console.log(`  Jelenlegi lépés: ${execution.currentStep}`);
      console.log(`  📨 Küldött emailek: ${execution.emailsSent}`);
      console.log(`  📖 Megnyitott emailek: ${execution.emailsOpened}`);
      console.log(`  🖱️ Klikkelés: ${execution.emailsClicked}`);
      console.log(`  ⏰ Következő email: ${execution.nextEmailDue}`);
      console.log(`  📝 Logok száma: ${execution.logs.length}`);
      
      if (execution.logs.length > 0) {
        console.log(`  📄 Logok:`);
        execution.logs.forEach(log => {
          const date = log.createdAt ? new Date(log.createdAt).toLocaleString('hu-HU') : 'N/A';
          console.log(`    - ${log.action}: ${log.emailType || 'N/A'} (${date})`);
          if (log.details) {
            console.log(`      Részletek: ${log.details}`);
          }
        });
      }
    });
    
    // Összesített statisztikák
    const totalSent = imageSequence.executions.reduce((sum, e) => sum + e.emailsSent, 0);
    const totalOpened = imageSequence.executions.reduce((sum, e) => sum + e.emailsOpened, 0);
    const totalClicked = imageSequence.executions.reduce((sum, e) => sum + e.emailsClicked, 0);
    
    console.log(`\n📈 ÖSSZESÍTETT STATISZTIKÁK:`);
    console.log(`📨 Összes küldött email: ${totalSent}`);
    console.log(`📖 Összes megnyitás: ${totalOpened}`);
    console.log(`🖱️ Összes klikk: ${totalClicked}`);
    console.log(`📊 Megnyitási arány: ${totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0}%`);
    
    // Email tracking URL-ek ellenőrzése
    console.log(`\n🔗 TRACKING URL-EK ELLENŐRZÉSE:`);
    imageSequence.emails.forEach(email => {
      const hasTrackingPixel = email.content.includes('/api/newsletter/track/open');
      const hasClickTracking = email.content.includes('/api/newsletter/track/click');
      console.log(`📧 ${email.name}:`);
      console.log(`  📊 Megnyitás tracking: ${hasTrackingPixel ? '✅' : '❌'}`);
      console.log(`  🖱️ Klikk tracking: ${hasClickTracking ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Hiba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailTracking();
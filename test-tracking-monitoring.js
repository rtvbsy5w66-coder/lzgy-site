#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function monitorTracking() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 TRACKING MONITORING...');
    console.log('📊 Várakozás 30 másodperc a tracking tesztelésére...');
    console.log('💡 MOST nyisd meg és kattintsd végig az emaileket!');
    
    // Monitor for 30 seconds
    let iterations = 0;
    const maxIterations = 6; // 30 seconds / 5 second intervals
    
    const monitorInterval = setInterval(async () => {
      try {
        iterations++;
        console.log(`\\n🔄 Monitoring check #${iterations}/${maxIterations}...`);
        
        // Get tracking sequences
        const trackingSequences = await prisma.campaignSequence.findMany({
          where: {
            name: {
              contains: 'TRACKING'
            }
          },
          include: {
            executions: {
              include: {
                logs: {
                  orderBy: { timestamp: 'desc' }
                }
              }
            }
          }
        });
        
        console.log(`📧 ${trackingSequences.length} tracking sequences találva`);
        
        let totalOpens = 0;
        let totalClicks = 0;
        let totalSent = 0;
        
        trackingSequences.forEach(sequence => {
          console.log(`\\n📊 ${sequence.name}:`);
          
          sequence.executions.forEach(execution => {
            console.log(`  👤 ${execution.subscriberEmail}:`);
            console.log(`    📨 Sent: ${execution.emailsSent}`);
            console.log(`    📖 Opens: ${execution.emailsOpened}`);
            console.log(`    🖱️ Clicks: ${execution.emailsClicked}`);
            
            totalSent += execution.emailsSent;
            totalOpens += execution.emailsOpened;
            totalClicks += execution.emailsClicked;
            
            // Show recent logs
            const recentLogs = execution.logs.slice(0, 3);
            if (recentLogs.length > 0) {
              console.log(`    📝 Recent activity:`);
              recentLogs.forEach(log => {
                const time = new Date(log.timestamp).toLocaleTimeString('hu-HU');
                console.log(`      ${time} - ${log.action} (Email #${log.emailOrder || 'N/A'})`);
              });
            }
          });
        });
        
        console.log(`\\n📈 ÖSSZESÍTETT STATISZTIKÁK:`);
        console.log(`📨 Összes küldött: ${totalSent}`);
        console.log(`📖 Összes megnyitás: ${totalOpens}`);
        console.log(`🖱️ Összes klikk: ${totalClicks}`);
        
        if (totalSent > 0) {
          const openRate = ((totalOpens / totalSent) * 100).toFixed(1);
          const clickRate = ((totalClicks / totalSent) * 100).toFixed(1);
          console.log(`📊 Megnyitási arány: ${openRate}%`);
          console.log(`🖱️ Klikk arány: ${clickRate}%`);
        }
        
        // Success criteria
        if (totalOpens > 0 && totalClicks > 0) {
          console.log(`\\n🎉 TRACKING TESZT SIKERES!`);
          console.log(`✅ Megnyitás tracking: MŰKÖDIK (${totalOpens} megnyitás)`);
          console.log(`✅ Klikk tracking: MŰKÖDIK (${totalClicks} klikk)`);
          console.log(`📊 Admin panel frissítések: MŰKÖDNEK`);
          clearInterval(monitorInterval);
          return;
        }
        
        if (iterations >= maxIterations) {
          console.log(`\\n⏰ Monitoring befejezve`);
          console.log(`📊 Végső eredmény: ${totalOpens} megnyitás, ${totalClicks} klikk`);
          if (totalOpens === 0 && totalClicks === 0) {
            console.log(`💡 Tipp: Nyisd meg az emaileket és kattints a linkekre!`);
          }
          clearInterval(monitorInterval);
        }
        
      } catch (error) {
        console.error('❌ Monitoring hiba:', error);
      }
    }, 5000); // Every 5 seconds
    
  } catch (error) {
    console.error('❌ Monitoring setup hiba:', error);
  }
}

monitorTracking();
#!/usr/bin/env node

const { exec } = require('child_process');

function log(message) {
  const timestamp = new Date().toLocaleString('hu-HU');
  console.log(`[${timestamp}] ${message}`);
}

let checkCount = 0;

function runSchedulerCheck() {
  checkCount++;
  log(`🔍 Scheduler ellenőrzés #${checkCount}...`);
  
  exec('npm run newsletter:schedule', (error, stdout, stderr) => {
    if (error) {
      log(`❌ Hiba: ${error.message}`);
      return;
    }
    
    // Parse the output to see if emails were sent
    if (stdout.includes('Elküldött emailek: 0')) {
      log('⏳ Nincs esedékes kampány - várakozás...');
    } else if (stdout.includes('Elküldött emailek:')) {
      const sentMatch = stdout.match(/Elküldött emailek: (\d+)/);
      const processedMatch = stdout.match(/Feldolgozott kampányok: (\d+)/);
      
      if (sentMatch && sentMatch[1] > 0) {
        log(`🎉 SIKER! ${sentMatch[1]} email elküldve!`);
        log(`📧 ${processedMatch[1]} kampány feldolgozva`);
        log('✅ Teszt kampány sikeresen elküldve!');
        
        // Stop monitoring
        log('🛑 Monitoring leállítva - teszt befejezve');
        process.exit(0);
      }
    }
  });
}

log('🚀 Newsletter scheduler monitoring indítása...');
log('⏰ Ellenőrzés minden 30 másodpercben');
log('🎯 Várakozás a teszt kampány küldésére...');

// Run immediately and then every 30 seconds
runSchedulerCheck();
setInterval(runSchedulerCheck, 30000);

// Stop after 10 minutes max
setTimeout(() => {
  log('⏰ 10 perc eltelt - monitoring leállítva');
  process.exit(0);
}, 10 * 60 * 1000);
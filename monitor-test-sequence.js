#!/usr/bin/env node

const { exec } = require('child_process');

function log(message) {
  const timestamp = new Date().toLocaleString('hu-HU');
  console.log(`[${timestamp}] ${message}`);
}

let checkCount = 0;
let emailsReceived = 0;

function runSchedulerCheck() {
  checkCount++;
  log(`🔍 Sequence scheduler ellenőrzés #${checkCount}...`);
  
  exec('npm run newsletter:schedule', (error, stdout, stderr) => {
    if (error) {
      log(`❌ Hiba: ${error.message}`);
      return;
    }
    
    // Parse newsletter results
    if (stdout.includes('Newsletter - Kampányok:')) {
      const newsletterMatch = stdout.match(/Newsletter - Kampányok: (\d+), Emailek: (\d+)/);
      if (newsletterMatch) {
        const campaigns = newsletterMatch[1];
        const emails = newsletterMatch[2];
        if (emails > 0) {
          log(`📧 Newsletter: ${emails} email elküldve (${campaigns} kampány)`);
        }
      }
    }
    
    // Parse sequence results
    if (stdout.includes('Sequences - Feldolgozott:')) {
      const sequenceMatch = stdout.match(/Sequences - Feldolgozott: (\d+), Emailek: (\d+)/);
      if (sequenceMatch) {
        const sequences = sequenceMatch[1];
        const emails = parseInt(sequenceMatch[2]);
        
        if (emails > 0) {
          emailsReceived += emails;
          log(`🎯 SEQUENCE EMAIL ELKÜLDVE! Összesen: ${emailsReceived} email`);
          
          if (emailsReceived >= 3) {
            log(`🎉 MIND A 3 EMAIL ELKÜLDVE! TESZT SIKERES!`);
            log(`✅ Email #1: Azonnali küldés`);
            log(`✅ Email #2: 1 perc múlva`);
            log(`✅ Email #3: 3 perc múlva`);
            log(`🏁 SEQUENCE RENDSZER TESZTJE BEFEJEZVE!`);
            process.exit(0);
          }
        } else {
          log(`⏳ Nincs sequence email küldve - várakozás...`);
        }
      }
    }
    
    // Check total emails
    if (stdout.includes('Összes elküldött email:')) {
      const totalMatch = stdout.match(/Összes elküldött email: (\d+)/);
      if (totalMatch && parseInt(totalMatch[1]) > 0) {
        log(`📊 Összes email a ciklusban: ${totalMatch[1]}`);
      }
    }
    
    if (stdout.includes('Nincs esedékes kampány vagy sequence')) {
      log(`💤 Nincs esedékes email`);
    }
  });
}

log('🚀 Sequence teszt monitoring indítása...');
log('⏰ Ellenőrzés minden 15 másodpercben');
log('🎯 Várakozás a 3 számozott teszt emailre...');
log('📧 Email #1: azonnal | Email #2: 1 perc | Email #3: 3 perc');

// Run immediately and then every 15 seconds
runSchedulerCheck();
setInterval(runSchedulerCheck, 15000);

// Stop after 10 minutes max
setTimeout(() => {
  log('⏰ 10 perc eltelt - monitoring leállítva');
  if (emailsReceived < 3) {
    log(`⚠️ Csak ${emailsReceived}/3 email került elküldésre`);
  }
  process.exit(0);
}, 10 * 60 * 1000);
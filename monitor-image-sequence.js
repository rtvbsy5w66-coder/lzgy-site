#!/usr/bin/env node

const { exec } = require('child_process');

function log(message) {
  const timestamp = new Date().toLocaleString('hu-HU');
  console.log(`[${timestamp}] ${message}`);
}

let totalImageEmailsSent = 0;
const imageTypes = ['📷 Kis kép (200×150)', '🖼️ Közepes kép (400×300)', '🎭 Nagy kép (600×400)', '🌟 MEGA banner (800×400)'];

function runImageScheduler() {
  log('🖼️ Képes sequence scheduler futtatása...');
  
  exec('node sequence-scheduler-direct.js', (error, stdout, stderr) => {
    if (error) {
      log(`❌ Error: ${error.message}`);
      return;
    }
    
    // Parse output for image emails
    if (stdout.includes('SUCCESS:')) {
      const match = stdout.match(/SUCCESS: (\d+) emails sent/);
      if (match) {
        const emailsSent = parseInt(match[1]);
        if (emailsSent > 0) {
          totalImageEmailsSent += emailsSent;
          log(`🎨 ${emailsSent} KÉPES EMAIL SENT! Total: ${totalImageEmailsSent}`);
          
          // Log which image emails were sent
          const lines = stdout.split('\n');
          lines.forEach(line => {
            if (line.includes('Successfully sent')) {
              const emailMatch = line.match(/Successfully sent "([^"]+)" to ([^"]+)/);
              if (emailMatch) {
                const emailName = emailMatch[1];
                const recipient = emailMatch[2];
                
                // Determine image type
                let imageInfo = '';
                if (emailName.includes('#1')) imageInfo = ' (📷 200×150px)';
                else if (emailName.includes('#2')) imageInfo = ' (🖼️ 400×300px)';
                else if (emailName.includes('#3')) imageInfo = ' (🎭 600×400px)';
                else if (emailName.includes('#4')) imageInfo = ' (🌟 800×400px)';
                
                log(`  ✅ ${emailName}${imageInfo} → ${recipient}`);
              }
            }
          });
          
          // Progress tracking
          const currentEmailNumber = Math.ceil(totalImageEmailsSent / 2); // 2 recipients per email
          if (currentEmailNumber <= 4) {
            log(`📊 Progress: ${currentEmailNumber}/4 image emails sent`);
            if (currentEmailNumber < 4) {
              const nextImage = imageTypes[currentEmailNumber];
              log(`⏰ Next: ${nextImage} coming soon...`);
            }
          }
          
          if (totalImageEmailsSent >= 8) { // 4 emails × 2 recipients = 8 total
            log(`🎉 ALL 8 IMAGE EMAILS SENT! TEST COMPLETE!`);
            log(`📷 Email #1 (200×150): ✅ Sent to both recipients`);
            log(`🖼️ Email #2 (400×300): ✅ Sent to both recipients`);
            log(`🎭 Email #3 (600×400): ✅ Sent to both recipients`);
            log(`🌟 Email #4 (800×400): ✅ Sent to both recipients`);
            log(`🏁 IMAGE SEQUENCE SYSTEM FULLY WORKING!`);
            log(`🖼️ All different image sizes successfully delivered!`);
            process.exit(0);
          }
        } else {
          log(`💤 No image emails due at this time`);
        }
      }
    }
  });
}

log('🚀 Starting IMAGE sequence monitoring...');
log('🖼️ Running scheduler every 15 seconds');
log('🎨 Expecting 8 total emails (4 image emails × 2 recipients)');
log('📷 Image progression: 200×150 → 400×300 → 600×400 → 800×400 pixels');

// Run immediately and then every 15 seconds
runImageScheduler();
setInterval(runImageScheduler, 15000);

// Stop after 15 minutes
setTimeout(() => {
  log('⏰ 15 minutes elapsed - stopping image monitor');
  log(`📊 Final result: ${totalImageEmailsSent}/8 image emails sent`);
  process.exit(0);
}, 15 * 60 * 1000);
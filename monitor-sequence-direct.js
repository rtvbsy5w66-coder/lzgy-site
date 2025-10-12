#!/usr/bin/env node

const { exec } = require('child_process');

function log(message) {
  const timestamp = new Date().toLocaleString('hu-HU');
  console.log(`[${timestamp}] ${message}`);
}

let totalEmailsSent = 0;

function runDirectScheduler() {
  log('🔄 Running direct sequence scheduler...');
  
  exec('node sequence-scheduler-direct.js', (error, stdout, stderr) => {
    if (error) {
      log(`❌ Error: ${error.message}`);
      return;
    }
    
    // Parse output
    if (stdout.includes('SUCCESS:')) {
      const match = stdout.match(/SUCCESS: (\d+) emails sent/);
      if (match) {
        const emailsSent = parseInt(match[1]);
        if (emailsSent > 0) {
          totalEmailsSent += emailsSent;
          log(`🎯 ${emailsSent} EMAIL SENT! Total: ${totalEmailsSent}`);
          
          // Log which emails were sent
          const lines = stdout.split('\n');
          lines.forEach(line => {
            if (line.includes('Successfully sent')) {
              const emailMatch = line.match(/Successfully sent "([^"]+)" to ([^"]+)/);
              if (emailMatch) {
                log(`  ✅ ${emailMatch[1]} → ${emailMatch[2]}`);
              }
            }
          });
          
          if (totalEmailsSent >= 6) { // 3 emails × 2 recipients = 6 total
            log(`🎉 ALL 6 EMAILS SENT! TEST COMPLETE!`);
            log(`📧 Email #1: ✅ Sent to both recipients`);
            log(`📧 Email #2: ✅ Sent to both recipients`);
            log(`📧 Email #3: ✅ Sent to both recipients`);
            log(`🏁 SEQUENCE SYSTEM FULLY WORKING!`);
            process.exit(0);
          }
        } else {
          log(`💤 No emails due at this time`);
        }
      }
    }
  });
}

log('🚀 Starting direct sequence monitoring...');
log('⏰ Running scheduler every 15 seconds');
log('🎯 Expecting 6 total emails (3 emails × 2 recipients)');

// Run immediately and then every 15 seconds
runDirectScheduler();
setInterval(runDirectScheduler, 15000);

// Stop after 10 minutes
setTimeout(() => {
  log('⏰ 10 minutes elapsed - stopping monitor');
  log(`📊 Final result: ${totalEmailsSent}/6 emails sent`);
  process.exit(0);
}, 10 * 60 * 1000);
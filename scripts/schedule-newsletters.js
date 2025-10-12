#!/usr/bin/env node

/**
 * Newsletter Scheduler Script
 * 
 * Ez a script automatikusan lefuttatja a newsletter scheduler-t
 * hogy elküldja az esedékes campaign-eket.
 * 
 * Használat:
 * - Cron job-ként: "0 0,6,12,18 * * * node scripts/schedule-newsletters.js"
 * - Manuálisan: node scripts/schedule-newsletters.js
 * 
 * Környezeti változók:
 * - NEXTAUTH_URL: Az alkalmazás URL-je
 * - SCHEDULER_API_KEY: A scheduler API kulcs
 */

const https = require('https');
const http = require('http');

// Environment változók
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const API_KEY = process.env.SCHEDULER_API_KEY || 'newsletter-scheduler-secret-key-2024';

// Log függvény timestamppel
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// HTTP kérés küldése
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = client.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ status: res.statusCode, data });
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Fő függvény
async function runScheduler() {
  try {
    log('Newsletter & Sequence scheduler indítása...');
    
    // 1. Run newsletter scheduler
    log('📧 Newsletter scheduler futtatása...');
    const newsletterUrl = `${BASE_URL}/api/admin/newsletter/scheduler`;
    const newsletterResult = await makeRequest(newsletterUrl, {
      authorization: API_KEY
    });
    
    // 2. Run sequence scheduler  
    log('🔄 Sequence scheduler futtatása...');
    const sequenceUrl = `${BASE_URL}/api/admin/sequences/simple-scheduler`;
    const sequenceResult = await makeRequest(sequenceUrl, {
      authorization: API_KEY
    });
    
    // Combine results
    const result = {
      status: Math.max(newsletterResult.status, sequenceResult.status),
      data: {
        newsletter: newsletterResult.data,
        sequences: sequenceResult.data
      }
    };
    
    if (result.status === 200) {
      const newsletter = result.data.newsletter;
      const sequences = result.data.sequences;
      
      log(`✅ Scheduler sikeresen lefutott:`);
      
      // Newsletter results
      if (newsletter) {
        log(`📧 Newsletter - Kampányok: ${newsletter.processedCampaigns}, Emailek: ${newsletter.totalSent}`);
        if (newsletter.results && newsletter.results.length > 0) {
          newsletter.results.forEach(r => {
            log(`   ${r.success ? '✅' : '❌'} ${r.name}: ${r.sentCount || 0} email`);
          });
        }
      }
      
      // Sequence results  
      if (sequences) {
        log(`🔄 Sequences - Feldolgozott: ${sequences.processedSequences}, Emailek: ${sequences.emailsSent}`);
        if (sequences.results && sequences.results.length > 0) {
          sequences.results.forEach(r => {
            log(`   ${r.success ? '✅' : '❌'} ${r.sequenceName}: ${r.emailsSent} email`);
          });
        }
      }
      
      const totalEmails = (newsletter?.totalSent || 0) + (sequences?.emailsSent || 0);
      if (totalEmails === 0) {
        log('   ℹ️  Nincs esedékes kampány vagy sequence');
      } else {
        log(`   📊 Összes elküldött email: ${totalEmails}`);
      }
      
    } else {
      log(`❌ Scheduler hiba: HTTP ${result.status}`);
      log(`   Válasz: ${JSON.stringify(result.data, null, 2)}`);
      process.exit(1);
    }
    
  } catch (error) {
    log(`❌ Scheduler futtatási hiba: ${error.message}`);
    process.exit(1);
  }
}

// Script futtatása
if (require.main === module) {
  runScheduler()
    .then(() => {
      log('Scheduler befejezve');
      process.exit(0);
    })
    .catch((error) => {
      log(`Kritikus hiba: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runScheduler };
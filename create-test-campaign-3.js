#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestCampaign() {
  try {
    console.log('🚀 JAVÍTOTT teszt kampány létrehozása...');
    
    // 3 perc múlva
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + 3);
    
    console.log(`⏰ Ütemezett küldés: ${scheduledTime.toLocaleString('hu-HU')}`);
    console.log(`📧 FROM cím: onboarding@resend.dev (VERIFIKÁLT)`);
    
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        name: `JAVÍTOTT TESZT #3 - ${scheduledTime.toLocaleString('hu-HU')}`,
        subject: '✅ JAVÍTOTT TESZT - Newsletter Scheduler WORKING!',
        content: `
          <h2>🎯 JAVÍTOTT Email Teszt - Domain Fixed!</h2>
          <p>Kedves {NAME}!</p>
          
          <p><strong>Ez a JAVÍTOTT teszt email</strong> ami most már verifikált domainről jön!</p>
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h3>✅ Javított Beállítások:</h3>
            <ul>
              <li><strong>FROM cím:</strong> onboarding@resend.dev (VERIFIKÁLT)</li>
              <li><strong>Domain hiba:</strong> ✅ JAVÍTVA</li>
              <li><strong>Ütemezett idő:</strong> ${scheduledTime.toLocaleString('hu-HU')}</li>
              <li><strong>Automatikus küldés:</strong> ✅ Scheduler által</li>
            </ul>
          </div>
          
          <p><strong>🎉 Ha megkaptad ezt az emailt:</strong></p>
          <ol>
            <li>✅ A domain verification probléma megoldva</li>
            <li>✅ A scheduler rendszer működik</li>
            <li>✅ Az emailek eljutnak a címzettekhez</li>
            <li>✅ A newsletter rendszer production ready!</li>
          </ol>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0;"><strong>🔧 Technikai infó:</strong><br>
            Küldés ideje: {DATE}<br>
            Kampány típus: Scheduled Test<br>
            Email szolgáltatás: Resend API</p>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            <em>Automatikus teszt email - Javított verzió - Lovas Zoltán Hírlevél Rendszer</em>
          </p>
        `,
        status: 'SCHEDULED',
        scheduledAt: scheduledTime,
        recipientType: 'TEST',
        testEmail: 'jakabgipsz865@gmail.com,plscallmegiorgio@gmail.com',
        createdBy: 'Claude Code - Fixed Test',
        isAbTest: false,
        isRecurring: false
      }
    });
    
    console.log('✅ JAVÍTOTT teszt kampány sikeresen létrehozva!');
    console.log(`📧 Kampány ID: ${campaign.id}`);
    console.log(`📬 Címzettek: jakabgipsz865@gmail.com, plscallmegiorgio@gmail.com`);
    console.log(`⏱️  Várakozási idő: 3 perc (rövidebb teszt)`);
    console.log(`🔄 Monitorozható: /admin/newsletter oldalon`);
    console.log(`🎯 MOST MÁR MŰKÖDNIE KELL!`);
    
  } catch (error) {
    console.error('❌ Hiba a kampány létrehozásánál:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCampaign();
#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestCampaign() {
  try {
    console.log('🚀 Új teszt kampány létrehozása...');
    
    // 5 perc múlva
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + 5);
    
    console.log(`⏰ Ütemezett küldés: ${scheduledTime.toLocaleString('hu-HU')}`);
    
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        name: `TESZT Kampány #2 - ${scheduledTime.toLocaleString('hu-HU')}`,
        subject: '🔥 MÁSODIK TESZT - Newsletter Scheduler Működik!',
        content: `
          <h2>🎯 Második Automatikus Teszt Email</h2>
          <p>Kedves {NAME}!</p>
          
          <p><strong>Ez a második automatikus teszt email</strong> ami bizonyítja, hogy a newsletter scheduler rendszer teljesen működőképes!</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📊 Teszt Részletek:</h3>
            <ul>
              <li><strong>Ütemezett idő:</strong> ${scheduledTime.toLocaleString('hu-HU')}</li>
              <li><strong>Automatikus küldés:</strong> ✅ Scheduler által</li>
              <li><strong>Countdown timer:</strong> ✅ Valós idejű követés</li>
              <li><strong>Több címzett:</strong> ✅ Támogatott</li>
            </ul>
          </div>
          
          <p>Ha megkaptad ezt az emailt, az azt jelenti hogy:</p>
          <ol>
            <li>A countdown timer pontosan számolt vissza</li>
            <li>A scheduler automatikusan feldolgozta a kampányt</li>
            <li>Az email sikeresen elküldésre került</li>
          </ol>
          
          <p><strong>🎉 A newsletter scheduler rendszer tökéletesen működik!</strong></p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            <em>Automatikus teszt email - {DATE} - Lovas Zoltán Hírlevél Rendszer</em>
          </p>
        `,
        status: 'SCHEDULED',
        scheduledAt: scheduledTime,
        recipientType: 'TEST',
        testEmail: 'jakabgipsz865@gmail.com,plscallmegiorgio@gmail.com',
        createdBy: 'Claude Code - Automated Test',
        isAbTest: false,
        isRecurring: false
      }
    });
    
    console.log('✅ Teszt kampány sikeresen létrehozva!');
    console.log(`📧 Kampány ID: ${campaign.id}`);
    console.log(`📬 Címzettek: jakabgipsz865@gmail.com, plscallmegiorgio@gmail.com`);
    console.log(`⏱️  Várakozási idő: 5 perc`);
    console.log(`🔄 Monitorozható: /admin/newsletter oldalon`);
    
  } catch (error) {
    console.error('❌ Hiba a kampány létrehozásánál:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCampaign();
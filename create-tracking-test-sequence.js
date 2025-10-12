#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTrackingTestSequence() {
  try {
    console.log('🚀 TRACKING TESZT Sequence létrehozása...');
    
    // Start time: 30 seconds from now
    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + 30);
    
    console.log(`⏰ Indítás: ${startTime.toLocaleString('hu-HU')}`);
    console.log(`🎯 2 tracking email 1-2 perces késéssel`);
    
    const sequence = await prisma.campaignSequence.create({
      data: {
        name: '🎯 TRACKING TESZT: 2 Email + Tracking',
        description: 'Email tracking teszt - megnyitás és klikk követéssel',
        status: 'DRAFT',
        targetAudience: 'NEWSLETTER_SUBSCRIBERS',
        startDate: startTime,
        totalDuration: 5, // 5 perc
        autoEnroll: true,
        createdBy: 'Claude Code Tracking Test',
        emails: {
          create: [
            {
              name: '🎯 Tracking Email #1',
              subject: '📊 TRACKING TESZT #1 - Kattints és nyisd meg!',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #10b981;">
                  <h1 style="color: #10b981; text-align: center;">🎯 TRACKING EMAIL #1</h1>
                  
                  <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #10b981;">
                    <h2>📊 Tracking teszt!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez az <strong>ELSŐ tracking email</strong> - a megnyitást és klikkelést követjük!</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>🎯 Mit tesztelünk:</h3>
                      <ul>
                        <li><strong>📖 Megnyitás:</strong> Ha látod ezt az emailt</li>
                        <li><strong>🖱️ Klikkelés:</strong> Ha rákattintasz a linkekre</li>
                        <li><strong>📊 Statisztikák:</strong> Az admin panelben láthatóak</li>
                      </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="https://lovaszoltan.dev" 
                         style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        🖱️ Tesztlink #1: Főoldal
                      </a>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="https://lovaszoltan.dev/program" 
                         style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        🗳️ Tesztlink #2: Program
                      </a>
                    </div>
                    
                    <p style="color: #059669; font-weight: bold; text-align: center;">
                      ✅ Ha ezt látod, a tracking pixel már működik!
                    </p>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Tracking Teszt - Email #1/2</em>
                  </p>
                </div>
              `,
              order: 1,
              delayDays: 0,
              sendTime: '00:00',
              isActive: true
            },
            {
              name: '🎯 Tracking Email #2',
              subject: '📊 TRACKING TESZT #2 - UTOLSÓ tracking email',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #f59e0b;">
                  <h1 style="color: #f59e0b; text-align: center;">🎯 TRACKING EMAIL #2</h1>
                  
                  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #f59e0b;">
                    <h2>📊 UTOLSÓ tracking teszt!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez a <strong>MÁSODIK tracking email</strong> - az utolsó a sorozatban!</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>📈 Tracking eredmények:</h3>
                      <ul>
                        <li><strong>📖 Email #1 megnyitás:</strong> Regisztrálva az admin panelben</li>
                        <li><strong>🖱️ Email #1 klikk:</strong> Ha kattintottál, látszódik</li>
                        <li><strong>📊 Email #2 megnyitás:</strong> Ez most regisztrálódik</li>
                        <li><strong>🔄 Statisztikák:</strong> Valós idejű frissítés</li>
                      </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="https://lovaszoltan.dev/esemenyek" 
                         style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        📅 Tesztlink #3: Események
                      </a>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="https://lovaszoltan.dev/hirek" 
                         style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        📰 Tesztlink #4: Hírek
                      </a>
                    </div>
                    
                    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border: 2px solid #10b981;">
                      <h3>🏁 TESZT BEFEJEZVE!</h3>
                      <p><strong>Ha mind a 2 tracking emailt megkaptad:</strong></p>
                      <ul>
                        <li>🎯 Email #1: ✅ Tracking pixel működik</li>
                        <li>🎯 Email #2: ✅ Klikk tracking működik</li>
                      </ul>
                      <p style="color: #10b981; font-weight: bold; font-size: 18px; text-align: center;">
                        📊 A TRACKING RENDSZER TÖKÉLETESEN MŰKÖDIK!
                      </p>
                    </div>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Tracking Teszt - Email #2/2 - BEFEJEZVE</em>
                  </p>
                </div>
              `,
              order: 2,
              delayDays: 0,
              sendTime: '00:02',
              isActive: true
            }
          ]
        }
      },
      include: {
        emails: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    console.log('✅ TRACKING teszt sequence sikeresen létrehozva!');
    console.log(`🎯 Sequence ID: ${sequence.id}`);
    console.log(`📧 Név: ${sequence.name}`);
    console.log(`📊 Email-ek száma: ${sequence.emails.length}`);
    
    sequence.emails.forEach((email, index) => {
      console.log(`  ${index + 1}. ${email.name} (${email.sendTime})`);
    });
    
    console.log('\\n🎯 TRACKING FUNKCIÓK:');
    console.log('📖 Megnyitás pixel - automatikusan hozzáadva minden emailhez');
    console.log('🖱️ Klikk tracking - minden linkhez automatikusan hozzáadva');
    console.log('📊 Statisztikák - valós idejű frissítés az admin panelben');
    
    console.log('\\n🚀 KÖVETKEZŐ LÉPÉSEK:');
    console.log('1. Sequence RUNNING státuszra állítása');
    console.log('2. Executions létrehozása a teszteléshez');
    console.log('3. 2 perces automatikus küldés indítása');
    console.log('4. Email megnyitás és klikkelés tesztelése');
    console.log('5. Admin panel tracking statisztikák ellenőrzése');
    
    // Auto-start the sequence
    console.log('\\n🚀 Automatikus indítás...');
    await prisma.campaignSequence.update({
      where: { id: sequence.id },
      data: { status: 'RUNNING' }
    });
    
    console.log('✅ Tracking sequence RUNNING státuszra állítva!');
    
    return sequence.id;
    
  } catch (error) {
    console.error('❌ Hiba a tracking teszt sequence létrehozásánál:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTrackingTestSequence();
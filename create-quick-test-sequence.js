#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createQuickTestSequence() {
  try {
    console.log('🚀 GYORS TESZT Sequence létrehozása...');
    
    // Start time: 30 seconds from now
    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + 30);
    
    console.log(`⏰ Indítás: ${startTime.toLocaleString('hu-HU')}`);
    console.log(`📧 3 számozott email 1-2-3 perces késéssel`);
    
    const sequence = await prisma.campaignSequence.create({
      data: {
        name: '🧪 TESZT: 3 Email Sequence',
        description: 'Gyors teszt - 3 számozott email 1-2-3 perc késéssel',
        status: 'DRAFT',
        targetAudience: 'NEWSLETTER_SUBSCRIBERS',
        startDate: startTime,
        totalDuration: 3, // 3 perc
        autoEnroll: true,
        createdBy: 'Claude Code Quick Test',
        emails: {
          create: [
            {
              name: '📧 Email #1',
              subject: '🔥 TESZT EMAIL #1 - Azonnal',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #3b82f6;">
                  <h1 style="color: #3b82f6; text-align: center;">📧 EMAIL #1</h1>
                  
                  <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #3b82f6;">
                    <h2>🎯 Ez az ELSŐ email!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez a <strong>TESZT EMAIL #1</strong> ami azonnal küldésre kerül.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>📊 Teszt Információk:</h3>
                      <ul>
                        <li><strong>Email sorszám:</strong> #1</li>
                        <li><strong>Küldés ideje:</strong> Azonnal (0 perc késés)</li>
                        <li><strong>Következő email:</strong> 1 perc múlva (#2)</li>
                        <li><strong>Timestamp:</strong> {DATE}</li>
                      </ul>
                    </div>
                    
                    <p style="color: #059669; font-weight: bold;">✅ Ha megkaptad ezt az emailt, az #1 email működik!</p>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Sequence Teszt - Email #1/3</em>
                  </p>
                </div>
              `,
              order: 1,
              delayDays: 0,
              sendTime: '00:00', // Azonnal
              isActive: true
            },
            {
              name: '📧 Email #2',
              subject: '🔥 TESZT EMAIL #2 - 1 perc múlva',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #f59e0b;">
                  <h1 style="color: #f59e0b; text-align: center;">📧 EMAIL #2</h1>
                  
                  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #f59e0b;">
                    <h2>🎯 Ez a MÁSODIK email!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez a <strong>TESZT EMAIL #2</strong> ami 1 perc múlva került kiküldésre.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>📊 Teszt Információk:</h3>
                      <ul>
                        <li><strong>Email sorszám:</strong> #2</li>
                        <li><strong>Küldés ideje:</strong> 1 perc az #1 után</li>
                        <li><strong>Következő email:</strong> 2 perc múlva (#3)</li>
                        <li><strong>Timestamp:</strong> {DATE}</li>
                      </ul>
                    </div>
                    
                    <p style="color: #059669; font-weight: bold;">✅ Ha megkaptad ezt az emailt, az #2 email időzítés működik!</p>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Sequence Teszt - Email #2/3</em>
                  </p>
                </div>
              `,
              order: 2,
              delayDays: 0, // 0 nap (perc szinten számoljuk)
              sendTime: '00:01', // 1 perc múlva (hack: sendTime field-et használjuk)
              isActive: true
            },
            {
              name: '📧 Email #3',
              subject: '🔥 TESZT EMAIL #3 - 3 perc múlva UTOLSÓ',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #059669;">
                  <h1 style="color: #059669; text-align: center;">📧 EMAIL #3</h1>
                  
                  <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #059669;">
                    <h2>🎯 Ez a HARMADIK és UTOLSÓ email!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez a <strong>TESZT EMAIL #3</strong> ami 3 perc múlva került kiküldésre.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>📊 Teszt Információk:</h3>
                      <ul>
                        <li><strong>Email sorszám:</strong> #3 (UTOLSÓ)</li>
                        <li><strong>Küldés ideje:</strong> 3 perc az indítás után</li>
                        <li><strong>Sequence befejezve:</strong> ✅ Igen</li>
                        <li><strong>Timestamp:</strong> {DATE}</li>
                      </ul>
                    </div>
                    
                    <p style="color: #059669; font-weight: bold;">🎉 Ha megkaptad ezt az emailt, a TELJES SEQUENCE MŰKÖDIK!</p>
                    
                    <div style="background: #fee2e2; padding: 15px; border-radius: 6px; border: 1px solid #ef4444;">
                      <h3>🏁 TESZT EREDMÉNY:</h3>
                      <p>Ha mind a 3 emailt megkaptad:</p>
                      <ul>
                        <li>✅ Email #1: Azonnali küldés működik</li>
                        <li>✅ Email #2: 1 perces időzítés működik</li>
                        <li>✅ Email #3: 3 perces időzítés működik</li>
                        <li>🎯 <strong>SEQUENCE SYSTEM 100% MŰKÖDŐKÉPES!</strong></li>
                      </ul>
                    </div>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Sequence Teszt - Email #3/3 - BEFEJEZVE</em>
                  </p>
                </div>
              `,
              order: 3,
              delayDays: 0,
              sendTime: '00:03', // 3 perc múlva
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
    
    console.log('✅ TESZT sequence sikeresen létrehozva!');
    console.log(`📧 Sequence ID: ${sequence.id}`);
    console.log(`📧 Név: ${sequence.name}`);
    console.log(`📧 Email-ek száma: ${sequence.emails.length}`);
    
    sequence.emails.forEach((email, index) => {
      console.log(`  ${index + 1}. ${email.name} (${email.sendTime})`);
    });
    
    console.log('\n🎯 KÖVETKEZŐ LÉPÉSEK:');
    console.log('1. Sequence státusz RUNNING-ra állítása');
    console.log('2. Feliratkozók automatikus hozzáadása');
    console.log('3. Email küldés indítása');
    console.log('4. 3 perc alatt mind a 3 email megérkezik!');
    
    // Automatically start the sequence
    console.log('\n🚀 Automatikus indítás...');
    await prisma.campaignSequence.update({
      where: { id: sequence.id },
      data: { status: 'RUNNING' }
    });
    
    console.log('✅ Sequence RUNNING státuszra állítva!');
    console.log('📧 A scheduler automatikusan elkezdi a küldést!');
    
    return sequence.id;
    
  } catch (error) {
    console.error('❌ Hiba a teszt sequence létrehozásánál:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createQuickTestSequence();
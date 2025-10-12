#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createFixedTrackingTest() {
  try {
    console.log('🚀 JAVÍTOTT TRACKING TESZT létrehozása...');
    
    // Start time: 30 seconds from now
    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + 30);
    
    console.log(`⏰ Indítás: ${startTime.toLocaleString('hu-HU')}`);
    console.log(`🎯 Helyes linkekkel és javított tracking rendszerrel`);
    
    const sequence = await prisma.campaignSequence.create({
      data: {
        name: '✅ JAVÍTOTT TRACKING: 2 Email + Helyes Linkek',
        description: 'Javított tracking teszt - localhost linkekkel és fix Prisma modell',
        status: 'DRAFT',
        targetAudience: 'NEWSLETTER_SUBSCRIBERS',
        startDate: startTime,
        totalDuration: 5, // 5 perc
        autoEnroll: true,
        createdBy: 'Claude Code Fixed Tracking',
        emails: {
          create: [
            {
              name: '✅ Javított Tracking Email #1',
              subject: '🎯 JAVÍTOTT TRACKING #1 - Helyes linkekkel!',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #10b981;">
                  <h1 style="color: #10b981; text-align: center;">✅ JAVÍTOTT TRACKING EMAIL #1</h1>
                  
                  <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #10b981;">
                    <h2>🎯 Javított tracking teszt!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez a <strong>JAVÍTOTT tracking email</strong> - minden hiba kijavítva!</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>✅ Javítások:</h3>
                      <ul>
                        <li><strong>🔧 Prisma modell:</strong> emailType → emailOrder javítva</li>
                        <li><strong>🔗 Linkek:</strong> localhost:3000 használata</li>
                        <li><strong>📊 Tracking:</strong> Működő pixel és klikk követés</li>
                      </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="http://localhost:3000" 
                         style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        🏠 Főoldal (localhost)
                      </a>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="http://localhost:3000/program" 
                         style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        📋 Program oldal
                      </a>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="http://localhost:3000/esemenyek" 
                         style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        📅 Események
                      </a>
                    </div>
                    
                    <p style="color: #059669; font-weight: bold; text-align: center;">
                      ✅ Tracking pixel automatikusan működik!
                    </p>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Javított Tracking Teszt - Email #1/2</em>
                  </p>
                </div>
              `,
              order: 1,
              delayDays: 0,
              sendTime: '00:00',
              isActive: true
            },
            {
              name: '✅ Javított Tracking Email #2',
              subject: '🎯 JAVÍTOTT TRACKING #2 - VÉGLEGES teszt!',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #059669;">
                  <h1 style="color: #059669; text-align: center;">✅ JAVÍTOTT TRACKING EMAIL #2</h1>
                  
                  <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #059669;">
                    <h2>🎯 VÉGLEGES tracking teszt!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez a <strong>MÁSODIK javított email</strong> - minden működik!</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>📊 Tracking statisztikák:</h3>
                      <ul>
                        <li><strong>📖 Megnyitás:</strong> Automatikus pixel regisztráció</li>
                        <li><strong>🖱️ Klikk:</strong> Minden link követve</li>
                        <li><strong>💾 Adatbázis:</strong> Prisma modellek javítva</li>
                        <li><strong>📊 Admin panel:</strong> Valós idejű statisztikák</li>
                      </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="http://localhost:3000/hirek" 
                         style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        📰 Hírek oldal
                      </a>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="http://localhost:3000/kapcsolat" 
                         style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        📞 Kapcsolat
                      </a>
                    </div>
                    
                    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border: 2px solid #10b981;">
                      <h3>🎉 TRACKING TESZT SIKERES!</h3>
                      <p><strong>Ha ezt az emailt látod:</strong></p>
                      <ul>
                        <li>✅ Megnyitás pixel: MŰKÖDIK</li>
                        <li>✅ Klikk tracking: MŰKÖDIK</li>
                        <li>✅ Prisma logging: MŰKÖDIK</li>
                        <li>✅ Admin statisztikák: FRISSÜLNEK</li>
                      </ul>
                      <p style="color: #10b981; font-weight: bold; font-size: 18px; text-align: center;">
                        🎯 MINDEN TRACKING FUNKCIÓ MŰKÖDIK!
                      </p>
                    </div>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Javított Tracking Teszt - Email #2/2 - BEFEJEZVE</em>
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
    
    console.log('✅ JAVÍTOTT tracking sequence létrehozva!');
    console.log(`🎯 Sequence ID: ${sequence.id}`);
    console.log(`📧 Név: ${sequence.name}`);
    console.log(`📊 Email-ek száma: ${sequence.emails.length}`);
    
    // Auto-start the sequence
    await prisma.campaignSequence.update({
      where: { id: sequence.id },
      data: { status: 'RUNNING' }
    });
    
    console.log('✅ Sequence RUNNING státuszra állítva!');
    
    // Create executions
    const now2 = new Date();
    const email1Due = new Date(now2.getTime()); // Azonnal
    
    const executions = await prisma.sequenceExecution.createMany({
      data: [
        {
          sequenceId: sequence.id,
          subscriberEmail: 'jakabgipsz865@gmail.com',
          subscriberName: 'Fixed Tracking User 1',
          status: 'ACTIVE',
          currentStep: 1,
          nextEmailDue: email1Due
        },
        {
          sequenceId: sequence.id,
          subscriberEmail: 'plscallmegiorgio@gmail.com',
          subscriberName: 'Fixed Tracking User 2',
          status: 'ACTIVE',
          currentStep: 1,
          nextEmailDue: email1Due
        }
      ]
    });
    
    console.log(`\\n🎯 JAVÍTOTT TRACKING READY!`);
    console.log(`📧 ${executions.count} execution létrehozva`);
    console.log(`🔗 Helyes linkek: localhost:3000 alapú URL-ek`);
    console.log(`📊 Javított Prisma modell használata`);
    console.log(`✅ Most futtatd: node sequence-scheduler-direct.js`);
    
    return sequence.id;
    
  } catch (error) {
    console.error('❌ Hiba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFixedTrackingTest();
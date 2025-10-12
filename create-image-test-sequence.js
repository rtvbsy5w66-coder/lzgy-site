#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createImageTestSequence() {
  try {
    console.log('🚀 KÉPES TESZT Sequence létrehozása...');
    
    // Start time: 30 seconds from now
    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + 30);
    
    console.log(`⏰ Indítás: ${startTime.toLocaleString('hu-HU')}`);
    console.log(`🖼️ 4 különböző képes email 1-2-3-4 perces késéssel`);
    
    const sequence = await prisma.campaignSequence.create({
      data: {
        name: '🖼️ KÉPES TESZT: 4 Email + Images',
        description: 'Képekkel tesztelt sequence - 4 email különböző méretű képekkel',
        status: 'DRAFT',
        targetAudience: 'NEWSLETTER_SUBSCRIBERS',
        startDate: startTime,
        totalDuration: 10, // 10 perc
        autoEnroll: true,
        createdBy: 'Claude Code Image Test',
        emails: {
          create: [
            {
              name: '📷 Email #1 - Kis Kép',
              subject: '🎨 KÉPES TESZT #1 - Kicsi és Édes',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #3b82f6;">
                  <h1 style="color: #3b82f6; text-align: center;">📷 KÉPES EMAIL #1</h1>
                  
                  <div style="text-align: center; margin: 20px 0;">
                    <img src="https://picsum.photos/200/150?random=1" 
                         alt="Kis tesztképe" 
                         style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" 
                         width="200" height="150">
                    <p style="color: #666; font-size: 12px; margin-top: 8px;">Kis kép: 200×150px</p>
                  </div>
                  
                  <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #3b82f6;">
                    <h2>🎯 Ez az ELSŐ képes email!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez a <strong>KÉPES EMAIL #1</strong> egy kis, aranyos képpel.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>🖼️ Kép Információk:</h3>
                      <ul>
                        <li><strong>Méret:</strong> 200×150 pixel (kicsi)</li>
                        <li><strong>Típus:</strong> Landscape</li>
                        <li><strong>Küldés:</strong> Azonnal</li>
                        <li><strong>Következő:</strong> 1 perc múlva</li>
                      </ul>
                    </div>
                    
                    <p style="color: #059669; font-weight: bold;">✅ Kicsi képek gyorsan betöltődnek!</p>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Képes Sequence Teszt - Email #1/4</em>
                  </p>
                </div>
              `,
              order: 1,
              delayDays: 0,
              sendTime: '00:00',
              isActive: true
            },
            {
              name: '🖼️ Email #2 - Közepes Kép',
              subject: '🎨 KÉPES TESZT #2 - Közepes Méret',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #f59e0b;">
                  <h1 style="color: #f59e0b; text-align: center;">🖼️ KÉPES EMAIL #2</h1>
                  
                  <div style="text-align: center; margin: 20px 0;">
                    <img src="https://picsum.photos/400/300?random=2" 
                         alt="Közepes teszkép" 
                         style="border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15);" 
                         width="400" height="300">
                    <p style="color: #666; font-size: 12px; margin-top: 8px;">Közepes kép: 400×300px</p>
                  </div>
                  
                  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #f59e0b;">
                    <h2>🎯 Ez a MÁSODIK képes email!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez a <strong>KÉPES EMAIL #2</strong> egy közepes méretű gyönyörű képpel.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>🖼️ Kép Információk:</h3>
                      <ul>
                        <li><strong>Méret:</strong> 400×300 pixel (közepes)</li>
                        <li><strong>Típus:</strong> Standard 4:3 arány</li>
                        <li><strong>Küldés:</strong> 1 perc múlva</li>
                        <li><strong>Következő:</strong> 2 perc múlva (#3)</li>
                      </ul>
                    </div>
                    
                    <p style="color: #059669; font-weight: bold;">📷 Közepes képek ideálisak emailekhez!</p>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Képes Sequence Teszt - Email #2/4</em>
                  </p>
                </div>
              `,
              order: 2,
              delayDays: 0,
              sendTime: '00:01',
              isActive: true
            },
            {
              name: '🎭 Email #3 - Nagy Kép',
              subject: '🎨 KÉPES TESZT #3 - Nagy és Látványos',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #059669;">
                  <h1 style="color: #059669; text-align: center;">🎭 KÉPES EMAIL #3</h1>
                  
                  <div style="text-align: center; margin: 20px 0;">
                    <img src="https://picsum.photos/600/400?random=3" 
                         alt="Nagy tesztkép" 
                         style="border-radius: 16px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); max-width: 100%;" 
                         width="600" height="400">
                    <p style="color: #666; font-size: 12px; margin-top: 8px;">Nagy kép: 600×400px</p>
                  </div>
                  
                  <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #059669;">
                    <h2>🎯 Ez a HARMADIK képes email!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez a <strong>KÉPES EMAIL #3</strong> egy nagy, lenyűgöző képpel!</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>🖼️ Kép Információk:</h3>
                      <ul>
                        <li><strong>Méret:</strong> 600×400 pixel (nagy)</li>
                        <li><strong>Típus:</strong> Panoráma stílus</li>
                        <li><strong>Küldés:</strong> 3 perc múlva</li>
                        <li><strong>Következő:</strong> 1 perc múlva (#4 UTOLSÓ)</li>
                      </ul>
                    </div>
                    
                    <div style="background: #fee2e2; padding: 15px; border-radius: 6px; border: 1px solid #ef4444;">
                      <p><strong>🎨 Nagy képek hatásosak:</strong></p>
                      <ul>
                        <li>📱 Mobilon responsive</li>
                        <li>🖥️ Asztali gépen teljes méret</li>
                        <li>⚡ Optimalizált betöltés</li>
                      </ul>
                    </div>
                    
                    <p style="color: #059669; font-weight: bold;">🖼️ Nagy képek nagyobb hatást keltenek!</p>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Képes Sequence Teszt - Email #3/4</em>
                  </p>
                </div>
              `,
              order: 3,
              delayDays: 0,
              sendTime: '00:03',
              isActive: true
            },
            {
              name: '🌟 Email #4 - EXTRA Nagy Banner',
              subject: '🎨 KÉPES TESZT #4 - MEGA Banner UTOLSÓ',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #7c3aed;">
                  <h1 style="color: #7c3aed; text-align: center;">🌟 KÉPES EMAIL #4</h1>
                  
                  <div style="text-align: center; margin: 20px 0;">
                    <img src="https://picsum.photos/800/400?random=4" 
                         alt="Extra nagy banner" 
                         style="border-radius: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); max-width: 100%;" 
                         width="800" height="400">
                    <p style="color: #666; font-size: 12px; margin-top: 8px;">MEGA Banner: 800×400px</p>
                  </div>
                  
                  <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #7c3aed;">
                    <h2>🎯 Ez az UTOLSÓ és LEGNAGYOBB képes email!</h2>
                    <p><strong>Kedves {NAME}!</strong></p>
                    <p>Ez a <strong>KÉPES EMAIL #4</strong> egy óriási, lenyűgöző banner képpel zárja a sorozatot!</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                      <h3>🖼️ MEGA Banner Információk:</h3>
                      <ul>
                        <li><strong>Méret:</strong> 800×400 pixel (EXTRA NAGY)</li>
                        <li><strong>Típus:</strong> Wide Banner formátum</li>
                        <li><strong>Küldés:</strong> 4 perc múlva</li>
                        <li><strong>Státusz:</strong> ✅ UTOLSÓ EMAIL</li>
                      </ul>
                    </div>
                    
                    <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border: 2px solid #059669;">
                      <h3>🏁 TESZT ÖSSZEFOGLALÓ:</h3>
                      <p><strong>Ha mind a 4 képes emailt megkaptad:</strong></p>
                      <ul>
                        <li>📷 Email #1: ✅ Kis kép (200×150)</li>
                        <li>🖼️ Email #2: ✅ Közepes kép (400×300)</li>
                        <li>🎭 Email #3: ✅ Nagy kép (600×400)</li>
                        <li>🌟 Email #4: ✅ MEGA banner (800×400)</li>
                      </ul>
                      <p style="color: #059669; font-weight: bold; font-size: 18px;">
                        🎉 A KÉPES EMAIL SEQUENCE RENDSZER TÖKÉLETESEN MŰKÖDIK!
                      </p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="background: linear-gradient(45deg, #3b82f6, #7c3aed); color: white; padding: 15px; border-radius: 8px;">
                      <h3 style="margin: 0;">🎯 TESZT BEFEJEZVE!</h3>
                      <p style="margin: 5px 0;">Mind a 4 különböző méretű kép sikeresen elküldve!</p>
                    </div>
                  </div>
                  
                  <p style="text-align: center; color: #666; font-size: 12px;">
                    <em>Képes Sequence Teszt - Email #4/4 - BEFEJEZVE</em>
                  </p>
                </div>
              `,
              order: 4,
              delayDays: 0,
              sendTime: '00:04',
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
    
    console.log('✅ KÉPES teszt sequence sikeresen létrehozva!');
    console.log(`🖼️ Sequence ID: ${sequence.id}`);
    console.log(`📧 Név: ${sequence.name}`);
    console.log(`🎨 Email-ek száma: ${sequence.emails.length}`);
    
    sequence.emails.forEach((email, index) => {
      const sizes = ['200×150 (kis)', '400×300 (közepes)', '600×400 (nagy)', '800×400 (MEGA)'];
      console.log(`  ${index + 1}. ${email.name} - ${sizes[index]} (${email.sendTime})`);
    });
    
    console.log('\n🖼️ KÉPEK A TESZT EMAILEKBEN:');
    console.log('📷 Email #1: Kis kép (200×150px) - gyors betöltés');
    console.log('🖼️ Email #2: Közepes kép (400×300px) - standard');
    console.log('🎭 Email #3: Nagy kép (600×400px) - látványos');
    console.log('🌟 Email #4: MEGA banner (800×400px) - impozáns');
    
    console.log('\n🎯 KÖVETKEZŐ LÉPÉSEK:');
    console.log('1. Sequence RUNNING státuszra állítása');
    console.log('2. Executions létrehozása a teszteléshez');
    console.log('3. 4 perces automatikus küldés indítása');
    console.log('4. Mind a 4 különböző képes email megérkezik!');
    
    // Auto-start the sequence
    console.log('\n🚀 Automatikus indítás...');
    await prisma.campaignSequence.update({
      where: { id: sequence.id },
      data: { status: 'RUNNING' }
    });
    
    console.log('✅ Képes sequence RUNNING státuszra állítva!');
    
    return sequence.id;
    
  } catch (error) {
    console.error('❌ Hiba a képes teszt sequence létrehozásánál:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createImageTestSequence();
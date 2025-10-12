#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDemoSequence() {
  try {
    console.log('🚀 Demo Multi-Email Sequence létrehozása...');
    
    // Start date: tomorrow
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(9, 0, 0, 0);
    
    console.log(`📅 Indítás: ${startDate.toLocaleString('hu-HU')}`);
    
    const sequence = await prisma.campaignSequence.create({
      data: {
        name: 'DEMO: Diák Kampány 2025',
        description: 'Demonstrációs 4-email sorozat egyetemistáknak',
        status: 'DRAFT',
        targetAudience: 'STUDENTS',
        startDate: startDate,
        totalDuration: 28, // 4 hét
        autoEnroll: true,
        createdBy: 'Claude Code Demo',
        emails: {
          create: [
            {
              name: 'Üdvözlő Email',
              subject: '🎓 Üdvözlünk a Diák Programban!',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">🎓 Üdvözlünk, {NAME}!</h2>
                  
                  <p>Örülünk, hogy csatlakoztál a Diák Programunkhoz!</p>
                  
                  <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>📚 Mit kapsz a programban:</h3>
                    <ul>
                      <li>🎯 Célzott politikai képzések</li>
                      <li>🤝 Networking lehetőségek</li>
                      <li>📢 Közvetlen kapcsolat képviselőinkkel</li>
                      <li>💡 Projektlehetőségek</li>
                    </ul>
                  </div>
                  
                  <p>A következő héten részletes információkat küldeünk a programról!</p>
                  
                  <p>Üdvözlettel,<br><strong>Lovas Zoltán csapata</strong></p>
                </div>
              `,
              order: 1,
              delayDays: 0,
              sendTime: '09:00',
              isActive: true
            },
            {
              name: 'Program Bemutató',
              subject: '📋 Program részletek és lehetőségek',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">📋 Program Részletek</h2>
                  
                  <p>Kedves {NAME}!</p>
                  
                  <p>Ahogy ígértük, itt vannak a részletes információk a Diák Programról:</p>
                  
                  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>🗓️ Program ütemterv:</h3>
                    <ul>
                      <li><strong>1. hét:</strong> Bevezetés és célkitűzések</li>
                      <li><strong>2. hét:</strong> Politikai alapismeretek</li>
                      <li><strong>3. hét:</strong> Közösségi szerepvállalás</li>
                      <li><strong>4. hét:</strong> Gyakorlati projekt indítása</li>
                    </ul>
                  </div>
                  
                  <div style="background: #dcfce7; padding: 15px; border-radius: 6px;">
                    <p><strong>💡 Következő lépés:</strong> Várj a jövő heti esemény meghívót!</p>
                  </div>
                  
                  <p>Kérdés esetén bátran írj nekünk!</p>
                  
                  <p>Üdvözlettel,<br><strong>Lovas Zoltán csapata</strong></p>
                </div>
              `,
              order: 2,
              delayDays: 7,
              sendTime: '10:00',
              isActive: true
            },
            {
              name: 'Esemény Meghívó',
              subject: '🎪 Diák Találkozó - Jelentkezz most!',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">🎪 Diák Találkozó</h2>
                  
                  <p>Kedves {NAME}!</p>
                  
                  <p>Elérkezett az idő a személyes találkozásra!</p>
                  
                  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <h3>📅 Esemény részletek:</h3>
                    <ul>
                      <li><strong>Dátum:</strong> {DATE}</li>
                      <li><strong>Idő:</strong> 18:00 - 20:00</li>
                      <li><strong>Helyszín:</strong> Egyetem Aula</li>
                      <li><strong>Téma:</strong> "Fiatalok a politikában"</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      🎫 Jelentkezem az eseményre
                    </a>
                  </div>
                  
                  <p>Várunk szeretettel minden érdeklődőt!</p>
                  
                  <p>Üdvözlettel,<br><strong>Lovas Zoltán csapata</strong></p>
                </div>
              `,
              order: 3,
              delayDays: 14,
              sendTime: '17:00',
              isActive: true
            },
            {
              name: 'Összefoglaló és Következő Lépések',
              subject: '🚀 Programzárás és jövőbeli lehetőségek',
              content: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">🚀 Program Összefoglaló</h2>
                  
                  <p>Kedves {NAME}!</p>
                  
                  <p>Lejárt a 4 hetes Diák Programunk! Reméljük hasznos volt számodra.</p>
                  
                  <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>📊 Mit értünk el együtt:</h3>
                    <ul>
                      <li>✅ Alapismeretek megszerzése</li>
                      <li>✅ Networking lehetőségek</li>
                      <li>✅ Gyakorlati tapasztalat</li>
                      <li>✅ Közösségi kapcsolatok</li>
                    </ul>
                  </div>
                  
                  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>🔮 Következő lehetőségek:</h3>
                    <ul>
                      <li>🎯 Mentoring program</li>
                      <li>🏛️ Parlamenti látogatás</li>
                      <li>📝 Gyakornoki pozíciók</li>
                      <li>🎤 Közösségi szerepvállalás</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      💌 Érdekel a folytatás
                    </a>
                  </div>
                  
                  <p>Köszönjük a részvételt és várunk a következő programban!</p>
                  
                  <p>Üdvözlettel,<br><strong>Lovas Zoltán csapata</strong></p>
                </div>
              `,
              order: 4,
              delayDays: 28,
              sendTime: '11:00',
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
    
    console.log('✅ Demo sequence sikeresen létrehozva!');
    console.log(`📧 Sequence ID: ${sequence.id}`);
    console.log(`📧 Név: ${sequence.name}`);
    console.log(`📧 Email-ek száma: ${sequence.emails.length}`);
    
    sequence.emails.forEach((email, index) => {
      console.log(`  ${index + 1}. ${email.name} (${email.delayDays} nap múlva, ${email.sendTime})`);
    });
    
    console.log('\n🎯 KÖVETKEZŐ LÉPÉSEK:');
    console.log('1. Menj az /admin/sequences oldalra');
    console.log('2. Állítsd "RUNNING" státuszra a sequence-t');
    console.log('3. A scheduler automatikusan hozzáadja a feliratkozókat');
    console.log('4. Monitorozd a küldést az admin felületen');
    
  } catch (error) {
    console.error('❌ Hiba a demo sequence létrehozásánál:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoSequence();
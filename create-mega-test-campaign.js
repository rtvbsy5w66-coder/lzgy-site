#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMegaTestCampaign() {
  try {
    console.log('🚀 MEGA TESZT KAMPÁNY létrehozása...');
    console.log('💥 4 email + képek + linkek + minden funkció!');
    
    // Start time: 30 seconds from now
    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + 30);
    
    console.log(`⏰ Indítás: ${startTime.toLocaleString('hu-HU')}`);
    
    const sequence = await prisma.campaignSequence.create({
      data: {
        name: '🔥 MEGA TESZT: Teljes Kampány + Tracking',
        description: 'Komplett teszt kampány - 4 email, képek, linkek, kvízek, események, hírek + teljes tracking',
        status: 'DRAFT',
        targetAudience: 'NEWSLETTER_SUBSCRIBERS',
        startDate: startTime,
        totalDuration: 10, // 10 perc
        autoEnroll: true,
        createdBy: 'Claude Code MEGA Test',
        emails: {
          create: [
            {
              name: '🎉 Üdvözlő Email - Képekkel',
              subject: '🔥 ÜDVÖZÖLLEK! Minden funkció egy helyen 🎯',
              content: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                  
                  <!-- Header Section -->
                  <div style="text-align: center; padding: 30px 20px; background: white; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <img src="https://picsum.photos/400/200?random=1" 
                         alt="Üdvözlő banner" 
                         style="border-radius: 12px; width: 100%; max-width: 400px; height: auto; margin-bottom: 20px;" />
                    
                    <h1 style="color: #2d3748; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">
                      🎉 Üdvözöllek, {NAME}!
                    </h1>
                    <p style="color: #4a5568; font-size: 18px; margin: 0;">
                      Ez a <strong>MEGA teszt kampány</strong> első emailje!
                    </p>
                  </div>

                  <!-- Features Section -->
                  <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="color: #2d3748; margin-top: 0;">🔥 Mit tartalmaz ez a kampány?</h2>
                    
                    <div style="display: grid; gap: 15px;">
                      <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3182ce;">
                        <strong style="color: #2d3748;">📸 Képek</strong><br>
                        <span style="color: #4a5568;">Minden méretben: 200px-tól 800px-ig</span>
                      </div>
                      
                      <div style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #38a169;">
                        <strong style="color: #2d3748;">🔗 Linkek mindenhová</strong><br>
                        <span style="color: #4a5568;">Főoldal, program, hírek, események, kvízek</span>
                      </div>
                      
                      <div style="background: #fffaf0; padding: 15px; border-radius: 8px; border-left: 4px solid #ed8936;">
                        <strong style="color: #2d3748;">📊 Teljes tracking</strong><br>
                        <span style="color: #4a5568;">Megnyitás + klikk követés valós időben</span>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div style="background: white; padding: 25px; border-radius: 12px; text-align: center;">
                    <h3 style="color: #2d3748; margin-top: 0;">🎯 Kezdjük a tesztelést!</h3>
                    
                    <div style="margin: 20px 0;">
                      <a href="http://localhost:3000" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
                        🏠 Főoldal
                      </a>
                      
                      <a href="http://localhost:3000/program" 
                         style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
                        📋 Program
                      </a>
                    </div>
                    
                    <div style="margin: 20px 0;">
                      <a href="http://localhost:3000/hirek" 
                         style="display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
                        📰 Hírek
                      </a>
                      
                      <a href="http://localhost:3000/esemenyek" 
                         style="display: inline-block; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
                        📅 Események
                      </a>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="text-align: center; color: white; padding: 20px; font-size: 14px;">
                    <p>✅ Email #1/4 - MEGA Teszt Kampány</p>
                    <p>⏰ Következő email: 1 perc múlva</p>
                  </div>
                </div>
              `,
              order: 1,
              delayDays: 0,
              sendTime: '00:00',
              isActive: true
            },
            {
              name: '📊 Quiz & Szavazás Email',
              subject: '🎯 Kvíz és szavazás - teszteld tudásod! 🗳️',
              content: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 16px;">
                  
                  <!-- Header -->
                  <div style="text-align: center; padding: 30px 20px; background: white; border-radius: 12px; margin-bottom: 20px;">
                    <img src="https://picsum.photos/350/200?random=2" 
                         alt="Quiz banner" 
                         style="border-radius: 12px; width: 100%; max-width: 350px; height: auto; margin-bottom: 20px;" />
                    
                    <h1 style="color: #2d3748; margin: 0 0 10px 0; font-size: 26px;">
                      🎯 Kvíz Idő, {NAME}!
                    </h1>
                    <p style="color: #4a5568; font-size: 16px;">
                      Email #2 - Interaktív tartalom tesztelése
                    </p>
                  </div>

                  <!-- Quiz Section -->
                  <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="color: #2d3748; margin-top: 0;">🧠 Politikai Kvíz</h2>
                    <p style="color: #4a5568;">Teszteld tudásod és szerezz pontokat!</p>
                    
                    <div style="background: #e6fffa; padding: 20px; border-radius: 8px; border: 2px solid #38b2ac; margin: 15px 0;">
                      <h3 style="color: #234e52; margin: 0 0 10px 0;">📝 Minta kérdés:</h3>
                      <p style="color: #2d3748; font-weight: bold;">"Mikor lesz a következő választás?"</p>
                      <p style="color: #4a5568; font-size: 14px;">Válaszd ki a helyes opciót és szerezz pontokat!</p>
                    </div>

                    <div style="text-align: center; margin: 20px 0;">
                      <a href="http://localhost:3000/kviz" 
                         style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                        🧠 Kvíz Indítása
                      </a>
                    </div>
                  </div>

                  <!-- Voting Section -->
                  <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="color: #2d3748; margin-top: 0;">🗳️ Szavazások</h2>
                    <p style="color: #4a5568;">Mondd el véleményedet fontos kérdésekben!</p>
                    
                    <div style="background: #fff5f5; padding: 20px; border-radius: 8px; border: 2px solid #f56565; margin: 15px 0;">
                      <h3 style="color: #742a2a; margin: 0 0 10px 0;">🔥 Aktuális szavazás:</h3>
                      <p style="color: #2d3748; font-weight: bold;">"Melyik a legfontosabb téma?"</p>
                      <p style="color: #4a5568; font-size: 14px;">Szavazz és lásd az eredményeket!</p>
                    </div>

                    <div style="text-align: center; margin: 20px 0;">
                      <a href="http://localhost:3000/szavazasok" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                        🗳️ Szavazás
                      </a>
                    </div>
                  </div>

                  <!-- Additional Links -->
                  <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <h3 style="color: #2d3748; margin-top: 0;">🔗 További linkek:</h3>
                    
                    <a href="http://localhost:3000/peticiok" 
                       style="display: inline-block; background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px;">
                      📝 Petíciók
                    </a>
                    
                    <a href="http://localhost:3000/kapcsolat" 
                       style="display: inline-block; background: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px;">
                      📞 Kapcsolat
                    </a>
                  </div>

                  <!-- Footer -->
                  <div style="text-align: center; color: white; padding: 20px; font-size: 14px;">
                    <p>📊 Email #2/4 - Quiz & Szavazás</p>
                    <p>⏰ Következő email: 2 perc múlva</p>
                  </div>
                </div>
              `,
              order: 2,
              delayDays: 0,
              sendTime: '00:01',
              isActive: true
            },
            {
              name: '📰 Hírek & Események Email',
              subject: '📅 Friss hírek és események - ne maradj le! 🔥',
              content: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 16px;">
                  
                  <!-- Header -->
                  <div style="text-align: center; padding: 30px 20px; background: white; border-radius: 12px; margin-bottom: 20px;">
                    <img src="https://picsum.photos/450/250?random=3" 
                         alt="Hírek banner" 
                         style="border-radius: 12px; width: 100%; max-width: 450px; height: auto; margin-bottom: 20px;" />
                    
                    <h1 style="color: #2d3748; margin: 0 0 10px 0; font-size: 26px;">
                      📰 Friss Hírek, {NAME}!
                    </h1>
                    <p style="color: #4a5568; font-size: 16px;">
                      Email #3 - Hírek és események frissítések
                    </p>
                  </div>

                  <!-- News Section -->
                  <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="color: #2d3748; margin-top: 0;">📰 Legfrissebb Hírek</h2>
                    
                    <div style="border-left: 4px solid #4299e1; padding-left: 15px; margin: 20px 0;">
                      <h3 style="color: #2d3748; margin: 0 0 8px 0; font-size: 18px;">🔥 Kiemelt hír</h3>
                      <p style="color: #4a5568; margin: 0 0 10px 0;">
                        "Új fejlesztések az email kampány rendszerben - teljes tracking implementálva!"
                      </p>
                      <a href="http://localhost:3000/hirek" 
                         style="color: #4299e1; text-decoration: none; font-weight: bold;">
                        📖 Teljes cikk olvasása →
                      </a>
                    </div>

                    <div style="background: #ebf8ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                      <p style="color: #2d3748; margin: 0; font-weight: bold;">💡 Tudtad?</p>
                      <p style="color: #4a5568; margin: 5px 0 0 0; font-size: 14px;">
                        Az email tracking mostantól valós időben működik minden kampányban!
                      </p>
                    </div>

                    <div style="text-align: center; margin: 20px 0;">
                      <a href="http://localhost:3000/hirek" 
                         style="display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                        📰 Összes Hír
                      </a>
                    </div>
                  </div>

                  <!-- Events Section -->
                  <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="color: #2d3748; margin-top: 0;">📅 Közelgő Események</h2>
                    
                    <div style="background: #f0fff4; padding: 20px; border-radius: 8px; border: 2px solid #48bb78; margin: 15px 0;">
                      <h3 style="color: #22543d; margin: 0 0 10px 0;">🎉 Következő esemény:</h3>
                      <p style="color: #2d3748; font-weight: bold; margin: 0 0 5px 0;">
                        "Email Marketing Workshop"
                      </p>
                      <p style="color: #4a5568; margin: 0 0 5px 0;">📅 Dátum: 2025. október 15.</p>
                      <p style="color: #4a5568; margin: 0; font-size: 14px;">
                        Tanuld meg a legújabb email marketing trendeket!
                      </p>
                    </div>

                    <div style="text-align: center; margin: 20px 0;">
                      <a href="http://localhost:3000/esemenyek" 
                         style="display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38f9d7 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                        📅 Események Böngészése
                      </a>
                    </div>
                  </div>

                  <!-- Profile Section -->
                  <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <h3 style="color: #2d3748; margin-top: 0;">👤 Profil Frissítés</h3>
                    <p style="color: #4a5568; margin-bottom: 15px;">
                      Frissítsd adataidat és állítsd be a preferenciáidat!
                    </p>
                    
                    <a href="http://localhost:3000/profil" 
                       style="display: inline-block; background: #805ad5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      👤 Profil Szerkesztése
                    </a>
                  </div>

                  <!-- Footer -->
                  <div style="text-align: center; color: white; padding: 20px; font-size: 14px;">
                    <p>📰 Email #3/4 - Hírek & Események</p>
                    <p>⏰ Utolsó email: 3 perc múlva</p>
                  </div>
                </div>
              `,
              order: 3,
              delayDays: 0,
              sendTime: '00:03',
              isActive: true
            },
            {
              name: '🎯 Záró Email - Összefoglaló',
              subject: '🏁 MEGA Teszt Befejezve - Minden funkció tesztelve! 🚀',
              content: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                  
                  <!-- Header -->
                  <div style="text-align: center; padding: 30px 20px; background: white; border-radius: 12px; margin-bottom: 20px;">
                    <img src="https://picsum.photos/500/300?random=4" 
                         alt="Befejezés banner" 
                         style="border-radius: 12px; width: 100%; max-width: 500px; height: auto; margin-bottom: 20px;" />
                    
                    <h1 style="color: #2d3748; margin: 0 0 10px 0; font-size: 28px;">
                      🏁 Teszt Befejezve!
                    </h1>
                    <p style="color: #4a5568; font-size: 18px;">
                      Gratulálok, {NAME}! Minden funkciót teszteltél! 🎉
                    </p>
                  </div>

                  <!-- Success Summary -->
                  <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="color: #2d3748; margin-top: 0;">🎯 Teszt Eredmények</h2>
                    
                    <div style="background: #f0fff4; padding: 20px; border-radius: 12px; border: 3px solid #48bb78;">
                      <h3 style="color: #22543d; margin: 0 0 15px 0; text-align: center;">
                        ✅ MINDEN FUNKCIÓ MŰKÖDIK!
                      </h3>
                      
                      <div style="display: grid; gap: 10px;">
                        <div style="background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #48bb78;">
                          <strong style="color: #2d3748;">📧 Email küldés:</strong>
                          <span style="color: #4a5568;"> 4/4 email sikeresen elküldve</span>
                        </div>
                        
                        <div style="background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #4299e1;">
                          <strong style="color: #2d3748;">📊 Tracking:</strong>
                          <span style="color: #4a5568;"> Megnyitás és klikk követés aktív</span>
                        </div>
                        
                        <div style="background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #ed8936;">
                          <strong style="color: #2d3748;">🖼️ Képek:</strong>
                          <span style="color: #4a5568;"> Minden méretben betöltődik</span>
                        </div>
                        
                        <div style="background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #805ad5;">
                          <strong style="color: #2d3748;">🔗 Linkek:</strong>
                          <span style="color: #4a5568;"> Minden oldal elérhető</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Features Tested -->
                  <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="color: #2d3748; margin-top: 0;">🚀 Tesztelt Funkciók</h2>
                    
                    <div style="display: grid; gap: 15px;">
                      <div style="background: #ebf8ff; padding: 15px; border-radius: 8px;">
                        <h3 style="color: #2d3748; margin: 0 0 8px 0; font-size: 16px;">📊 Admin Panel</h3>
                        <p style="color: #4a5568; margin: 0; font-size: 14px;">
                          Sequence management, statisztikák, valós idejű frissítések
                        </p>
                      </div>
                      
                      <div style="background: #f0fff4; padding: 15px; border-radius: 8px;">
                        <h3 style="color: #2d3748; margin: 0 0 8px 0; font-size: 16px;">🎯 Email Tracking</h3>
                        <p style="color: #4a5568; margin: 0; font-size: 14px;">
                          Megnyitás pixel, klikk követés, performance mérés
                        </p>
                      </div>
                      
                      <div style="background: #fffaf0; padding: 15px; border-radius: 8px;">
                        <h3 style="color: #2d3748; margin: 0 0 8px 0; font-size: 16px;">🔗 Link Integration</h3>
                        <p style="color: #4a5568; margin: 0; font-size: 14px;">
                          Főoldal, hírek, események, kvízek, szavazások, petíciók
                        </p>
                      </div>
                      
                      <div style="background: #fdf2f8; padding: 15px; border-radius: 8px;">
                        <h3 style="color: #2d3748; margin: 0 0 8px 0; font-size: 16px;">🖼️ Responsive Design</h3>
                        <p style="color: #4a5568; margin: 0; font-size: 14px;">
                          Mobil és desktop optimalizált email template-ek
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Final CTA -->
                  <div style="background: white; padding: 25px; border-radius: 12px; text-align: center;">
                    <h2 style="color: #2d3748; margin-top: 0;">🎉 Mi a következő lépés?</h2>
                    
                    <div style="margin: 20px 0;">
                      <a href="http://localhost:3000/admin/sequences" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 10px;">
                        📊 Admin Panel
                      </a>
                      
                      <a href="http://localhost:3000" 
                         style="display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38f9d7 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 10px;">
                        🏠 Főoldal
                      </a>
                    </div>
                    
                    <p style="color: #4a5568; font-size: 14px; margin: 20px 0 0 0;">
                      Ellenőrizd az admin panelben a tracking statisztikákat!
                    </p>
                  </div>

                  <!-- Footer -->
                  <div style="text-align: center; color: white; padding: 20px; font-size: 14px;">
                    <p>🏁 Email #4/4 - MEGA Teszt Befejezve</p>
                    <p>🎯 Minden funkció sikeresen tesztelve!</p>
                    <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                      MEGA Test Campaign - Claude Code Implementation
                    </p>
                  </div>
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
    
    console.log('✅ MEGA TESZT KAMPÁNY sikeresen létrehozva!');
    console.log(`🔥 Sequence ID: ${sequence.id}`);
    console.log(`📧 Név: ${sequence.name}`);
    console.log(`🎯 Email-ek száma: ${sequence.emails.length}`);
    
    sequence.emails.forEach((email, index) => {
      console.log(`  ${index + 1}. ${email.name} (${email.sendTime})`);
    });
    
    // Auto-start the sequence
    console.log('\\n🚀 Automatikus indítás...');
    await prisma.campaignSequence.update({
      where: { id: sequence.id },
      data: { status: 'RUNNING' }
    });
    
    console.log('✅ MEGA sequence RUNNING státuszra állítva!');
    
    // Create executions
    const now2 = new Date();
    const email1Due = new Date(now2.getTime()); // Azonnal
    
    const executions = await prisma.sequenceExecution.createMany({
      data: [
        {
          sequenceId: sequence.id,
          subscriberEmail: 'jakabgipsz865@gmail.com',
          subscriberName: 'MEGA Test User 1',
          status: 'ACTIVE',
          currentStep: 1,
          nextEmailDue: email1Due
        },
        {
          sequenceId: sequence.id,
          subscriberEmail: 'plscallmegiorgio@gmail.com',
          subscriberName: 'MEGA Test User 2',
          status: 'ACTIVE',
          currentStep: 1,
          nextEmailDue: email1Due
        }
      ]
    });
    
    console.log(`\\n🔥 MEGA TESZT KAMPÁNY READY!`);
    console.log(`📧 ${executions.count} execution létrehozva`);
    console.log(`🎯 4 email: Üdvözlő → Quiz → Hírek → Záró`);
    console.log(`🖼️ Képek: 200px, 350px, 450px, 500px`);
    console.log(`🔗 Linkek: Minden oldal (főoldal, program, hírek, események, kvíz, szavazás, petíció, profil, kapcsolat, admin)`);
    console.log(`📊 Tracking: Teljes megnyitás és klikk követés`);
    console.log(`🚀 Indítás: AZONNAL!`);
    console.log(`\\n💥 FUTTATD: node sequence-scheduler-direct.js`);
    
    return sequence.id;
    
  } catch (error) {
    console.error('❌ Hiba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMegaTestCampaign();
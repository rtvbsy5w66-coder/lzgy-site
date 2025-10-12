import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// For now, we'll store templates in memory or local storage
// Later you can add a newsletter_templates table to the database

let templates: Array<{
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  frequency?: string;
  createdAt: string;
}> = [
  {
    id: 'template-1',
    name: 'Heti politikai összefoglaló',
    subject: 'Heti összefoglaló - {DATE}',
    category: 'weekly',
    frequency: 'heti',
    content: `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h2 style="color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
    📊 Heti politikai összefoglaló
  </h2>

  <p>Kedves {NAME}!</p>
  
  <p>Íme a hét legfontosabb politikai eseményei és fejleményei:</p>

  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #3b82f6; margin-top: 0;">🗳️ Politikai hírek</h3>
    <ul style="line-height: 1.6;">
      <li><strong>[FONTOS HÍR 1]</strong> - [részletek]</li>
      <li><strong>[FONTOS HÍR 2]</strong> - [részletek]</li>
      <li><strong>[HELYI HÍR]</strong> - [V. kerületi fejlemények]</li>
    </ul>
  </div>

  <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #059669; margin-top: 0;">📅 Közelgő események</h3>
    <ul style="line-height: 1.6;">
      <li><strong>[ESEMÉNY 1]</strong> - [DÁTUM] - <a href="[LINK]">Részletek</a></li>
      <li><strong>[ESEMÉNY 2]</strong> - [DÁTUM] - <a href="[LINK]">Regisztráció</a></li>
    </ul>
  </div>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #d97706; margin-top: 0;">💡 Véleménynyilvánítási lehetőségek</h3>
    <p>Várjuk véleményét az aktuális kérdésekről:</p>
    <ul>
      <li><a href="[POLL_LINK]">Szavazás: [TÉMA]</a></li>
      <li><a href="[CONTACT_LINK]">Kapcsolatfelvétel</a></li>
    </ul>
  </div>

  <p style="margin-top: 30px;">
    Köszönöm a figyelmet!<br>
    <strong>Lovas Zoltán</strong>
  </p>
</div>`,
    createdAt: new Date().toISOString()
  },
  {
    id: 'template-2',
    name: 'Esemény meghívó',
    subject: 'Meghívó: {EVENT_NAME} - {DATE}',
    category: 'event',
    content: `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 28px;">🎉 Meghívó</h1>
    <h2 style="margin: 10px 0 0 0; font-weight: normal; opacity: 0.9;">{EVENT_NAME}</h2>
  </div>

  <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1f2937; margin-top: 0;">📋 Esemény részletei</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">📅 Időpont:</td>
        <td style="padding: 8px 0;">{DATE_TIME}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">📍 Helyszín:</td>
        <td style="padding: 8px 0;">{LOCATION}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">🎯 Téma:</td>
        <td style="padding: 8px 0;">{TOPIC}</td>
      </tr>
    </table>
  </div>

  <div style="margin: 25px 0;">
    <h3 style="color: #1f2937;">🗓️ Program</h3>
    <ul style="line-height: 1.8; padding-left: 20px;">
      <li><strong>{TIME_1}</strong> - {PROGRAM_1}</li>
      <li><strong>{TIME_2}</strong> - {PROGRAM_2}</li>
      <li><strong>{TIME_3}</strong> - {PROGRAM_3}</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <p style="margin-bottom: 20px;">Az esemény <strong>ingyenes</strong>, de előzetes regisztráció szükséges.</p>
    <a href="{REGISTRATION_LINK}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
      ✅ Regisztrálok
    </a>
  </div>

  <p>Várjuk szeretettel! 🤝</p>
</div>`,
    createdAt: new Date().toISOString()
  },
  {
    id: 'template-3',
    name: 'Havi beszámoló',
    subject: 'Havi beszámoló - {MONTH} {YEAR}',
    category: 'monthly',
    frequency: 'havi',
    content: `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h2 style="color: #1f2937; background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; text-align: center;">
    📈 {MONTH} havi beszámoló
  </h2>

  <p>Kedves {NAME}!</p>
  
  <p>Összefoglalom a {MONTH} hónap legfontosabb eseményeit és eredményeit:</p>

  <div style="background: #dbeafe; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #3b82f6;">
    <h3 style="color: #1e40af; margin-top: 0;">🏛️ Parlamenti munka</h3>
    <ul style="line-height: 1.7;">
      <li><strong>Benyújtott javaslatok:</strong> {PROPOSALS_COUNT} db</li>
      <li><strong>Parlamenti felszólalások:</strong> {SPEECHES_COUNT} db</li>
      <li><strong>Bizottsági ülések:</strong> {COMMITTEE_MEETINGS} db</li>
    </ul>
    <p><a href="{PARLIAMENT_LINK}">📋 Részletes parlamenti aktivitás</a></p>
  </div>

  <div style="background: #ecfdf5; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #10b981;">
    <h3 style="color: #047857; margin-top: 0;">🏘️ Helyi közösségi munka</h3>
    <ul style="line-height: 1.7;">
      <li><strong>Lakossági fórumok:</strong> {FORUMS_COUNT} db</li>
      <li><strong>Fogadóórák:</strong> {OFFICE_HOURS} óra</li>
      <li><strong>Megoldott ügyek:</strong> {RESOLVED_CASES} db</li>
    </ul>
  </div>

  <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #f59e0b;">
    <h3 style="color: #d97706; margin-top: 0;">📊 Statisztikák</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Hírlevél feliratkozók:</td>
        <td style="padding: 8px 0; text-align: right;">{SUBSCRIBER_COUNT} fő</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Esemény résztvevők:</td>
        <td style="padding: 8px 0; text-align: right;">{EVENT_PARTICIPANTS} fő</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Online szavazások:</td>
        <td style="padding: 8px 0; text-align: right;">{POLL_VOTES} szavazat</td>
      </tr>
    </table>
  </div>

  <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; margin: 25px 0;">
    <h3 style="color: #1f2937; margin-top: 0;">🎯 Következő hónap tervei</h3>
    <ul style="line-height: 1.7;">
      <li>{NEXT_MONTH_PLAN_1}</li>
      <li>{NEXT_MONTH_PLAN_2}</li>
      <li>{NEXT_MONTH_PLAN_3}</li>
    </ul>
  </div>

  <p style="margin-top: 30px; text-align: center; color: #6b7280;">
    Köszönöm a bizalmat és támogatást!<br>
    <strong style="color: #1f2937;">Lovas Zoltán</strong>
  </p>
</div>`,
    createdAt: new Date().toISOString()
  },
  {
    id: 'template-4',
    name: 'Sürgős közlemény',
    subject: '🚨 Sürgős: {TOPIC}',
    category: 'urgent',
    content: `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: #fee2e2; border: 2px solid #fca5a5; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
    <h2 style="color: #dc2626; margin: 0; text-align: center; font-size: 24px;">
      🚨 SÜRGŐS KÖZLEMÉNY
    </h2>
  </div>

  <p>Kedves {NAME}!</p>

  <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 5px solid #ef4444; margin: 20px 0;">
    <h3 style="color: #dc2626; margin-top: 0;">⚠️ {TOPIC}</h3>
    <p style="font-size: 16px; line-height: 1.6; margin: 0;">
      {URGENT_MESSAGE}
    </p>
  </div>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #0369a1; margin-top: 0;">📋 Mit tehetsz?</h3>
    <ul style="line-height: 1.7;">
      <li>{ACTION_1}</li>
      <li>{ACTION_2}</li>
      <li>{ACTION_3}</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 25px 0;">
    <a href="{ACTION_LINK}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
      🎯 Azonnali cselekvés
    </a>
  </div>

  <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      <strong>Kapcsolat:</strong><br>
      📧 Email: {CONTACT_EMAIL}<br>
      📞 Telefon: {CONTACT_PHONE}<br>
      🕒 Fogadóóra: {OFFICE_HOURS}
    </p>
  </div>

  <p style="margin-top: 25px;">
    Köszönöm a figyelmet és a gyors reagálást!<br>
    <strong>Lovas Zoltán</strong>
  </p>
</div>`,
    createdAt: new Date().toISOString()
  },
  {
    id: 'template-5',
    name: 'Szavazási felhívás',
    subject: '🗳️ Szavazzon: {POLL_TOPIC}',
    category: 'poll',
    content: `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
    <h1 style="margin: 0; font-size: 26px;">🗳️ Közösségi szavazás</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">{POLL_TOPIC}</p>
  </div>

  <p>Kedves {NAME}!</p>

  <p>Véleménye fontos számunkra! Kérjük, vegyen részt a következő szavazásban:</p>

  <div style="background: #f5f3ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #8b5cf6;">
    <h3 style="color: #6d28d9; margin-top: 0;">❓ Kérdés</h3>
    <p style="font-size: 18px; font-weight: 500; color: #1f2937; margin: 15px 0;">
      {POLL_QUESTION}
    </p>

    <div style="background: white; padding: 20px; border-radius: 6px; margin: 15px 0;">
      <h4 style="color: #4b5563; margin-top: 0; margin-bottom: 15px;">Válaszlehetőségek:</h4>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">✅ {OPTION_1}</li>
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">✅ {OPTION_2}</li>
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">✅ {OPTION_3}</li>
        <li style="padding: 8px 0;">✅ {OPTION_4}</li>
      </ul>
    </div>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{POLL_LINK}" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 18px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
      🗳️ Szavazok most
    </a>
  </div>

  <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="color: #047857; margin-top: 0; font-size: 16px;">ℹ️ Fontos tudnivalók</h3>
    <ul style="line-height: 1.6; color: #065f46; margin: 0; font-size: 14px;">
      <li><strong>Szavazás vége:</strong> {DEADLINE}</li>
      <li><strong>Résztvevők:</strong> {ELIGIBLE_VOTERS}</li>
      <li><strong>Eredmény közzététele:</strong> {RESULTS_DATE}</li>
      <li>A szavazás anonim és biztonságos</li>
    </ul>
  </div>

  <p style="margin-top: 25px;">
    Köszönöm a részvételt!<br>
    <strong>Lovas Zoltán</strong>
  </p>

  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="margin: 0; color: #6b7280; font-size: 12px;">
      📊 <a href="{RESULTS_LINK}" style="color: #6b7280;">Eddigi eredmények megtekintése</a>
    </p>
  </div>
</div>`,
    createdAt: new Date().toISOString()
  }
];

// GET /api/admin/newsletter/templates - Get all newsletter templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Error fetching newsletter templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/admin/newsletter/templates - Create new template
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { name, subject, content, category = 'custom' } = await request.json();

    if (!name || !subject || !content) {
      return NextResponse.json(
        { error: 'Name, subject, and content are required' },
        { status: 400 }
      );
    }

    const newTemplate = {
      id: `template-${Date.now()}`,
      name,
      subject,
      content,
      category,
      createdAt: new Date().toISOString()
    };

    templates.push(newTemplate);

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Template created successfully'
    });

  } catch (error) {
    console.error('Error creating newsletter template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
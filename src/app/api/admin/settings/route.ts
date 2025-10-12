import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Default settings structure
const DEFAULT_SETTINGS = {
  general: {
    site_name: 'Lovas Zoltán',
    site_description: 'Hivatalos politikai oldal',
    site_tagline: 'Együtt a jövőért',
    contact_email: 'lovas.zoltan1986@gmail.com',
    contact_phone: '',
    office_address: '',
  },
  email: {
    smtp_host: process.env.EMAIL_HOST || '',
    smtp_port: process.env.EMAIL_PORT || '587',
    smtp_user: process.env.EMAIL_USER || '',
    smtp_from_name: 'Lovas Zoltán',
    smtp_from_email: process.env.EMAIL_FROM || 'noreply@lovaszoltan.dev',
    admin_notification_email: 'lovas.zoltan1986@gmail.com',
  },
  social: {
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
  },
  seo: {
    meta_title: 'Lovas Zoltán - Hivatalos Oldal',
    meta_description: 'Lovas Zoltán hivatalos politikai oldala',
    meta_keywords: 'lovas zoltán, politika, helyi politika',
    google_analytics_id: '',
    google_site_verification: '',
  },
  features: {
    enable_petitions: true,
    enable_polls: true,
    enable_events: true,
    enable_blog: true,
    enable_newsletter: true,
    enable_comments: true,
    enable_user_registration: true,
  },
};

// GET - Fetch all settings grouped by category
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all settings from database
    const dbSettings = await prisma.siteSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Group settings by category
    const settings: any = {};
    for (const [category, defaults] of Object.entries(DEFAULT_SETTINGS)) {
      settings[category] = { ...defaults };
    }

    // Override with database values
    dbSettings.forEach((setting) => {
      if (settings[setting.category]) {
        try {
          // Try to parse as JSON first
          settings[setting.category][setting.key] = JSON.parse(setting.value);
        } catch {
          // If not valid JSON, use as string
          settings[setting.category][setting.key] = setting.value;
        }
      }
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[Admin Settings GET] Error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a beállítások lekérdezésekor' },
      { status: 500 }
    );
  }
}

// PATCH - Update settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, key, value } = await request.json();

    if (!category || !key) {
      return NextResponse.json(
        { error: 'Kategória és kulcs megadása kötelező' },
        { status: 400 }
      );
    }

    // Validate category exists in defaults
    if (!DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS]) {
      return NextResponse.json(
        { error: 'Érvénytelen kategória' },
        { status: 400 }
      );
    }

    // Convert value to string (store as JSON if object/array)
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    // Upsert setting
    const setting = await prisma.siteSetting.upsert({
      where: {
        key: key,
      },
      update: {
        value: stringValue,
        updatedBy: session.user.email || undefined,
      },
      create: {
        key,
        value: stringValue,
        category,
        updatedBy: session.user.email || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      setting,
    });
  } catch (error) {
    console.error('[Admin Settings PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a beállítások mentésekor' },
      { status: 500 }
    );
  }
}

// POST - Bulk update settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = await request.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Érvénytelen beállítások formátum' },
        { status: 400 }
      );
    }

    // Process all settings updates
    const updates = [];
    for (const [category, categorySettings] of Object.entries(settings)) {
      if (typeof categorySettings !== 'object') continue;

      for (const [key, value] of Object.entries(categorySettings as any)) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

        updates.push(
          prisma.siteSetting.upsert({
            where: { key },
            update: {
              value: stringValue,
              updatedBy: session.user.email || undefined,
            },
            create: {
              key,
              value: stringValue,
              category,
              updatedBy: session.user.email || undefined,
            },
          })
        );
      }
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'Beállítások sikeresen frissítve',
    });
  } catch (error) {
    console.error('[Admin Settings POST] Error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a beállítások mentésekor' },
      { status: 500 }
    );
  }
}

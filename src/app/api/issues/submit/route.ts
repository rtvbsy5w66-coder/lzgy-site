import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const issueSubmissionSchema = z.object({
  categoryId: z.string().min(1, 'Kategória megadása kötelező'),
  reporterName: z.string().min(2, 'Név megadása kötelező (minimum 2 karakter)'),
  reporterEmail: z.string().email('Érvényes email cím megadása kötelező'),
  reporterPhone: z.string().optional(),
  reporterAddress: z.string().optional(),
  title: z.string().min(5, 'Cím megadása kötelező (minimum 5 karakter)'),
  description: z.string().min(10, 'Részletes leírás kötelező (minimum 10 karakter)'),
  location: z.string().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  customFields: z.record(z.string(), z.any()).optional(),
  isPublic: z.boolean().default(true),
});

function generateTrackingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `V5K-${year}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // Session ellenőrzése - kötelező bejelentkezés
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Bejelentkezés szükséges a problémák bejelentéséhez.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validáció - a bejelentkezett felhasználó adataival kiegészítjük
    const validatedData = issueSubmissionSchema.parse({
      ...body,
      reporterName: session.user.name || body.reporterName,
      reporterEmail: session.user.email || body.reporterEmail,
    });
    
    // Kategória létezésének ellenőrzése
    const category = await prisma.issueCategory.findFirst({
      where: {
        id: validatedData.categoryId,
        isActive: true
      }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'A megadott kategória nem található vagy nem aktív' },
        { status: 400 }
      );
    }
    
    // Egyedi tracking szám generálása
    let trackingNumber: string;
    let isUnique = false;
    let attempts = 0;
    
    do {
      trackingNumber = generateTrackingNumber();
      const existing = await prisma.issue.findUnique({
        where: { trackingNumber }
      });
      isUnique = !existing;
      attempts++;
    } while (!isUnique && attempts < 10);
    
    if (!isUnique) {
      return NextResponse.json(
        { error: 'Nem sikerült egyedi tracking számot generálni. Kérjük, próbálja újra.' },
        { status: 500 }
      );
    }
    
    // Probléma mentése az adatbázisba
    const issue = await prisma.issue.create({
      data: {
        categoryId: validatedData.categoryId,
        reporterName: validatedData.reporterName,
        reporterEmail: validatedData.reporterEmail,
        reporterPhone: validatedData.reporterPhone,
        reporterAddress: validatedData.reporterAddress,
        title: validatedData.title,
        description: validatedData.description,
        location: validatedData.location,
        urgency: validatedData.urgency as any,
        customFields: validatedData.customFields || {},
        trackingNumber: trackingNumber,
        isPublic: validatedData.isPublic,
        status: 'SUBMITTED',
        citizenNotified: false,
        attachments: [], // Fájlok később kerülnek fel - JSON array formátumban
        submittedAt: new Date(),
      },
      include: {
        category: true
      }
    });
    
    // Státusz frissítés létrehozása
    await prisma.issueStatusUpdate.create({
      data: {
        issueId: issue.id,
        newStatus: 'SUBMITTED',
        comment: 'A bejelentés sikeresen beérkezett és feldolgozásra vár.',
        updatedBy: 'SYSTEM',
        updatedByRole: 'Automatikus rendszer',
        notifyCitizen: true,
        citizenNotified: false,
      }
    });
    
    // Email küldése a bejelentőnek
    try {
      await sendConfirmationEmail(issue, category);
      
      // Citizen notification flag frissítése
      await prisma.issue.update({
        where: { id: issue.id },
        data: { citizenNotified: true }
      });
      
      await prisma.issueStatusUpdate.updateMany({
        where: {
          issueId: issue.id,
          newStatus: 'SUBMITTED'
        },
        data: { citizenNotified: true }
      });
      
    } catch (emailError) {
      console.error('Email küldési hiba:', emailError);
      // Email hiba esetén nem blokkoljuk a bejelentést
    }
    
    // Belső értesítés küldése (admin email)
    try {
      await sendAdminNotification(issue, category);
    } catch (adminEmailError) {
      console.error('Admin email küldési hiba:', adminEmailError);
    }
    
    return NextResponse.json({
      success: true,
      trackingNumber: issue.trackingNumber,
      issueId: issue.id,
      status: issue.status,
      message: 'A bejelentés sikeresen elküldve. Tracking szám: ' + issue.trackingNumber
    });
    
  } catch (error) {
    console.error('Issue submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validációs hiba',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Váratlan hiba történt. Kérjük, próbálja újra később.' },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(issue: any, category: any) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP konfiguráció hiányzik, email küldés kihagyva');
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  const emailContent = `
Tisztelt ${issue.reporterName}!

Köszönjük a bejelentését! Az alábbi problémát rögzítettük a rendszerünkben:

🔸 Tracking szám: ${issue.trackingNumber}
🔸 Kategória: ${category.name}
🔸 Cím: ${issue.title}
🔸 Helyszín: ${issue.location || 'Nem megadva'}
🔸 Sürgősség: ${issue.urgency}
🔸 Bejelentés időpontja: ${issue.submittedAt.toLocaleString('hu-HU')}

A bejelentés jelenleg "Beküldve" státuszban van. Munkatársaink hamarosan áttekintik és intézkednek.

A bejelentés állapotát bármikor nyomon követheti a tracking számmal a weboldalunkon.

Amennyiben kérdése van, kérjük válaszoljon erre az emailre vagy hívja az irodánkat.

Üdvözlettel,
Lovas Zoltán irodája
V. Kerületi Önkormányzati Képviselő
`;
  
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Lovas Zoltán irodája'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: issue.reporterEmail,
    subject: `Bejelentés visszaigazolás - ${issue.trackingNumber}`,
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>')
  });
  
  // Notification record létrehozása
  await prisma.issueNotification.create({
    data: {
      issueId: issue.id,
      type: 'CONFIRMATION',
      subject: `Bejelentés visszaigazolás - ${issue.trackingNumber}`,
      message: emailContent,
      recipientEmail: issue.reporterEmail,
      recipientName: issue.reporterName,
      sent: true,
      sentAt: new Date(),
    }
  });
}

async function sendAdminNotification(issue: any, category: any) {
  if (!process.env.ADMIN_EMAIL || !process.env.SMTP_HOST) {
    console.warn('Admin email vagy SMTP konfiguráció hiányzik');
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  const adminContent = `
Új bejelentés érkezett!

Tracking szám: ${issue.trackingNumber}
Kategória: ${category.name}
Bejelentő: ${issue.reporterName} (${issue.reporterEmail})
Telefon: ${issue.reporterPhone || 'Nem megadva'}
Cím: ${issue.title}
Leírás: ${issue.description}
Helyszín: ${issue.location || 'Nem megadva'}
Sürgősség: ${issue.urgency}

Egyedi mezők:
${JSON.stringify(issue.customFields, null, 2)}

Admin felület: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/issues/${issue.id}
`;
  
  await transporter.sendMail({
    from: `"Bejelentő Rendszer" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🚨 Új bejelentés: ${category.name} - ${issue.trackingNumber}`,
    text: adminContent,
    html: adminContent.replace(/\n/g, '<br>')
  });
}
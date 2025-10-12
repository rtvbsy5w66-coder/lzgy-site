import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const trackingSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking szám megadása kötelező'),
  email: z.string().email('Érvényes email cím megadása kötelező').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingNumber, email } = trackingSchema.parse(body);
    
    // Keresés tracking szám alapján
    const issue = await prisma.issue.findUnique({
      where: { trackingNumber },
      include: {
        category: true,
        statusUpdates: {
          orderBy: { createdAt: 'desc' },
          include: {
            // Ha később user modellt adunk hozzá
          }
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    
    if (!issue) {
      return NextResponse.json(
        { 
          found: false,
          message: 'A megadott tracking számmal nem található bejelentés.'
        },
        { status: 404 }
      );
    }
    
    // Email ellenőrzés (ha meg van adva)
    let canView = true;
    if (email && issue.reporterEmail !== email) {
      canView = false;
    }
    
    // Ha nem nyilvános és nem egyezik az email
    if (!issue.isPublic && !canView) {
      return NextResponse.json(
        {
          found: true,
          canView: false,
          message: 'Ez a bejelentés nem nyilvános. Kérjük, adja meg a bejelentéskor használt email címet.'
        },
        { status: 403 }
      );
    }
    
    // Visszatérési adatok összeállítása
    const responseData = {
      found: true,
      canView: true,
      issue: {
        id: issue.id,
        trackingNumber: issue.trackingNumber,
        title: issue.title,
        description: canView ? issue.description : null,
        location: issue.location,
        status: issue.status,
        urgency: issue.urgency,
        submittedAt: issue.submittedAt,
        reviewedAt: issue.reviewedAt,
        resolvedAt: issue.resolvedAt,
        closedAt: issue.closedAt,
        category: {
          id: issue.category.id,
          name: issue.category.name,
          description: issue.category.description,
          icon: issue.category.icon,
          color: issue.category.color
        },
        reporterName: canView ? issue.reporterName : 'Névtelen',
        reporterEmail: canView ? issue.reporterEmail : null,
        reporterPhone: canView ? issue.reporterPhone : null,
        customFields: canView ? issue.customFields : null,
        attachments: canView ? issue.attachments : [],
        isPublic: issue.isPublic,
        statusUpdates: issue.statusUpdates.map(update => ({
          id: update.id,
          previousStatus: update.previousStatus,
          newStatus: update.newStatus,
          comment: update.comment,
          // internalNote csak admin számára
          updatedBy: update.updatedBy,
          updatedByRole: update.updatedByRole,
          createdAt: update.createdAt,
          notifyCitizen: update.notifyCitizen,
          citizenNotified: update.citizenNotified
        }))
      }
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Issue tracking error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validációs hiba',
          details: error.errors.map(err => ({
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

// GET endpoint tracking URL-ből
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('tracking');
    const email = searchParams.get('email');
    
    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking szám megadása kötelező' },
        { status: 400 }
      );
    }
    
    // POST endpointtal megegyező logika
    const body = { trackingNumber, email };
    const mockRequest = {
      json: async () => body
    } as NextRequest;
    
    return await POST(mockRequest);
    
  } catch (error) {
    console.error('GET tracking error:', error);
    return NextResponse.json(
      { error: 'Váratlan hiba történt.' },
      { status: 500 }
    );
  }
}
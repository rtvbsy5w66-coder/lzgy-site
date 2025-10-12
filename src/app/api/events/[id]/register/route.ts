import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEventRegistrationEmail } from "@/lib/email";
import { auth } from "@/lib/auth";

// Import mock events for fallback
const mockEvents = [
  {
    id: "mock-event-1",
    title: "Lakossági fórum - Környezetvédelem",
    description: "Beszélgetés a zöld energia programról és a városi környezetvédelmi kezdeményezésekről. Megvitatjuk a napelemes program kiterjesztését és a hulladékgazdálkodás fejlesztését.",
    location: "XIII. kerületi Közösségi Ház",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    status: "UPCOMING" as const,
    imageUrl: null,
    maxAttendees: 50
  },
  {
    id: "mock-event-2",
    title: "Közösségi kertészkedés",
    description: "A kerületi közösségi kert fejlesztése és gondozása. Ültessünk együtt újabb növényeket és tanuljunk a fenntartható gazdálkodásról!",
    location: "XIII. kerületi Közösségi Kert",
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
    status: "UPCOMING" as const,
    imageUrl: null,
    maxAttendees: 30
  },
  {
    id: "mock-event-3",
    title: "Oktatási kerekasztal",
    description: "Beszélgetés a digitális oktatás fejlesztéséről és a modern oktatási eszközökről. Hogyan készíthetjük fel gyermekeinket a jövő kihívásaira?",
    location: "XIII. kerületi Művelődési Központ",
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    status: "UPCOMING" as const,
    imageUrl: null,
    maxAttendees: 40
  },
  {
    id: "mock-event-4",
    title: "Közlekedési fórum",
    description: "Megbeszéljük a kerékpárút-fejlesztési terveket és a tömegközlekedés javítási lehetőségeit.",
    location: "XIII. kerületi Polgármesteri Hivatal",
    startDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks from now
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
    status: "UPCOMING" as const,
    imageUrl: null,
    maxAttendees: 25
  }
] as const;

// POST /api/events/[id]/register - Eseményre való jelentkezés
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if user is authenticated
    const session = await auth();

    // DEBUG: Log session information
    console.log('[EVENT_REGISTER] Session info:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name
    });

    // Rate limiting ellenőrzés
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    const isAllowed = await checkRateLimit({
      limit: 5, // Maximum 5 jelentkezés
      windowMs: 10 * 60 * 1000, // 10 percenként
      currentTimestamp: Date.now()
    });

    if (!isAllowed) {
      return NextResponse.json(
        { 
          error: "Túl sok jelentkezési kísérlet. Kérjük, várjon 10 percet.",
          retryAfter: 600
        }, 
        { status: 429 }
      );
    }

    // Ellenőrizzük, hogy az esemény létezik-e az adatbázisban
    let event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        }
      }
    });

    // Ha nem találjuk az adatbázisban, keressük a mock eseményekben
    let isMockEvent = false;
    if (!event) {
      const mockEvent = mockEvents.find(e => e.id === id);
      if (mockEvent) {
        isMockEvent = true;
        event = {
          ...mockEvent,
          registrations: [], // Mock events have no existing registrations
          createdAt: new Date(),
          updatedAt: new Date()
        } as any; // Type assertion to satisfy TypeScript
        console.log(`[EVENTS_REGISTER] Using mock event: ${mockEvent.title}`);
      }
    }

    if (!event) {
      return NextResponse.json(
        { error: "Az esemény nem található" },
        { status: 404 }
      );
    }

    // Ellenőrizzük, hogy az esemény státusza megfelelő-e
    if (!['UPCOMING', 'ONGOING'].includes(event.status)) {
      return NextResponse.json(
        { error: "Erre az eseményre már nem lehet jelentkezni" },
        { status: 400 }
      );
    }

    // Ellenőrizzük, hogy az esemény még nem kezdődött-e el
    if (new Date(event.startDate) < new Date()) {
      return NextResponse.json(
        { error: "Már elkezdett eseményre nem lehet jelentkezni" },
        { status: 400 }
      );
    }

    // Ellenőrizzük a jelentkezők számát
    if (event.maxAttendees && event.registrations.length >= event.maxAttendees) {
      return NextResponse.json(
        { error: "Az esemény betelt, már nincs szabad hely" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Validáció
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Név és email cím megadása kötelező" },
        { status: 400 }
      );
    }

    // Email validáció
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Érvénytelen email cím" },
        { status: 400 }
      );
    }

    // Ellenőrizzük a felhasználó regisztrációs történetét
    if (!isMockEvent) {
      // Aktív regisztráció ellenőrzése
      const activeRegistration = await prisma.eventRegistration.findFirst({
        where: {
          eventId: id,
          email: data.email,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });

      if (activeRegistration) {
        return NextResponse.json(
          { error: "Ezzel az email címmel már van aktív jelentkezés erre az eseményre" },
          { status: 400 }
        );
      }

      // Regisztrációs gyakoriság ellenőrzése (max 3 regisztráció 24 órában ugyanarra az eseményre)
      const recentRegistrations = await prisma.eventRegistration.findMany({
        where: {
          eventId: id,
          email: data.email,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      if (recentRegistrations.length >= 3) {
        return NextResponse.json(
          { error: "Túl sok regisztrációs kísérlet. Kérjük, próbálja újra 24 óra múlva." },
          { status: 429 }
        );
      }
    }

    // Új jelentkezés létrehozása
    let registration;
    if (isMockEvent) {
      // Mock események esetén csak szimulálunk
      registration = {
        id: `mock-reg-${Date.now()}`,
        eventId: id,
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim() || null,
        message: data.message?.trim() || null,
        status: 'CONFIRMED',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log(`[EVENTS_REGISTER] Mock registration created for ${registration.email}`);
    } else {
      // Valós adatbázis esemény esetén mentjük az adatbázisba
      const userId = session?.user?.id || null;
      console.log('[EVENT_REGISTER] Creating registration with userId:', userId);

      registration = await prisma.eventRegistration.create({
        data: {
          eventId: id,
          userId: userId, // Add userId if user is logged in
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          phone: data.phone?.trim() || null,
          message: data.message?.trim() || null,
          status: 'CONFIRMED' // Auto-confirm event registrations
        }
      });

      console.log('[EVENT_REGISTER] Registration created:', {
        id: registration.id,
        userId: registration.userId,
        email: registration.email
      });
    }

    // Send confirmation email
    try {
      const emailResult = await sendEventRegistrationEmail(
        registration.email,
        registration.name,
        event.title,
        event.location,
        event.startDate.toISOString(),
        event.endDate.toISOString()
      );

      if (emailResult.success) {
        console.log(`✅ Event registration email sent to ${registration.email}`);
      } else {
        console.log(`⚠️ Event registration email failed for ${registration.email}`);
      }
    } catch (emailError) {
      console.error('Event registration email error:', emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Jelentkezés sikeresen elküldve! Megerősítő emailt küldtünk Önnek.",
      registrationId: registration.id
    });

  } catch (error) {
    console.error("Event registration error:", error);
    return NextResponse.json(
      { error: "Hiba történt a jelentkezés során. Kérjük, próbálja újra később." },
      { status: 500 }
    );
  }
}

// GET /api/events/[id]/register - Esemény jelentkezési adatok (admin)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Hiba a jelentkezések lekérésekor" },
      { status: 500 }
    );
  }
}
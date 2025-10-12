import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { 
  createApiResponse, 
  createApiError, 
  createValidationError, 
  validateRequiredFields,
  API_MESSAGES 
} from "@/lib/api-helpers";
import { handleApiError, validateEventDates } from "@/lib/error-handler";

// Enhanced mock events with more realistic future dates
const mockEvents = [
  {
    id: "mock-event-1",
    title: "Lakossági fórum - Környezetvédelem",
    description: "Beszélgetés a zöld energia programról és a városi környezetvédelmi kezdeményezésekről. Megvitatjuk a napelemes program kiterjesztését és a hulladékgazdálkodás fejlesztését.",
    location: "XIII. kerületi Közösségi Ház",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    status: "UPCOMING" as const,
    imageUrl: null,
    maxAttendees: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "mock-event-2",
    title: "Közösségi kertészkedés",
    description: "A kerületi közösségi kert fejlesztése és gondozása. Ültessünk együtt újabb növényeket és tanuljunk a fenntartható gazdálkodásról!",
    location: "XIII. kerületi Közösségi Kert",
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
    status: "UPCOMING" as const,
    imageUrl: null,
    maxAttendees: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "mock-event-3",
    title: "Oktatási kerekasztal",
    description: "Beszélgetés a digitális oktatás fejlesztéséről és a modern oktatási eszközökről. Hogyan készíthetjük fel gyermekeinket a jövő kihívásaira?",
    location: "XIII. kerületi Művelődési Központ",
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    status: "UPCOMING" as const,
    imageUrl: null,
    maxAttendees: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "mock-event-4",
    title: "Közlekedési fórum",
    description: "Megbeszéljük a kerékpárút-fejlesztési terveket és a tömegközlekedés javítási lehetőségeit.",
    location: "XIII. kerületi Polgármesteri Hivatal",
    startDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), // 4 weeks from now
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // 1.5 hours later
    status: "UPCOMING" as const,
    imageUrl: null,
    maxAttendees: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
] as const;

// Enhanced GET endpoint with filtering, sorting and database integration
export async function GET(req: Request) {
  try {
    // Get session for user-specific data
    const session = await auth();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    // DEBUG: Log session information
    console.log('[EVENTS_GET] Session info:', {
      hasSession: !!session,
      userId: userId,
      userEmail: userEmail
    });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');
    const upcoming = searchParams.get('upcoming'); // special filter for upcoming events
    
    // Convert params
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const skip = limitNum && pageNum > 1 ? (pageNum - 1) * limitNum : undefined;
    
    let events: any[] = [];
    
    try {
      // Try database first with enhanced filtering
      let whereClause: any = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (upcoming === 'true') {
        whereClause.status = { in: ['UPCOMING', 'ONGOING'] };
        whereClause.startDate = { gte: new Date() };
      }
      
      events = await prisma.event.findMany({
        where: whereClause,
        include: {
          registrations: userId && userEmail ? {
            where: {
              OR: [
                { userId: userId },
                { email: userEmail }
              ]
            },
            select: {
              id: true,
              status: true
            },
            orderBy: { createdAt: 'desc' }, // Get most recent registration
            take: 1 // Only need the latest registration status
          } : false,
          _count: {
            select: {
              registrations: true
            }
          }
        },
        orderBy: [
          { startDate: 'asc' }, // Events sorted by date
          { createdAt: 'desc' }  // Then by creation date
        ],
        ...(limitNum && { take: limitNum }),
        ...(skip && { skip })
      });

      // Transform events to include userRegistration field
      if (userId && userEmail && events) {
        console.log('[EVENTS_GET] Transforming events with user registration data for userId:', userId);
        events = events.map(event => {
          const userReg = event.registrations && event.registrations.length > 0
            ? event.registrations[0]
            : null;

          console.log(`[EVENTS_GET] Event ${event.id} - Found registration:`, {
            hasRegistration: !!userReg,
            regId: userReg?.id,
            regStatus: userReg?.status
          });

          return {
            ...event,
            userRegistration: userReg,
            registrations: undefined // Remove the registrations array from response
          };
        });
      }
      
      // Use only database events - no mock data
      console.log(`[EVENTS_GET] Found ${events.length} events in database`);
      
      // Sort events by startDate
      events.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      // Apply pagination if needed
      if (limitNum) {
        const startIndex = skip || 0;
        events = events.slice(startIndex, startIndex + limitNum);
      }
      
    } catch (dbError) {
      console.error('[EVENTS_GET] Database error:', dbError);
      events = []; // Return empty array on database error instead of mock data
    }

    const count = events.length;
    const filterInfo = [];
    if (status) filterInfo.push(`státusz: ${status}`);
    if (upcoming === 'true') filterInfo.push('csak közelgő események');
    if (limitNum) filterInfo.push(`max ${limitNum} esemény`);
    
    const message = count > 0 
      ? `${count} esemény betöltve${filterInfo.length > 0 ? ` (${filterInfo.join(', ')})` : ''}`
      : 'Nincsenek események a megadott szűrőkkel';

    return createApiResponse(events, message);
  } catch (error) {
    console.error("[EVENTS_GET] Complete failure:", error);
    return createApiResponse([], 'Hiba történt az események betöltésekor');
  }
}

// POST /api/events - Create new event
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Kötelező mezők validációja
    const validation = validateRequiredFields(data, [
      'title', 
      'description', 
      'location', 
      'startDate', 
      'endDate'
    ]);
    if (!validation.isValid) {
      return createValidationError(validation.errors);
    }

    // Dátumok validációja
    validateEventDates(data.startDate, data.endDate);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'UPCOMING',
        imageUrl: data.imageUrl || null,
      },
    });

    return createApiResponse(event, API_MESSAGES.CREATED, 201);
  } catch (error) {
    return handleApiError(error, "EVENTS_POST");
  }
}

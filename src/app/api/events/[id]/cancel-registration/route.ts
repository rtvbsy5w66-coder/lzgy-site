import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEventCancellationEmail } from "@/lib/email";

// POST /api/events/[id]/cancel-registration - Esemény jelentkezés lemondása
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Bejelentkezés szükséges a lemondáshoz" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { registrationId } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Regisztráció ID szükséges" },
        { status: 400 }
      );
    }

    // Find and verify the registration
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        id: registrationId,
        eventId: id,
        OR: [
          { userId: session.user.id },
          { email: session.user.email }
        ],
        status: 'CONFIRMED'
      },
      include: {
        event: {
          select: {
            title: true,
            location: true,
            startDate: true,
            endDate: true,
            status: true
          }
        }
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Nem található aktív jelentkezés ehhez az eseményhez" },
        { status: 404 }
      );
    }

    // Check if event is still upcoming (can't cancel past events)
    if (new Date(registration.event.startDate) < new Date()) {
      return NextResponse.json(
        { error: "Már elkezdett eseményről nem lehet lemondani" },
        { status: 400 }
      );
    }

    // Cancel the registration
    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    // Send cancellation email
    try {
      const emailResult = await sendEventCancellationEmail(
        registration.email,
        registration.name,
        registration.event.title,
        registration.event.location,
        registration.event.startDate.toISOString(),
        registration.event.endDate.toISOString()
      );

      if (emailResult.success) {
        console.log(`✅ Event cancellation email sent to ${registration.email}`);
      } else {
        console.log(`⚠️ Event cancellation email failed for ${registration.email}`);
      }
    } catch (emailError) {
      console.error('Event cancellation email error:', emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Jelentkezés sikeresen lemondva. Megerősítő emailt küldtünk Önnek."
    });

  } catch (error) {
    console.error("Event cancellation error:", error);
    return NextResponse.json(
      { error: "Hiba történt a lemondás során. Kérjük, próbálja újra később." },
      { status: 500 }
    );
  }
}
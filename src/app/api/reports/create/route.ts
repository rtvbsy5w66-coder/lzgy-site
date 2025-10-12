import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendReportNotificationEmail } from '@/lib/email';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Bejelentkezés szükséges' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[REPORT_CREATE] Received data:', JSON.stringify(body, null, 2));

    const {
      title,
      description,
      category,
      addressText,
      addressId,
      postalCode,
      affectedArea,
      urgency,
      estimatedCost,
      legalIssue,
      subcategory
    } = body;

    // Validate required fields
    console.log('[REPORT_CREATE] Validation check:', {
      title: !!title,
      description: !!description,
      category: !!category,
      addressText: !!addressText,
      urgency: !!urgency
    });

    if (!title || !description || !category || !addressText || !urgency) {
      console.log('[REPORT_CREATE] ❌ Validation failed - missing fields');
      return NextResponse.json(
        { error: 'Hiányzó kötelező mezők' },
        { status: 400 }
      );
    }

    // Create report in database
    const report = await prisma.report.create({
      data: {
        authorId: session.user.id,
        representativeName: session.user.name || 'Bejelentő',
        category,
        subcategory: subcategory || '',
        title,
        description,
        addressText,
        addressId: addressId || null,
        postalCode: postalCode || null,
        affectedArea: affectedArea || null,
        urgency,
        estimatedCost: estimatedCost || null,
        department: null,
        legalIssue: legalIssue || false,
        status: 'PENDING', // Initial status
      },
    });

    console.log('[REPORT_CREATE] ✅ Report created successfully:', report.id);

    // Send email notification to user
    if (session.user.email) {
      try {
        await sendReportNotificationEmail({
          to: session.user.email,
          reportId: report.id,
          title,
          category,
          addressText,
          urgency,
          userName: session.user.name || 'Bejelentő'
        });
        console.log('[REPORT_CREATE] ✅ Email notification sent to:', session.user.email);
      } catch (emailError) {
        console.error('[REPORT_CREATE] ❌ Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bejelentés sikeresen elküldve!',
      reportId: report.id,
      data: report
    }, { status: 201 });

  } catch (error) {
    console.error('Create report error:', error);

    return NextResponse.json(
      { error: 'Hiba történt a bejelentés mentése során' },
      { status: 500 }
    );
  }
}
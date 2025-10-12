import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CampaignStatus } from "@prisma/client";

// POST /api/admin/newsletter/campaigns - Create newsletter campaign with scheduling
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const {
      name,
      subject,
      content,
      recipientType,
      selectedIds,
      testEmail,
      sendType,
      scheduledAt,
      isRecurring,
      recurringType,
      recurringDay,
      isAbTest,
      abTestSubjectB,
      abTestContentB,
      abTestSplit
    } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    // Calculate next send date for recurring campaigns
    let nextSendDate = null;
    if (sendType === 'recurring' && scheduledAt) {
      const baseDate = new Date(scheduledAt);
      
      switch (recurringType) {
        case 'weekly':
          nextSendDate = new Date(baseDate);
          nextSendDate.setDate(baseDate.getDate() + 7);
          break;
        case 'monthly':
          nextSendDate = new Date(baseDate);
          nextSendDate.setMonth(baseDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextSendDate = new Date(baseDate);
          nextSendDate.setMonth(baseDate.getMonth() + 3);
          break;
      }
    }

    // Create main campaign
    const campaignData = {
      name: name || `${subject} - ${new Date().toLocaleDateString('hu-HU')}`,
      subject,
      content,
      status: sendType === 'immediate' ? CampaignStatus.SENDING : CampaignStatus.SCHEDULED,
      scheduledAt: sendType === 'immediate' ? null : (scheduledAt ? new Date(scheduledAt) : null),
      recipientType: recipientType.toUpperCase(),
      selectedIds: selectedIds ? JSON.stringify(selectedIds) : null,
      testEmail,
      isRecurring: sendType === 'recurring',
      recurringType: sendType === 'recurring' ? recurringType?.toUpperCase() : null,
      recurringDay: sendType === 'recurring' ? recurringDay : null,
      nextSendDate,
      isAbTest: false, // Parent campaign is not A/B test
      createdBy: session.user.id || session.user.email
    };

    let parentCampaign;
    
    // If immediate sending, handle legacy sending
    if (sendType === 'immediate') {
      // For immediate sending, we still use the old send route for now
      // But save the campaign for tracking
      const campaign = await prisma.newsletterCampaign.create({
        data: {
          ...campaignData,
          status: CampaignStatus.SENDING
        }
      });

      // Trigger immediate send via existing send route
      const sendResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/newsletter/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          content,
          recipients: recipientType,
          selectedIds,
          testEmail
        })
      });

      if (sendResponse.ok) {
        const sendResult = await sendResponse.json();
        
        // Update campaign with send results
        await prisma.newsletterCampaign.update({
          where: { id: campaign.id },
          data: {
            status: CampaignStatus.SENT,
            sentAt: new Date(),
            sentCount: sendResult.sentCount || 0
          }
        });

        return NextResponse.json({
          success: true,
          campaignId: campaign.id,
          sentCount: sendResult.sentCount,
          message: 'Newsletter sent successfully and campaign saved'
        });
      } else {
        // Update campaign status to failed
        await prisma.newsletterCampaign.update({
          where: { id: campaign.id },
          data: { status: CampaignStatus.FAILED }
        });

        return NextResponse.json(
          { error: 'Failed to send newsletter' },
          { status: 500 }
        );
      }
    }

    // For scheduled or recurring campaigns
    parentCampaign = await prisma.newsletterCampaign.create({
      data: campaignData
    });

    // Create A/B test campaigns if enabled
    if (isAbTest && abTestSubjectB) {
      // Create variant A
      await prisma.newsletterCampaign.create({
        data: {
          ...campaignData,
          name: `${campaignData.name} - A verzió`,
          parentCampaignId: parentCampaign.id,
          isAbTest: true,
          abTestVariant: 'A',
          abTestSplit: abTestSplit / 100
        }
      });

      // Create variant B
      await prisma.newsletterCampaign.create({
        data: {
          ...campaignData,
          name: `${campaignData.name} - B verzió`,
          subject: abTestSubjectB,
          content: abTestContentB || content,
          parentCampaignId: parentCampaign.id,
          isAbTest: true,
          abTestVariant: 'B',
          abTestSplit: (100 - abTestSplit) / 100
        }
      });

      // Update parent campaign
      await prisma.newsletterCampaign.update({
        where: { id: parentCampaign.id },
        data: { isAbTest: true }
      });
    }

    return NextResponse.json({
      success: true,
      campaignId: parentCampaign.id,
      message: sendType === 'scheduled' 
        ? `Newsletter scheduled for ${new Date(scheduledAt).toLocaleString('hu-HU')}`
        : `Recurring newsletter set up - next send: ${nextSendDate?.toLocaleString('hu-HU')}`
    });

  } catch (error) {
    console.error('Error creating newsletter campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create newsletter campaign: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// GET /api/admin/newsletter/campaigns - Get all campaigns
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const campaigns = await prisma.newsletterCampaign.findMany({
      where: {
        parentCampaignId: null // Only get parent campaigns, not A/B test variants
      },
      include: {
        abTestCampaigns: true,
        _count: {
          select: {
            analytics: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: campaigns
    });

  } catch (error) {
    console.error('Error fetching newsletter campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
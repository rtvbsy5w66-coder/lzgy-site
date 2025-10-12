import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

// Initialize Resend only if API key is available
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// POST /api/admin/newsletter/scheduler - Process scheduled campaigns (called by cron job)
export async function POST(request: Request) {
  try {
    // Verify this is called by the system (you can add API key authentication here)
    const { authorization } = await request.json();
    
    if (authorization !== process.env.SCHEDULER_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized scheduler access' },
        { status: 401 }
      );
    }

    const now = new Date();
    
    // Find campaigns that should be sent now
    const campaignsToSend = await prisma.newsletterCampaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now
        }
      },
      include: {
        abTestCampaigns: true
      }
    });

    console.log(`Found ${campaignsToSend.length} campaigns to send`);

    let totalSent = 0;
    const results = [];

    for (const campaign of campaignsToSend) {
      try {
        // Update status to sending
        await prisma.newsletterCampaign.update({
          where: { id: campaign.id },
          data: { status: 'SENDING' }
        });

        let sentCount = 0;

        if (campaign.isAbTest && campaign.abTestCampaigns.length > 0) {
          // Handle A/B test campaigns
          for (const abCampaign of campaign.abTestCampaigns) {
            const abSentCount = await sendCampaign(abCampaign);
            sentCount += abSentCount;
          }
        } else {
          // Handle regular campaign
          sentCount = await sendCampaign(campaign);
        }

        // Update campaign as sent
        await prisma.newsletterCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'SENT',
            sentAt: now,
            sentCount
          }
        });

        // Handle recurring campaigns
        if (campaign.isRecurring && campaign.nextSendDate) {
          const nextSend = calculateNextSendDate(campaign);
          
          // Create new campaign for next occurrence
          await prisma.newsletterCampaign.create({
            data: {
              name: `${campaign.name} - ${nextSend.toLocaleDateString('hu-HU')}`,
              subject: campaign.subject,
              content: campaign.content,
              status: 'SCHEDULED',
              scheduledAt: nextSend,
              recipientType: campaign.recipientType,
              selectedIds: campaign.selectedIds,
              testEmail: campaign.testEmail,
              isRecurring: true,
              recurringType: campaign.recurringType,
              recurringDay: campaign.recurringDay,
              nextSendDate: calculateNextSendDate({...campaign, nextSendDate: nextSend}),
              createdBy: campaign.createdBy
            }
          });
        }

        totalSent += sentCount;
        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          sentCount,
          success: true
        });

      } catch (error) {
        console.error(`Error sending campaign ${campaign.id}:`, error);
        
        // Update campaign as failed
        await prisma.newsletterCampaign.update({
          where: { id: campaign.id },
          data: { status: 'FAILED' }
        });

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          error: (error as Error).message,
          success: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedCampaigns: campaignsToSend.length,
      totalSent,
      results
    });

  } catch (error) {
    console.error('Error in newsletter scheduler:', error);
    return NextResponse.json(
      { error: 'Scheduler failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

async function sendCampaign(campaign: any): Promise<number> {
  // Get recipients based on campaign settings
  let recipientEmails: { email: string; name: string }[] = [];

  switch (campaign.recipientType) {
    case 'ALL':
      // Get all active newsletter subscribers from both tables
      const allContactSubscribers = await prisma.contact.findMany({
        where: { newsletter: true },
        select: { email: true, name: true }
      });
      
      const allNewsletterSubscribers = await prisma.newsletterSubscription.findMany({
        where: { isActive: true },
        select: { email: true, name: true }
      });

      // Combine and deduplicate
      const allEmails = [
        ...allContactSubscribers.map(sub => ({ email: sub.email, name: sub.name })),
        ...allNewsletterSubscribers.map(sub => ({ email: sub.email, name: sub.name }))
      ];
      
      recipientEmails = allEmails.reduce((acc, current) => {
        const existing = acc.find(item => item.email === current.email);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, [] as typeof allEmails);
      break;

    case 'SELECTED':
      if (campaign.selectedIds) {
        const selectedIds = JSON.parse(campaign.selectedIds);
        const selectedSubscribers = await prisma.contact.findMany({
          where: {
            id: { in: selectedIds },
            newsletter: true
          },
          select: { email: true, name: true }
        });
        recipientEmails = selectedSubscribers.map(sub => ({
          email: sub.email,
          name: sub.name
        }));
      }
      break;

    case 'TEST':
      if (campaign.testEmail) {
        // Support multiple test emails separated by comma
        const testEmails = campaign.testEmail.split(',').map((email: string) => email.trim()).filter((email: string) => email);
        recipientEmails = testEmails.map((email: string, index: number) => ({ 
          email, 
          name: `Test User ${index + 1}` 
        }));
      }
      break;
  }

  // For A/B tests, split recipients
  if (campaign.isAbTest && campaign.abTestSplit) {
    const splitIndex = Math.floor(recipientEmails.length * campaign.abTestSplit);
    recipientEmails = campaign.abTestVariant === 'A' 
      ? recipientEmails.slice(0, splitIndex)
      : recipientEmails.slice(splitIndex);
  }

  if (recipientEmails.length === 0) {
    return 0;
  }

  // Create newsletter HTML
  const createNewsletterHtml = (recipientEmail: string, recipientName: string) => {
    const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;
    
    // Replace template variables
    let processedContent = campaign.content
      .replace(/\{NAME\}/g, recipientName)
      .replace(/\{DATE\}/g, new Date().toLocaleDateString('hu-HU'))
      .replace(/\{MONTH\}/g, new Date().toLocaleDateString('hu-HU', { month: 'long' }))
      .replace(/\{YEAR\}/g, new Date().getFullYear().toString());
    
    return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaign.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; margin: -20px -20px 20px -20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    .unsubscribe { margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 4px; text-align: center; }
    .unsubscribe a { color: #6b7280; text-decoration: none; }
    .unsubscribe a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lovas Zoltán Hírlevél</h1>
    </div>
    
    <div class="content">
      ${processedContent}
    </div>
    
    <div class="footer">
      <p>Köszönjük, hogy feliratkozott hírlevelünkre!</p>
      
      <div class="unsubscribe">
        <p>Ha nem szeretné többé megkapni ezeket az emaileket, 
        <a href="${unsubscribeUrl}">kattintson ide a leiratkozáshoz</a>.</p>
      </div>
      
      <p style="margin-top: 20px;">
        <strong>Lovas Zoltán</strong><br>
        Politikus<br>
        <a href="${process.env.NEXTAUTH_URL}">${process.env.NEXTAUTH_URL}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  };

  // Send emails in batches
  let sentCount = 0;
  const batchSize = 10;
  
  for (let i = 0; i < recipientEmails.length; i += batchSize) {
    const batch = recipientEmails.slice(i, i + batchSize);
    
    const emailPromises = batch.map(async (recipient) => {
      try {
        const htmlContent = createNewsletterHtml(recipient.email, recipient.name);
        
        if (resend) {
          await resend.emails.send({
            from: `Lovas Zoltán <${process.env.RESEND_FROM_EMAIL || 'noreply@lovaszoltan.dev'}>`,
            to: recipient.email,
            subject: campaign.subject,
            html: htmlContent,
            headers: {
              'List-Unsubscribe': `<${process.env.NEXTAUTH_URL}/newsletter/unsubscribe?email=${encodeURIComponent(recipient.email)}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
            }
          });
        } else {
          console.log(`⚠️ Skipping email send to ${recipient.email} - Resend API key not configured`);
        }
        
        // Track analytics
        await prisma.newsletterAnalytics.create({
          data: {
            campaignId: campaign.id,
            subscriberEmail: recipient.email,
            sentAt: new Date()
          }
        }).catch(() => {
          // Ignore duplicate key errors
        });
        
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${recipient.email}:`, error);
      }
    });
    
    await Promise.all(emailPromises);
    
    // Add delay between batches
    if (i + batchSize < recipientEmails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return sentCount;
}

function calculateNextSendDate(campaign: any): Date {
  const currentNext = new Date(campaign.nextSendDate);
  
  switch (campaign.recurringType) {
    case 'WEEKLY':
      currentNext.setDate(currentNext.getDate() + 7);
      break;
    case 'MONTHLY':
      currentNext.setMonth(currentNext.getMonth() + 1);
      break;
    case 'QUARTERLY':
      currentNext.setMonth(currentNext.getMonth() + 3);
      break;
    default:
      currentNext.setDate(currentNext.getDate() + 7); // Default to weekly
  }
  
  return currentNext;
}
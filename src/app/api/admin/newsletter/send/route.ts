import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";

// Initialize Resend only if API key is available
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// POST /api/admin/newsletter/send - Send newsletter
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { subject, content, recipients, selectedIds, testEmail } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    let recipientEmails: { email: string; name: string }[] = [];

    // Determine recipients based on type
    switch (recipients) {
      case 'all':
        // Get all active newsletter subscribers
        const allSubscribers = await prisma.contact.findMany({
          where: { newsletter: true },
          select: { email: true, name: true }
        });
        recipientEmails = allSubscribers.map(sub => ({
          email: sub.email,
          name: sub.name
        }));
        break;

      case 'selected':
        if (!selectedIds || selectedIds.length === 0) {
          return NextResponse.json(
            { error: 'No subscribers selected' },
            { status: 400 }
          );
        }
        // Get selected subscribers
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
        break;

      case 'test':
        if (!testEmail) {
          return NextResponse.json(
            { error: 'Test email address is required' },
            { status: 400 }
          );
        }
        recipientEmails = [{ email: testEmail, name: 'Test User' }];
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid recipient type' },
          { status: 400 }
        );
    }

    if (recipientEmails.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found' },
        { status: 400 }
      );
    }

    // Create newsletter HTML with unsubscribe link
    const createNewsletterHtml = (recipientEmail: string, recipientName: string) => {
      const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;
      
      return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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
    h2, h3 { color: #1f2937; }
    a { color: #3b82f6; }
    .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .button:hover { background-color: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lovas Zoltán Hírlevél</h1>
    </div>
    
    <div class="content">
      <p>Kedves ${recipientName}!</p>
      ${content}
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

    // Send emails
    let sentCount = 0;
    const errors: string[] = [];

    // Send in batches to avoid rate limits
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
              subject: recipients === 'test' ? `[TESZT] ${subject}` : subject,
              html: htmlContent,
              headers: {
                'List-Unsubscribe': `<${process.env.NEXTAUTH_URL}/newsletter/unsubscribe?email=${encodeURIComponent(recipient.email)}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
              }
            });
          } else {
            console.log(`⚠️ Skipping email send to ${recipient.email} - Resend API key not configured`);
          }
          
          sentCount++;
          console.log(`Newsletter sent to: ${recipient.email}`);
        } catch (emailError) {
          console.error(`Failed to send to ${recipient.email}:`, emailError);
          errors.push(`${recipient.email}: ${(emailError as Error).message}`);
        }
      });
      
      await Promise.all(emailPromises);
      
      // Add delay between batches
      if (i + batchSize < recipientEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // TODO: Log newsletter send to database for statistics
    // You can create a newsletter_sends table to track:
    // - subject, content, sent_count, sent_at, created_by, etc.

    const result = {
      success: true,
      sentCount,
      totalRecipients: recipientEmails.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Newsletter sent to ${sentCount} out of ${recipientEmails.length} recipients`
    };

    if (errors.length > 0) {
      console.error('Newsletter sending errors:', errors);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
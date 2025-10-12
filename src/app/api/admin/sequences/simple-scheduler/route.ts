import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

// Initialize Resend only if API key is available
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// Initialize Prisma conditionally
let prisma: PrismaClient | null = null;
if (process.env.DATABASE_URL) {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
} else {
  console.log('⚠️ DATABASE_URL not found - Prisma client not initialized');
}

// POST /api/admin/sequences/simple-scheduler - Simple sequence processor
export async function POST(request: Request) {
  try {
    // Check if Prisma is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available - DATABASE_URL not configured' },
        { status: 503 }
      );
    }

    // Verify scheduler authorization
    const body = await request.json();
    
    if (body.authorization !== process.env.SCHEDULER_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized scheduler access' },
        { status: 401 }
      );
    }

    const now = new Date();
    console.log(`[SEQUENCE] 🔄 Processing sequences at ${now.toISOString()}`);

    let totalEmailsSent = 0;
    const results: any[] = [];

    // Find executions with due emails
    const dueExecutions = await prisma.sequenceExecution.findMany({
      where: {
        status: 'ACTIVE',
        nextEmailDue: {
          lte: now
        }
      },
      include: {
        sequence: {
          include: {
            emails: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    console.log(`[SEQUENCE] 📧 Found ${dueExecutions.length} executions with due emails`);

    for (const execution of dueExecutions) {
      try {
        const { sequence } = execution;
        const currentEmail = sequence.emails.find((e: any) => e.order === execution.currentStep);
        
        if (!currentEmail) {
          console.log(`[SEQUENCE] ⚠️ No email found for step ${execution.currentStep}`);
          continue;
        }

        // Send email
        const emailContent = processEmailTemplate(currentEmail.content, {
          name: execution.subscriberName || 'Kedves Feliratkozó',
          email: execution.subscriberEmail
        });

        if (resend) {
          await resend.emails.send({
            from: `Lovas Zoltán <${process.env.RESEND_FROM_EMAIL}>`,
            to: execution.subscriberEmail,
            subject: currentEmail.subject,
            html: emailContent
          });
        } else {
          console.log(`⚠️ Skipping sequence email to ${execution.subscriberEmail} - Resend API key not configured`);
        }

        // Log the email sending
        await prisma.sequenceLog.create({
          data: {
            executionId: execution.id,
            action: 'EMAIL_SENT',
            emailOrder: currentEmail.order,
            details: {
              subject: currentEmail.subject,
              emailName: currentEmail.name
            }
          }
        });

        // Calculate next email timing
        const nextEmail = sequence.emails.find((e: any) => e.order === execution.currentStep + 1);
        let nextEmailDue = null;
        
        if (nextEmail) {
          const [hours, minutes] = nextEmail.sendTime.split(':').map(Number);
          if (hours === 0 && minutes <= 10) {
            // Test mode: add minutes
            nextEmailDue = new Date(now.getTime() + minutes * 60 * 1000);
          } else {
            // Normal mode: set specific time
            nextEmailDue = new Date();
            nextEmailDue.setDate(nextEmailDue.getDate() + nextEmail.delayDays);
            nextEmailDue.setHours(hours, minutes, 0, 0);
          }
        }

        // Update execution
        await prisma.sequenceExecution.update({
          where: { id: execution.id },
          data: {
            currentStep: nextEmail ? execution.currentStep + 1 : execution.currentStep,
            emailsSent: execution.emailsSent + 1,
            lastEmailSent: now,
            nextEmailDue: nextEmailDue,
            status: nextEmail ? 'ACTIVE' : 'COMPLETED',
            completedAt: nextEmail ? null : now
          }
        });

        console.log(`[SEQUENCE] ✅ Sent "${currentEmail.name}" to ${execution.subscriberEmail}`);
        totalEmailsSent++;

      } catch (error) {
        console.error(`[SEQUENCE] ❌ Error processing execution ${execution.id}:`, error);
      }
    }

    const response = {
      success: true,
      processedSequences: dueExecutions.length > 0 ? 1 : 0,
      emailsSent: totalEmailsSent,
      results: results
    };

    console.log(`[SEQUENCE] ✅ Completed: ${totalEmailsSent} emails sent`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[SEQUENCE] ❌ Scheduler error:', error);
    return NextResponse.json(
      { error: 'Sequence scheduler failed: ' + (error as Error).message },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Process email template variables
function processEmailTemplate(content: string, variables: { name: string; email: string }): string {
  return content
    .replace(/\{NAME\}/g, variables.name)
    .replace(/\{EMAIL\}/g, variables.email)
    .replace(/\{DATE\}/g, new Date().toLocaleDateString('hu-HU'))
    .replace(/\{MONTH\}/g, new Date().toLocaleDateString('hu-HU', { month: 'long' }))
    .replace(/\{YEAR\}/g, new Date().getFullYear().toString());
}
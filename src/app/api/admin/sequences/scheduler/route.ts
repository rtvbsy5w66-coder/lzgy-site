import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { SequenceSchedulerResult, SequenceProcessResult } from "@/types/sequence";

// Initialize Resend only if API key is available
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// POST /api/admin/sequences/scheduler - Process due sequence emails
export async function POST(request: Request) {
  try {
    // Verify scheduler authorization
    const { authorization } = await request.json();
    
    if (authorization !== process.env.SCHEDULER_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized scheduler access' },
        { status: 401 }
      );
    }

    const now = new Date();
    console.log(`[${now.toISOString()}] 🔄 Starting sequence scheduler...`);

    let totalEmailsSent = 0;
    const results: SequenceProcessResult[] = [];

    // 1. Process new enrollments for running sequences
    await enrollNewSubscribers();

    // 2. Find and process due emails
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

    console.log(`📧 Found ${dueExecutions.length} executions with due emails`);

    // Group by sequence for better processing
    const executionsBySequence = dueExecutions.reduce((acc, execution) => {
      if (!acc[execution.sequenceId]) {
        acc[execution.sequenceId] = [];
      }
      acc[execution.sequenceId].push(execution);
      return acc;
    }, {} as Record<string, typeof dueExecutions>);

    // Process each sequence
    for (const [sequenceId, executions] of Object.entries(executionsBySequence)) {
      try {
        const sequence = executions[0].sequence;
        console.log(`📨 Processing sequence: ${sequence.name} (${executions.length} due emails)`);

        let sequenceEmailsSent = 0;
        const sequenceErrors: string[] = [];

        for (const execution of executions) {
          try {
            const emailSent = await processSequenceExecution(execution);
            if (emailSent) {
              sequenceEmailsSent++;
              totalEmailsSent++;
            }
          } catch (error) {
            console.error(`❌ Error processing execution ${execution.id}:`, error);
            sequenceErrors.push(`Execution ${execution.subscriberEmail}: ${(error as Error).message}`);
          }
        }

        results.push({
          sequenceId,
          sequenceName: sequence.name,
          emailsSent: sequenceEmailsSent,
          errors: sequenceErrors.length > 0 ? sequenceErrors : undefined,
          success: sequenceErrors.length === 0
        });

      } catch (error) {
        console.error(`❌ Error processing sequence ${sequenceId}:`, error);
        results.push({
          sequenceId,
          sequenceName: 'Unknown',
          emailsSent: 0,
          errors: [(error as Error).message],
          success: false
        });
      }
    }

    console.log(`✅ Sequence scheduler completed: ${totalEmailsSent} emails sent`);

    const response: SequenceSchedulerResult = {
      processedSequences: Object.keys(executionsBySequence).length,
      emailsSent: totalEmailsSent,
      results
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Sequence scheduler error:', error);
    return NextResponse.json(
      { error: 'Sequence scheduler failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Enroll new subscribers to active sequences
async function enrollNewSubscribers() {
  const activeSequences = await prisma.campaignSequence.findMany({
    where: {
      status: 'RUNNING',
      autoEnroll: true
    }
  });

  for (const sequence of activeSequences) {
    try {
      // Get target subscribers based on audience
      const subscribers = await getTargetSubscribers(sequence);
      
      // Find subscribers not yet enrolled
      const existingExecutions = await prisma.sequenceExecution.findMany({
        where: { sequenceId: sequence.id },
        select: { subscriberEmail: true }
      });
      
      const existingEmails = new Set(existingExecutions.map(e => e.subscriberEmail));
      const newSubscribers = subscribers.filter(s => !existingEmails.has(s.email));

      if (newSubscribers.length > 0) {
        console.log(`➕ Enrolling ${newSubscribers.length} new subscribers to: ${sequence.name}`);
        
        // Create executions for new subscribers
        const firstEmail = await prisma.sequenceEmail.findFirst({
          where: { sequenceId: sequence.id, order: 1 }
        });
        
        const executionsData = newSubscribers.map(subscriber => ({
          sequenceId: sequence.id,
          subscriberEmail: subscriber.email,
          subscriberName: subscriber.name,
          status: 'ACTIVE' as const,
          currentStep: 1,
          nextEmailDue: calculateNextEmailDue(new Date(), 0, firstEmail?.sendTime || '09:00')
        }));

        await prisma.sequenceExecution.createMany({
          data: executionsData
        });
      }
    } catch (error) {
      console.error(`❌ Error enrolling subscribers for sequence ${sequence.id}:`, error);
    }
  }
}

// Process individual sequence execution
async function processSequenceExecution(execution: any): Promise<boolean> {
  const { sequence } = execution;
  const currentEmail = sequence.emails.find((e: any) => e.order === execution.currentStep);
  
  if (!currentEmail) {
    console.log(`⚠️ No email found for step ${execution.currentStep} in sequence ${sequence.name}`);
    return false;
  }

  try {
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
        html: emailContent,
        headers: {
          'List-Unsubscribe': `<${process.env.NEXTAUTH_URL}/newsletter/unsubscribe?email=${encodeURIComponent(execution.subscriberEmail)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
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

    // Calculate next email due date
    const nextEmail = sequence.emails.find((e: any) => e.order === execution.currentStep + 1);
    const nextEmailDue = nextEmail 
      ? calculateNextEmailDue(new Date(), nextEmail.delayDays - currentEmail.delayDays, nextEmail.sendTime)
      : null;

    // Update execution
    await prisma.sequenceExecution.update({
      where: { id: execution.id },
      data: {
        currentStep: nextEmail ? execution.currentStep + 1 : execution.currentStep,
        emailsSent: execution.emailsSent + 1,
        lastEmailSent: new Date(),
        nextEmailDue,
        status: nextEmail ? 'ACTIVE' : 'COMPLETED',
        completedAt: nextEmail ? null : new Date()
      }
    });

    console.log(`✅ Sent email "${currentEmail.name}" to ${execution.subscriberEmail}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send email to ${execution.subscriberEmail}:`, error);
    
    // Log the error
    await prisma.sequenceLog.create({
      data: {
        executionId: execution.id,
        action: 'EMAIL_FAILED',
        emailOrder: currentEmail.order,
        details: {
          error: (error as Error).message,
          subject: currentEmail.subject
        }
      }
    });

    return false;
  }
}

// Get target subscribers based on sequence audience settings
async function getTargetSubscribers(sequence: any) {
  switch (sequence.targetAudience) {
    case 'ALL':
      return await prisma.contact.findMany({
        where: { newsletter: true },
        select: { email: true, name: true }
      });
      
    case 'NEWSLETTER_SUBSCRIBERS':
      const contacts = await prisma.contact.findMany({
        where: { newsletter: true },
        select: { email: true, name: true }
      });
      const newsletterSubs = await prisma.newsletterSubscription.findMany({
        where: { isActive: true },
        select: { email: true, name: true }
      });
      // Combine and deduplicate
      const allSubs = [...contacts, ...newsletterSubs];
      return allSubs.reduce((acc, current) => {
        const existing = acc.find(item => item.email === current.email);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, [] as typeof allSubs);
      
    case 'STUDENTS':
    case 'VOTERS':
    case 'SUPPORTERS':
      // For now, return newsletter subscribers
      // TODO: Implement audience filtering based on tags/categories
      return await prisma.contact.findMany({
        where: { newsletter: true },
        select: { email: true, name: true }
      });
      
    default:
      return [];
  }
}

// Calculate when next email should be sent
function calculateNextEmailDue(baseDate: Date, delayDays: number, sendTime: string): Date {
  const sendDate = new Date(baseDate);
  
  // For testing: if sendTime is 00:01, 00:02, 00:03 etc, treat as minutes
  const [hours, minutes] = sendTime.split(':').map(Number);
  
  if (hours === 0 && minutes <= 10) {
    // Test mode: add minutes instead of setting time
    sendDate.setMinutes(sendDate.getMinutes() + minutes);
  } else {
    // Normal mode: set specific time and add days
    sendDate.setDate(sendDate.getDate() + delayDays);
    sendDate.setHours(hours, minutes, 0, 0);
  }
  
  return sendDate;
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
#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to add tracking to email content
function addEmailTracking(htmlContent, trackingData) {
  const { sequenceId, executionId, email, emailOrder } = trackingData;
  
  // Build tracking URLs
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const trackingPixelUrl = `${baseUrl}/api/newsletter/track/open?sequence=${sequenceId}&execution=${executionId}&email=${encodeURIComponent(email)}&order=${emailOrder}`;
  
  // Add tracking pixel just before closing body tag
  const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none" alt="" />`;
  
  // Add tracking pixel
  let trackedContent = htmlContent;
  if (trackedContent.includes('</body>')) {
    trackedContent = trackedContent.replace('</body>', `${trackingPixel}</body>`);
  } else if (trackedContent.includes('</div>')) {
    // If no body tag, add before last div
    const lastDivIndex = trackedContent.lastIndexOf('</div>');
    trackedContent = trackedContent.substring(0, lastDivIndex) + trackingPixel + trackedContent.substring(lastDivIndex);
  } else {
    // Just append at the end
    trackedContent += trackingPixel;
  }
  
  // Add click tracking to links
  trackedContent = trackedContent.replace(
    /<a([^>]+)href=["']([^"']+)["']([^>]*)>/gi,
    (match, before, url, after) => {
      // Skip if already has tracking or is tracking URL
      if (url.includes('/api/newsletter/track/') || url.includes('tracking')) {
        return match;
      }
      
      const clickTrackingUrl = `${baseUrl}/api/newsletter/track/click?sequence=${sequenceId}&execution=${executionId}&email=${encodeURIComponent(email)}&order=${emailOrder}&url=${encodeURIComponent(url)}&text=link`;
      return `<a${before}href="${clickTrackingUrl}"${after}>`;
    }
  );
  
  return trackedContent;
}

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function processSequences() {
  try {
    log('🔄 Direct sequence processing started...');

    const now = new Date();
    let totalEmailsSent = 0;

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

    log(`📧 Found ${dueExecutions.length} executions with due emails`);

    for (const execution of dueExecutions) {
      try {
        const { sequence } = execution;
        const currentEmail = sequence.emails.find(e => e.order === execution.currentStep);
        
        if (!currentEmail) {
          log(`⚠️ No email found for step ${execution.currentStep} in sequence ${sequence.name}`);
          continue;
        }

        log(`📨 Sending "${currentEmail.name}" to ${execution.subscriberEmail}`);

        // Process template variables
        let emailContent = currentEmail.content
          .replace(/\{NAME\}/g, execution.subscriberName || 'Kedves Feliratkozó')
          .replace(/\{EMAIL\}/g, execution.subscriberEmail)
          .replace(/\{DATE\}/g, new Date().toLocaleDateString('hu-HU'))
          .replace(/\{MONTH\}/g, new Date().toLocaleDateString('hu-HU', { month: 'long' }))
          .replace(/\{YEAR\}/g, new Date().getFullYear().toString());
        
        // Add email tracking
        emailContent = addEmailTracking(emailContent, {
          sequenceId: sequence.id,
          executionId: execution.id,
          email: execution.subscriberEmail,
          emailOrder: currentEmail.order
        });
        
        log(`🎯 Added tracking to email for ${execution.subscriberEmail}`);

        // Send email
        await resend.emails.send({
          from: `Lovas Zoltán <${process.env.RESEND_FROM_EMAIL}>`,
          to: execution.subscriberEmail,
          subject: currentEmail.subject,
          html: emailContent
        });

        // Log the email sending
        await prisma.sequenceLog.create({
          data: {
            executionId: execution.id,
            action: 'EMAIL_SENT',
            emailOrder: currentEmail.order,
            details: {
              subject: currentEmail.subject,
              emailName: currentEmail.name,
              timestamp: now.toISOString()
            }
          }
        });

        // Calculate next email timing
        const nextEmail = sequence.emails.find(e => e.order === execution.currentStep + 1);
        let nextEmailDue = null;
        
        if (nextEmail) {
          const [hours, minutes] = nextEmail.sendTime.split(':').map(Number);
          if (hours === 0 && minutes <= 10) {
            // Test mode: add minutes to current time
            nextEmailDue = new Date(now.getTime() + minutes * 60 * 1000);
            log(`⏰ Next email (#${nextEmail.order}) scheduled for ${nextEmailDue.toLocaleString('hu-HU')} (${minutes} minutes from now)`);
          } else {
            // Normal mode: set specific time and add days
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

        log(`✅ Successfully sent "${currentEmail.name}" to ${execution.subscriberEmail}`);
        totalEmailsSent++;

      } catch (error) {
        log(`❌ Error processing execution ${execution.id}: ${error.message}`);
        
        // Log the error
        await prisma.sequenceLog.create({
          data: {
            executionId: execution.id,
            action: 'EMAIL_FAILED',
            emailOrder: execution.currentStep,
            details: {
              error: error.message,
              timestamp: now.toISOString()
            }
          }
        });
      }
    }

    log(`✅ Sequence processing completed: ${totalEmailsSent} emails sent`);
    return { success: true, emailsSent: totalEmailsSent };

  } catch (error) {
    log(`❌ Sequence processing failed: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  processSequences()
    .then(result => {
      if (result.success) {
        console.log(`🎯 SUCCESS: ${result.emailsSent} emails sent`);
        process.exit(0);
      } else {
        console.log(`❌ FAILED: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(`💥 CRASH: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { processSequences };
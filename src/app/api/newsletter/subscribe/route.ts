import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { sendNewsletterConfirmation, sendContactNotification } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { NewsletterCategory, NewsletterSource } from "@/types/newsletter";
import crypto from 'crypto';

// POST /api/newsletter/subscribe - Subscribe to newsletter categories
export async function POST(request: Request) {
  try {
    console.log("Newsletter subscription request received");
    
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const isAllowed = await checkRateLimit({
      limit: 5, // Maximum 5 subscription requests
      windowMs: 15 * 60 * 1000, // 15 minutes
      currentTimestamp: Date.now()
    });

    if (!isAllowed) {
      console.warn(`Rate limit exceeded for newsletter subscription. IP: ${clientIP}`);
      return NextResponse.json(
        { 
          error: "Túl sok kérés. Kérjük, várjon 15 percet.",
          retryAfter: 900
        }, 
        { status: 429 }
      );
    }

    const data = await request.json();
    const { name, email, categories, source = 'CONTACT_FORM' } = data;

    // Validation
    if (!name || !email || !categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Név, email cím és kategóriák megadása kötelező' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Érvénytelen email formátum' },
        { status: 400 }
      );
    }

    // Validate categories
    const validCategories = Object.values(NewsletterCategory);
    const invalidCategories = categories.filter((cat: string) => !validCategories.includes(cat as NewsletterCategory));
    if (invalidCategories.length > 0) {
      return NextResponse.json(
        { error: `Érvénytelen kategóriák: ${invalidCategories.join(', ')}` },
        { status: 400 }
      );
    }

    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'Legalább egy kategóriát ki kell választani' },
        { status: 400 }
      );
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    console.log(`Processing newsletter subscription for: ${email}, categories: ${categories.join(', ')}`);

    // Check if subscription already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    let subscription;
    
    if (existingSubscription) {
      // Update existing subscription
      console.log("Updating existing newsletter subscription");
      subscription = await prisma.newsletterSubscription.update({
        where: { email: email.toLowerCase().trim() },
        data: {
          name: name,
          categories: JSON.stringify(categories),
          isActive: true,
          source: source as NewsletterSource,
          lastUpdatedAt: new Date(),
          unsubscribeToken: unsubscribeToken
        }
      });
    } else {
      // Create new subscription
      console.log("Creating new newsletter subscription");
      subscription = await prisma.newsletterSubscription.create({
        data: {
          email: email.toLowerCase().trim(),
          name: name,
          categories: JSON.stringify(categories),
          isActive: true,
          source: source as NewsletterSource,
          unsubscribeToken: unsubscribeToken
        }
      });
    }

    console.log("Newsletter subscription saved:", subscription.id);

    // Send emails
    try {
      // 1. Confirmation email to subscriber
      const confirmationResult = await sendNewsletterConfirmation({
        name: name,
        email: email,
        categories: categories
      });

      if (confirmationResult.success) {
        console.log("✅ Newsletter confirmation email sent to subscriber");
      } else {
        console.error("❌ Failed to send confirmation email:", confirmationResult.error);
      }

      // 2. Admin notification email
      const adminNotificationResult = await sendContactNotification({
        name: name,
        email: email,
        subject: `Newsletter feliratkozás: ${categories.join(', ')}`,
        message: `Új newsletter feliratkozás érkezett a következő kategóriákra: ${categories.join(', ')}\n\nForrás: ${source}`,
        newsletter: true
      });

      if (adminNotificationResult.success) {
        console.log("✅ Admin notification email sent");
      } else {
        console.error("❌ Failed to send admin notification");
      }

    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter feliratkozás sikeres',
      subscription: {
        id: subscription.id,
        email: subscription.email,
        categories: JSON.parse(subscription.categories),
        subscribedAt: subscription.subscribedAt
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a feliratkozás során. Kérjük, próbálja újra.' },
      { status: 500 }
    );
  }
}

// GET method not allowed
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
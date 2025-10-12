import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { sendUnsubscribeConfirmation, sendUnsubscribeNotification } from "@/lib/email";
import { NewsletterCategory } from "@/types/newsletter";

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter categories
export async function POST(request: Request) {
  try {
    const { email, categories, unsubscribeAll = false, unsubscribeToken } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log(`Newsletter unsubscribe request: ${email}, unsubscribeAll: ${unsubscribeAll}, categories: ${categories?.join(', ') || 'none'}`);

    // Check new newsletter subscription system first
    const newsletterSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Also check old contact system for backward compatibility
    const contact = await prisma.contact.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        newsletter: true
      }
    });

    if (!newsletterSubscription && !contact) {
      return NextResponse.json(
        { error: 'Email address not found in newsletter list' },
        { status: 404 }
      );
    }

    let unsubscribeAction = '';

    // Handle new newsletter subscription system
    if (newsletterSubscription) {
      if (unsubscribeAll) {
        // Deactivate entire subscription
        await prisma.newsletterSubscription.update({
          where: { email: email.toLowerCase().trim() },
          data: { 
            isActive: false,
            lastUpdatedAt: new Date()
          }
        });
        unsubscribeAction = 'Minden kategóriából leiratkozva';
      } else if (categories && categories.length > 0) {
        // Remove specific categories
        const currentCategories = JSON.parse(newsletterSubscription.categories) as NewsletterCategory[];
        const remainingCategories = currentCategories.filter(cat => !categories.includes(cat));
        
        if (remainingCategories.length === 0) {
          // If no categories left, deactivate subscription
          await prisma.newsletterSubscription.update({
            where: { email: email.toLowerCase().trim() },
            data: { 
              isActive: false,
              lastUpdatedAt: new Date()
            }
          });
          unsubscribeAction = 'Minden kategóriából leiratkozva (utolsó kategóriák eltávolítva)';
        } else {
          // Update with remaining categories
          await prisma.newsletterSubscription.update({
            where: { email: email.toLowerCase().trim() },
            data: {
              categories: JSON.stringify(remainingCategories),
              lastUpdatedAt: new Date()
            }
          });
          unsubscribeAction = `Leiratkozva: ${categories.join(', ')}. Aktív kategóriák: ${remainingCategories.join(', ')}`;
        }
      } else {
        // No specific categories provided, unsubscribe from all
        await prisma.newsletterSubscription.update({
          where: { email: email.toLowerCase().trim() },
          data: { 
            isActive: false,
            lastUpdatedAt: new Date()
          }
        });
        unsubscribeAction = 'Minden kategóriából leiratkozva (alapértelmezett)';
      }
    }

    // Handle old contact system for backward compatibility
    if (contact) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { newsletter: false }
      });
      if (!unsubscribeAction) {
        unsubscribeAction = 'Leiratkozva (legacy rendszer)';
      }
    }

    const unsubscribeTime = new Date().toLocaleString('hu-HU', {
      timeZone: 'Europe/Budapest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    console.log(`Newsletter unsubscribe: ${email} at ${unsubscribeTime} - ${unsubscribeAction}`);

    // BIZTONSÁGI FEJLESZTÉS: Email értesítések küldése
    try {
      // 1. Megerősítő email a leiratkozott felhasználónak (GDPR compliance)
      const userName = newsletterSubscription?.name || contact?.name || 'Felhasználó';
      const userConfirmationResult = await sendUnsubscribeConfirmation({
        name: userName,
        email: email
      });

      if (userConfirmationResult.success) {
        console.log("✅ Leiratkozás megerősítő email elküldve a felhasználónak");
      } else {
        console.error("❌ Leiratkozás megerősítő email küldése sikertelen:", userConfirmationResult.error);
      }

      // 2. Admin értesítő email (biztonsági nyomon követés)
      const adminNotificationResult = await sendUnsubscribeNotification({
        name: userName,
        email: email,
        unsubscribeTime: unsubscribeTime,
        action: unsubscribeAction
      });

      if (adminNotificationResult.success) {
        console.log("✅ Admin értesítő email elküldve a leiratkozásról");
      } else {
        console.error("❌ Admin értesítő email küldése sikertelen:", adminNotificationResult.error);
      }

    } catch (emailError) {
      console.error("Email küldési hiba leiratkozáskor:", emailError);
      // Ne blokkoljuk a leiratkozást email hiba miatt, de logoljuk
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    );
  }
}
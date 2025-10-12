import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/admin/newsletter/subscribers - Get all newsletter subscribers
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get all contacts who subscribed to newsletter (legacy)
    const contactSubscribers = await prisma.contact.findMany({
      where: {
        newsletter: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        district: true,
        phone: true,
        createdAt: true,
        newsletter: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all newsletter subscriptions (new system)
    const newsletterSubscribers = await prisma.newsletterSubscription.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        categories: true,
        subscribedAt: true,
        isActive: true,
        source: true
      },
      orderBy: {
        subscribedAt: 'desc'
      }
    });

    // Transform legacy contact data
    const transformedContactSubscribers = contactSubscribers.map(subscriber => ({
      id: subscriber.id,
      name: subscriber.name,
      email: subscriber.email,
      district: subscriber.district,
      phone: subscriber.phone,
      subscribedAt: subscriber.createdAt.toISOString(),
      isActive: subscriber.newsletter,
      source: 'contact_form',
      categories: ['ÁLTALÁNOS'] // Legacy subscriptions
    }));

    // Transform newsletter subscription data  
    const transformedNewsletterSubscribers = newsletterSubscribers.map(subscriber => ({
      id: subscriber.id,
      name: subscriber.name,
      email: subscriber.email,
      district: null, // Newsletter subscriptions don't have district
      phone: null, // Newsletter subscriptions don't have phone
      subscribedAt: subscriber.subscribedAt.toISOString(),
      isActive: subscriber.isActive,
      source: subscriber.source.toLowerCase(),
      categories: JSON.parse(subscriber.categories)
    }));

    // Combine both sources and remove duplicates by email
    const allSubscribers = [...transformedContactSubscribers, ...transformedNewsletterSubscribers];
    const uniqueSubscribers = allSubscribers.reduce((acc, current) => {
      const existing = acc.find(item => item.email === current.email);
      if (!existing) {
        acc.push(current);
      } else {
        // If duplicate, keep the newer one (newsletter subscription system is newer)
        if (current.source !== 'contact_form') {
          acc[acc.indexOf(existing)] = current;
        }
      }
      return acc;
    }, [] as typeof allSubscribers);

    // Sort by subscription date (newest first)
    const transformedSubscribers = uniqueSubscribers.sort((a, b) => 
      new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: transformedSubscribers,
      count: transformedSubscribers.length
    });

  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter subscribers' },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET /api/admin/newsletter/export - Export subscribers as CSV
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get all newsletter subscribers
    const subscribers = await prisma.contact.findMany({
      where: {
        newsletter: true
      },
      select: {
        name: true,
        email: true,
        phone: true,
        district: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Create CSV content
    const csvHeaders = [
      'Név',
      'Email',
      'Telefon',
      'Kerület',
      'Feliratkozás dátuma'
    ];

    const csvRows = subscribers.map(subscriber => [
      `"${subscriber.name.replace(/"/g, '""')}"`, // Escape quotes in name
      `"${subscriber.email}"`,
      `"${subscriber.phone || ''}"`,
      `"${subscriber.district || ''}"`,
      `"${new Date(subscriber.createdAt).toLocaleDateString('hu-HU')}"`
    ]);

    // Combine headers and rows
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Create response with CSV content
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error exporting newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to export subscribers' },
      { status: 500 }
    );
  }
}
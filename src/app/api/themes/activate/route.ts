import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { User_role } from "@prisma/client";

// POST /api/themes/activate - Activate/Deactivate theme
export async function POST(request: Request) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== User_role.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized - Admin role required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { themeId, isActive } = body;

    if (!themeId) {
      return NextResponse.json(
        { error: "Theme ID is required" },
        { status: 400 }
      );
    }

    console.log(`[THEME_ACTIVATION] Admin ${session.user.email} ${isActive ? 'activating' : 'deactivating'} theme ${themeId}`);

    // Get the theme to activate
    const themeToUpdate = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!themeToUpdate) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
    }

    // If activating a theme, use transaction to deactivate others of same type
    if (isActive && themeToUpdate.type !== "CATEGORY") {
      console.log(`[THEME_ACTIVATION] Deactivating other ${themeToUpdate.type} themes and activating ${themeId}`);
      
      const result = await prisma.$transaction([
        // Deactivate all themes of the same type
        prisma.theme.updateMany({
          where: {
            type: themeToUpdate.type,
            isActive: true,
            id: { not: themeId } // Don't deactivate the theme we're about to activate
          },
          data: {
            isActive: false,
          },
        }),
        // Activate the selected theme
        prisma.theme.update({
          where: { id: themeId },
          data: {
            isActive: true,
            updatedAt: new Date(),
          },
        }),
      ]);

      console.log(`[THEME_ACTIVATION] Transaction completed successfully`);
      return NextResponse.json({
        success: true,
        activatedTheme: result[1],
        deactivatedCount: result[0].count
      });
    } else {
      // Simple deactivation (no transaction needed)
      const updatedTheme = await prisma.theme.update({
        where: { id: themeId },
        data: {
          isActive,
          updatedAt: new Date(),
        },
      });

      console.log(`[THEME_ACTIVATION] Theme ${themeId} updated: isActive=${isActive}`);
      return NextResponse.json({
        success: true,
        theme: updatedTheme
      });
    }

  } catch (error) {
    console.error("POST /api/themes/activate error:", error);
    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 }
    );
  }
}
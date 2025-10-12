import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";

// GET /api/themes/active - Get currently active themes by type
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let where: any = { isActive: true };
    
    // If type is specified, filter by type
    if (type) {
      where.type = type.toUpperCase();
    }

    const activeThemes = await prisma.theme.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    console.log(`[ACTIVE_THEMES] Found ${activeThemes.length} active themes${type ? ` of type ${type}` : ''}`);

    // If requesting specific type, return single theme or null
    if (type) {
      const theme = activeThemes[0] || null;
      return NextResponse.json(theme);
    }

    // Return all active themes grouped by type
    const themesByType = activeThemes.reduce((acc, theme) => {
      acc[theme.type] = theme;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(themesByType);

  } catch (error) {
    console.error("GET /api/themes/active error:", error);
    return NextResponse.json(
      { error: "Failed to fetch active themes" },
      { status: 500 }
    );
  }
}

// POST /api/themes/active/config - Update theme config (for dark mode variants)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { themeId, config } = body;

    if (!themeId || !config) {
      return NextResponse.json(
        { error: "Theme ID and config are required" },
        { status: 400 }
      );
    }

    // Validate config structure
    const validatedConfig = {
      light: {
        bg: config.light?.bg || "#ffffff",
        text: config.light?.text || "#111111",
        cardBg: config.light?.cardBg || "#f7f7f7",
        border: config.light?.border || "#e5e7eb",
        input: config.light?.input || "#ffffff"
      },
      dark: {
        bg: config.dark?.bg || "#111111",
        text: config.dark?.text || "#ffffff", 
        cardBg: config.dark?.cardBg || "#222222",
        border: config.dark?.border || "#374151",
        input: config.dark?.input || "#1f2937"
      }
    };

    const updatedTheme = await prisma.theme.update({
      where: { id: themeId },
      data: {
        // Store config as JSON string (we'll need to add this field to schema)
        description: `${body.description || ''}\n\nConfig: ${JSON.stringify(validatedConfig)}`,
        updatedAt: new Date(),
      },
    });

    console.log(`[THEME_CONFIG] Updated theme ${themeId} with dark/light mode config`);

    return NextResponse.json({
      success: true,
      theme: updatedTheme,
      config: validatedConfig
    });

  } catch (error) {
    console.error("POST /api/themes/active/config error:", error);
    return NextResponse.json(
      { error: "Failed to update theme config" },
      { status: 500 }
    );
  }
}
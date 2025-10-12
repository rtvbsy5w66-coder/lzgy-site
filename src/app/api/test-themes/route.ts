import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Redirect to the active themes API endpoint
    const activeThemesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/themes/active`);
    const activeThemes = await activeThemesResponse.json();

    return NextResponse.json({
      message: "Use /api/themes/active endpoint for theme data",
      activeThemes: activeThemes
    });
  } catch (error) {
    console.error("Theme test error:", error);
    return NextResponse.json(
      { error: "Hiba történt a témák tesztelése közben." },
      { status: 500 }
    );
  }
}

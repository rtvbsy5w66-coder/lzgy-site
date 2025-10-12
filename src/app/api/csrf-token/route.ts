// src/app/api/csrf-token/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { generateCSRFToken } from "@/lib/csrf-protection";
import { applySecurityMiddleware, SECURITY_CONFIGS } from "@/lib/security-middleware";

// GET /api/csrf-token - Generate CSRF token for frontend
export async function GET(req: NextRequest) {
  // 🔒 SECURITY: Apply rate limiting
  const securityResult = await applySecurityMiddleware(req, SECURITY_CONFIGS.PUBLIC_API);
  if (securityResult) return securityResult;
  try {
    const token = generateCSRFToken();
    
    return NextResponse.json({
      token,
      expires: Date.now() + (30 * 60 * 1000) // 30 minutes
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('[CSRF Token] Error generating token:', error);
    return NextResponse.json(
      { error: "Token generálási hiba" },
      { status: 500 }
    );
  }
}
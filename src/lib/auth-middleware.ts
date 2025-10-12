// src/lib/auth-middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { User_role } from "@prisma/client";

export async function requireAuth(req: NextRequest, requiredRole: User_role = User_role.ADMIN) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Hitelesítés szükséges", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Check if user has required role
    if (session.user.role !== requiredRole) {
      return NextResponse.json(
        { error: "Nincs jogosultsága ehhez a művelethez", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    return null; // Success, no error response
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return NextResponse.json(
      { error: "Hitelesítési hiba", code: "AUTH_ERROR" },
      { status: 500 }
    );
  }
}

export async function requireAdminAuth(req: NextRequest) {
  return requireAuth(req, User_role.ADMIN);
}

// Helper function to validate API key for service-to-service calls
export function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key');
  const validApiKey = process.env.INTERNAL_API_KEY;
  
  if (!validApiKey || !apiKey) {
    return false;
  }
  
  return apiKey === validApiKey;
}
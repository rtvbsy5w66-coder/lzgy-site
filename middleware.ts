import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { User_role } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for non-admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow login page without authentication
  if (pathname === '/admin/login') {
    // If already authenticated, redirect to dashboard
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (token?.role === User_role.ADMIN) {
      console.log(`[Middleware] Already logged in, redirecting to /admin`);
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.next();
  }

  // For all other admin routes, check authentication
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // Debug logging
  if (token) {
    console.log(`[Middleware] ✅ Token valid for ${pathname} - User: ${token.email}, Role: ${token.role}`);
  } else {
    console.log(`[Middleware] ❌ No token found for ${pathname}, redirecting to login`);
  }

  // Redirect to login if not authenticated or not admin
  if (!token || token.role !== User_role.ADMIN) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Ha van token, frissítsük a response-t, hogy a cookie ne járjon le
  const response = NextResponse.next();

  return response;
}

export const config = {
  matcher: '/admin/:path*',
};
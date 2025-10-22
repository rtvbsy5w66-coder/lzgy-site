import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Security Middleware
 *
 * Provides:
 * 1. Authentication & Authorization (JWT + RBAC)
 * 2. Security Headers (CSP, XSS, Clickjacking protection)
 *
 * Security Features:
 * - Server-side authentication (cannot be bypassed by disabling JavaScript)
 * - JWT token verification
 * - Role-based authorization (ADMIN required for admin routes)
 * - Automatic redirect to login page for unauthenticated users
 * - OWASP security headers
 */

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // 1. Content Security Policy (CSP)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://vercel.live wss://ws-*.pusher.com https://*.upstash.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // 2. X-Frame-Options (clickjacking védelem)
  response.headers.set('X-Frame-Options', 'DENY');

  // 3. X-Content-Type-Options (MIME sniffing védelem)
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 4. Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 5. Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // 6. Strict-Transport-Security (HTTPS only) - Production only
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // 7. X-XSS-Protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // 8. X-DNS-Prefetch-Control
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get JWT token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if accessing admin routes (UI or API)
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  if (isAdminRoute || isAdminApiRoute) {
    // No token = unauthenticated
    if (!token) {
      if (isAdminApiRoute) {
        // API routes return 401 JSON response
        return NextResponse.json(
          {
            error: 'Authentication required',
            message: 'You must be logged in to access this resource'
          },
          { status: 401 }
        );
      }

      // UI routes redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Has token but not ADMIN role
    if (token.role !== 'ADMIN') {
      if (isAdminApiRoute) {
        // API routes return 403 JSON response
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            message: 'Admin role required to access this resource'
          },
          { status: 403 }
        );
      }

      // UI routes redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Authenticated and authorized - allow request
    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', token.id as string);
    requestHeaders.set('x-user-email', token.email as string);
    requestHeaders.set('x-user-role', token.role as string);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return addSecurityHeaders(response);
  }

  // Non-admin routes - allow through with security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    // Apply to all routes for security headers
    // Exclude static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
};
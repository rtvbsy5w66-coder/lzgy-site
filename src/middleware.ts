import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Authentication Middleware
 *
 * Protects admin routes and API endpoints with JWT token verification
 * and role-based access control (RBAC).
 *
 * Security Features:
 * - Server-side authentication (cannot be bypassed by disabling JavaScript)
 * - JWT token verification
 * - Role-based authorization (ADMIN required for admin routes)
 * - Automatic redirect to login page for unauthenticated users
 */
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

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Non-admin routes - allow through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin UI routes
    '/admin/:path*',

    // Admin API routes
    '/api/admin/:path*',
  ]
};
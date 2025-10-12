import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Middleware disabled - authentication handled at component level
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/posts/:path*',
    '/admin/events/:path*',
    '/admin/messages/:path*',
    '/admin/slides/:path*',
    '/admin/themes/:path*',
    '/admin/newsletter/:path*',
    '/admin/partners/:path*',
    '/admin/petitions/:path*',
    '/admin/polls/:path*',
    '/admin/quizzes/:path*',
    '/admin/news-categories/:path*'
  ]
};
/**
 * Next.js Test Helpers
 *
 * Utilities for testing Next.js middleware and API routes
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Create a mock NextRequest for testing
 * This properly mocks the Next.js Request object with all required properties
 *
 * Supports both syntaxes:
 * - createMockNextRequest('https://example.com', { method: 'POST' })
 * - createMockNextRequest({ url: 'https://example.com', method: 'POST' })
 */
export function createMockNextRequest(
  urlOrOptions: string | { url: string; method?: string; headers?: Record<string, string>; body?: any },
  optionsOrUndefined?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  }
): NextRequest {
  // Handle both call signatures
  let url: string;
  let options: { method?: string; headers?: Record<string, string>; body?: any };

  if (typeof urlOrOptions === 'string') {
    // Old syntax: createMockNextRequest('url', { options })
    url = urlOrOptions;
    options = optionsOrUndefined || {};
  } else {
    // New syntax: createMockNextRequest({ url: 'url', method: 'GET' })
    url = urlOrOptions.url;
    options = {
      method: urlOrOptions.method,
      headers: urlOrOptions.headers,
      body: urlOrOptions.body,
    };
  }

  // Add protocol if missing (for relative URLs)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://example.com' + url;
  }

  const urlObj = new URL(url);

  const headers = new Headers(options.headers || {});

  // Create a proper Request object with proper initialization
  const requestInit: RequestInit = {
    method: options.method || 'GET',
    headers: headers,
  };

  // Only add body for methods that support it
  if (options.body && options.method && !['GET', 'HEAD'].includes(options.method)) {
    requestInit.body = JSON.stringify(options.body);
  }

  const request = new Request(url, requestInit);

  // Cast to NextRequest - this works because NextRequest extends Request
  const nextRequest = request as any as NextRequest;

  // Add Next.js specific properties
  Object.defineProperty(nextRequest, 'nextUrl', {
    value: {
      pathname: urlObj.pathname,
      search: urlObj.search,
      searchParams: urlObj.searchParams,
      href: urlObj.href,
      origin: urlObj.origin,
    },
    writable: false,
  });

  return nextRequest;
}

/**
 * Mock NextResponse methods for testing
 * Jest doesn't handle Next.js specific methods well, so we need to mock them
 */
export function setupNextResponseMocks() {
  // Mock NextResponse.next()
  const originalNext = NextResponse.next;
  (NextResponse as any).next = jest.fn((init?: any) => {
    return new Response(null, {
      status: 200,
      ...init,
    });
  });

  // Mock NextResponse.redirect()
  const originalRedirect = NextResponse.redirect;
  (NextResponse as any).redirect = jest.fn((url: string | URL, init?: number | ResponseInit) => {
    const status = typeof init === 'number' ? init : (init?.status || 307);

    const locationUrl = typeof url === 'string' ? url : url.toString();

    // Create proper headers with location
    const responseHeaders = new Headers();
    responseHeaders.set('location', locationUrl);
    responseHeaders.set('Location', locationUrl); // Ensure both cases work

    // Add any additional headers from init
    if (typeof init === 'object' && init?.headers) {
      const initHeaders = new Headers(init.headers);
      initHeaders.forEach((value, key) => {
        responseHeaders.set(key, value);
      });
    }

    return new Response(null, {
      status,
      headers: responseHeaders,
    });
  });

  // Mock NextResponse.json()
  const originalJson = NextResponse.json;
  (NextResponse as any).json = jest.fn((data: any, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  });

  // Return cleanup function
  return () => {
    (NextResponse as any).next = originalNext;
    (NextResponse as any).redirect = originalRedirect;
    (NextResponse as any).json = originalJson;
  };
}

/**
 * Extract response body as JSON
 * Handles both real Response objects and our mocked ones
 */
export async function getResponseJson(response: any): Promise<any> {
  // If response has json() method, use it
  if (typeof response.json === 'function') {
    try {
      return await response.json();
    } catch (e) {
      // Fall through to text() method
    }
  }

  // If response has text() method, use it
  if (typeof response.text === 'function') {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  // If response has body property (our mock), parse it directly
  if (response.body) {
    return JSON.parse(response.body);
  }

  return null;
}

/**
 * Create a mock JWT token for next-auth
 */
export function createMockJWTToken(overrides: Partial<{
  id: string;
  email: string;
  name: string;
  role: string;
}> = {}) {
  return {
    id: overrides.id || 'test-user-id',
    email: overrides.email || 'test@example.com',
    name: overrides.name || 'Test User',
    role: overrides.role || 'USER',
  };
}

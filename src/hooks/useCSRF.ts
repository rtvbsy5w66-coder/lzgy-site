// src/hooks/useCSRF.ts
'use client';

import { useEffect, useState, useCallback } from 'react';

interface CSRFTokenResponse {
  token: string;
  expires: number;
}

/**
 * React hook for CSRF token management
 *
 * Automatically fetches and refreshes CSRF tokens from /api/csrf-token
 * Handles token expiration and auto-refresh
 *
 * @returns {Object} CSRF token management object
 * @returns {string} csrfToken - Current CSRF token (empty string if loading)
 * @returns {boolean} loading - Whether the token is currently being fetched
 * @returns {Error | null} error - Any error that occurred during fetch
 * @returns {Function} refresh - Manually refresh the CSRF token
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { csrfToken, loading } = useCSRF();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *
 *     await fetch('/api/some-endpoint', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'X-CSRF-Token': csrfToken,
 *       },
 *       body: JSON.stringify(data),
 *     });
 *   };
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`CSRF token fetch failed: ${response.statusText}`);
      }

      const data: CSRFTokenResponse = await response.json();

      setCSRFToken(data.token);

      // Auto-refresh 5 minutes before expiration
      const refreshTime = data.expires - Date.now() - 5 * 60 * 1000;
      if (refreshTime > 0) {
        setTimeout(fetchToken, refreshTime);
      }
    } catch (err) {
      console.error('[useCSRF] Error fetching CSRF token:', err);
      setError(
        err instanceof Error ? err : new Error('Unknown error')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return {
    csrfToken,
    loading,
    error,
    refresh: fetchToken,
  };
}

/**
 * Utility function to add CSRF token to fetch headers
 *
 * @param headers - Existing headers object
 * @param csrfToken - CSRF token to add
 * @returns Headers object with CSRF token added
 *
 * @example
 * ```typescript
 * const { csrfToken } = useCSRF();
 *
 * const headers = withCSRFToken(
 *   { 'Content-Type': 'application/json' },
 *   csrfToken
 * );
 *
 * await fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers,
 *   body: JSON.stringify(data),
 * });
 * ```
 */
export function withCSRFToken(
  headers: HeadersInit = {},
  csrfToken: string
): HeadersInit {
  const headersObj =
    headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : Array.isArray(headers)
      ? Object.fromEntries(headers)
      : headers;

  return {
    ...headersObj,
    'X-CSRF-Token': csrfToken,
  };
}

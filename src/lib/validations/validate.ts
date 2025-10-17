/**
 * Validation Helpers for API Routes
 *
 * Utility functions to validate request data with Zod schemas
 * and return consistent error responses
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: NextResponse };

/**
 * Validate request body with a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validation result with typed data or error response
 *
 * @example
 * ```typescript
 * const result = await validateRequest(request, newsletterSubscribeSchema);
 * if (!result.success) return result.error;
 *
 * const { name, email, categories } = result.data;
 * ```
 */
export async function validateRequest<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<ValidationResult<z.infer<T>>> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Érvénytelen adatok',
            errors,
          },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: parsed.data };
  } catch (error) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Nem sikerült feldolgozni a kérést',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate query parameters with a Zod schema
 *
 * @param searchParams - URLSearchParams from Next.js request
 * @param schema - Zod schema to validate against
 * @returns Validation result with typed data or error response
 *
 * @example
 * ```typescript
 * const { searchParams } = new URL(request.url);
 * const result = validateQueryParams(searchParams, paginationSchema);
 * if (!result.success) return result.error;
 *
 * const { page, limit } = result.data;
 * ```
 */
export function validateQueryParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): ValidationResult<z.infer<T>> {
  const params = Object.fromEntries(searchParams.entries());

  // Convert numeric strings to numbers
  const normalizedParams: any = {};
  for (const [key, value] of Object.entries(params)) {
    const num = Number(value);
    normalizedParams[key] = isNaN(num) ? value : num;
  }

  const parsed = schema.safeParse(normalizedParams);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Érvénytelen query paraméterek',
          errors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: parsed.data };
}

/**
 * Validate path parameters (e.g., /api/posts/[id])
 *
 * @param params - Path parameters from Next.js
 * @param schema - Zod schema to validate against
 * @returns Validation result with typed data or error response
 *
 * @example
 * ```typescript
 * const result = validateParams({ id: params.id }, z.object({ id: z.string().cuid() }));
 * if (!result.success) return result.error;
 *
 * const { id } = result.data;
 * ```
 */
export function validateParams<T extends z.ZodTypeAny>(
  params: Record<string, string | string[]>,
  schema: T
): ValidationResult<z.infer<T>> {
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Érvénytelen URL paraméterek',
          errors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: parsed.data };
}

/**
 * Create a validation error response
 *
 * @param message - Error message
 * @param errors - Detailed validation errors
 * @returns NextResponse with error details
 */
export function validationError(
  message: string,
  errors?: Array<{ path: string; message: string }>
): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      message,
      errors,
    },
    { status: 400 }
  );
}

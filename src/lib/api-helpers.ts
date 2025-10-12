// src/lib/api-helpers.ts - Centralized API Response Helpers

import { NextResponse } from 'next/server';
import { ApiResponse, ApiError, PaginatedResponse, ValidationResult } from '@/types/api';

/**
 * Creates a successful API response with consistent format
 */
export function createApiResponse<T>(
  data: T, 
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }, { status });
}

/**
 * Creates an error API response with consistent format
 */
export function createApiError(
  error: string, 
  status: number = 500, 
  details?: any
): NextResponse<ApiError> {
  return NextResponse.json({
    success: false,
    error,
    details,
    timestamp: new Date().toISOString(),
  }, { status });
}

/**
 * Creates a validation error response
 */
export function createValidationError(
  errors: string[]
): NextResponse<ApiError> {
  return createApiError(
    'Validációs hibák találhatók', 
    400, 
    { validationErrors: errors }
  );
}

/**
 * Creates a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse<PaginatedResponse<T>> {
  const pages = Math.ceil(total / limit);
  
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  });
}

/**
 * Validates required fields in request body
 */
export function validateRequiredFields(
  body: any, 
  requiredFields: string[]
): ValidationResult {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      errors.push(`${field} mező kötelező`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Common HTTP status codes with Hungarian messages
 */
export const API_MESSAGES = {
  NOT_FOUND: 'A keresett elem nem található',
  UNAUTHORIZED: 'Nincs jogosultság a művelethez',
  FORBIDDEN: 'Hozzáférés megtagadva',
  VALIDATION_ERROR: 'Érvénytelen adatok',
  SERVER_ERROR: 'Szerver hiba történt',
  CREATED: 'Sikeresen létrehozva',
  UPDATED: 'Sikeresen frissítve',
  DELETED: 'Sikeresen törölve',
} as const;
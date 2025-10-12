// src/lib/error-handler.ts - Centralized Error Handler

import { Prisma } from '@prisma/client';
import { createApiError } from './api-helpers';
import { NextResponse } from 'next/server';
import { ApiError } from '@/types/api';

/**
 * Centralized error handler for API routes
 * Converts various error types to consistent API responses
 */
export function handleApiError(error: unknown, context: string): NextResponse<ApiError> {
  console.error(`[${context}]`, error);

  // Prisma specific errors
  if (error && typeof error === 'object' && 'code' in error && 'meta' in error) {
    const prismaError = error as any;
    switch (prismaError.code) {
      case 'P2002':
        // Unique constraint violation
        const target = prismaError.meta?.target as string[] || [];
        const field = target[0] || 'mező';
        return createApiError(
          `Ez a ${field} már létezik`,
          409,
          { code: 'DUPLICATE_ENTRY', field }
        );
        
      case 'P2025':
        // Record not found
        return createApiError(
          'A keresett elem nem található',
          404,
          { code: 'NOT_FOUND' }
        );
        
      case 'P2003':
        // Foreign key constraint violation
        return createApiError(
          'Kapcsolódó adat nem található',
          400,
          { code: 'FOREIGN_KEY_VIOLATION' }
        );
        
      case 'P2014':
        // Invalid relation
        return createApiError(
          'Érvénytelen kapcsolat az adatok között',
          400,
          { code: 'INVALID_RELATION' }
        );
        
      default:
        return createApiError(
          'Adatbázis hiba történt',
          500,
          { code: 'DATABASE_ERROR', prismaCode: prismaError.code }
        );
    }
  }

  // Business logic errors (our custom errors)
  if (error instanceof BusinessLogicError) {
    return createApiError(error.message, error.statusCode, { code: error.code });
  }

  // Prisma client validation errors
  if (error && error.constructor?.name === 'PrismaClientValidationError') {
    return createApiError(
      'Érvénytelen adatok az adatbázis művelethez',
      400,
      { code: 'VALIDATION_ERROR' }
    );
  }

  // Prisma connection errors
  if (error && error.constructor?.name === 'PrismaClientInitializationError') {
    return createApiError(
      'Adatbázis kapcsolódási hiba',
      503,
      { code: 'DATABASE_CONNECTION_ERROR' }
    );
  }

  // JSON parsing errors
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return createApiError(
      'Érvénytelen JSON formátum',
      400,
      { code: 'INVALID_JSON' }
    );
  }

  // Network/Fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createApiError(
      'Hálózati hiba történt',
      503,
      { code: 'NETWORK_ERROR' }
    );
  }

  // Custom business logic errors
  if (error instanceof Error) {
    // Check for specific business logic error patterns
    if (error.message.includes('UNAUTHORIZED')) {
      return createApiError(
        'Nincs jogosultság a művelethez',
        401,
        { code: 'UNAUTHORIZED' }
      );
    }
    
    if (error.message.includes('FORBIDDEN')) {
      return createApiError(
        'Hozzáférés megtagadva',
        403,
        { code: 'FORBIDDEN' }
      );
    }

    if (error.message.includes('VALIDATION')) {
      return createApiError(
        'Adatvalidációs hiba',
        400,
        { code: 'VALIDATION_ERROR', message: error.message }
      );
    }

    if (error.message.includes('EXPIRED')) {
      return createApiError(
        'A művelet lejárt vagy már nem érvényes',
        410,
        { code: 'EXPIRED' }
      );
    }

    if (error.message.includes('RATE_LIMIT')) {
      return createApiError(
        'Túl sok kérés - próbálkozzon később',
        429,
        { code: 'RATE_LIMITED' }
      );
    }
  }

  // Generic error fallback
  return createApiError(
    'Váratlan szerver hiba történt',
    500,
    { 
      code: 'UNKNOWN_ERROR',
      type: error?.constructor?.name || 'Unknown'
    }
  );
}

/**
 * Specialized error handler for authentication errors
 */
export function handleAuthError(error: unknown, context: string): NextResponse<ApiError> {
  console.error(`[AUTH_${context}]`, error);

  if (error instanceof Error) {
    if (error.message.includes('Invalid credentials')) {
      return createApiError(
        'Érvénytelen bejelentkezési adatok',
        401,
        { code: 'INVALID_CREDENTIALS' }
      );
    }
    
    if (error.message.includes('Session expired')) {
      return createApiError(
        'A munkamenet lejárt',
        401,
        { code: 'SESSION_EXPIRED' }
      );
    }
    
    if (error.message.includes('Token')) {
      return createApiError(
        'Érvénytelen token',
        401,
        { code: 'INVALID_TOKEN' }
      );
    }
  }

  return handleApiError(error, `AUTH_${context}`);
}

/**
 * Business logic validation errors
 */
export class BusinessLogicError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

/**
 * Date validation helpers for events
 */
export function validateEventDates(startDate: string, endDate: string): void {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start.getTime())) {
    throw new BusinessLogicError(
      'Érvénytelen kezdő dátum',
      'INVALID_START_DATE'
    );
  }

  if (isNaN(end.getTime())) {
    throw new BusinessLogicError(
      'Érvénytelen befejező dátum',
      'INVALID_END_DATE'
    );
  }

  if (start >= end) {
    throw new BusinessLogicError(
      'A kezdő dátum nem lehet későbbi a befejező dátumnál',
      'INVALID_DATE_RANGE'
    );
  }

  if (start < now) {
    throw new BusinessLogicError(
      'A kezdő dátum nem lehet múltbeli',
      'PAST_START_DATE'
    );
  }
}

/**
 * Email validation helper
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new BusinessLogicError(
      'Érvénytelen email cím formátum',
      'INVALID_EMAIL'
    );
  }
}
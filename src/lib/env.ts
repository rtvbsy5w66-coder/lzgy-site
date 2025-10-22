/**
 * Environment Variables Validation
 *
 * Runtime validation of environment variables using Zod schema.
 * Ensures all required variables are present and valid before the app starts.
 *
 * @see https://zod.dev
 */

import { z } from 'zod';

/**
 * Environment variable schema definition
 */
const envSchema = z.object({
  // ==================== Node Environment ====================
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ==================== Database ====================
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // ==================== Authentication (NextAuth) ====================
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // ==================== CSRF Protection ====================
  CSRF_SECRET: z
    .string()
    .min(32, 'CSRF_SECRET must be at least 32 characters long'),

  // ==================== Upstash Redis (Production - Optional) ====================
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url('UPSTASH_REDIS_REST_URL must be a valid URL')
    .optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ==================== Email (Resend) ====================
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required').optional(),
  RESEND_FROM_EMAIL: z.string().email('RESEND_FROM_EMAIL must be a valid email').optional(),

  // ==================== Error Tracking (Sentry - Optional) ====================
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // ==================== Analytics (Optional) ====================
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // ==================== Feature Flags ====================
  ENABLE_NEWSLETTER: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  ENABLE_PETITIONS: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true'),
});

/**
 * Refined schema with custom validations
 */
const envSchemaRefined = envSchema.refine(
  (data) => {
    // Production-specific validations
    if (data.NODE_ENV === 'production') {
      // Upstash Redis should be configured in production
      if (!data.UPSTASH_REDIS_REST_URL || !data.UPSTASH_REDIS_REST_TOKEN) {
        console.warn(
          '[ENV] WARNING: UPSTASH_REDIS not configured in production. Using in-memory rate limiter (not recommended for load-balanced environments).'
        );
      }

      // Email should be configured in production
      if (!data.RESEND_API_KEY || !data.RESEND_FROM_EMAIL) {
        console.warn(
          '[ENV] WARNING: RESEND email not configured in production. Email features will be disabled.'
        );
      }
    }

    return true;
  },
  {
    message: 'Production environment requires additional configuration',
  }
);

/**
 * Validate environment variables
 *
 * This function is called at app startup to ensure all required
 * environment variables are present and valid.
 *
 * @throws {ZodError} If validation fails
 */
function validateEnv() {
  try {
    const parsed = envSchemaRefined.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      console.error(JSON.stringify(error.errors, null, 2));

      // Format error message for better readability
      const errorMessages = error.errors.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      });

      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}\n\n` +
        'Please check your .env file and ensure all required variables are set correctly.'
      );
    }
    throw error;
  }
}

/**
 * Validated environment variables
 *
 * Use this instead of process.env for type-safe access to environment variables.
 *
 * @example
 * import { env } from '@/lib/env';
 *
 * const databaseUrl = env.DATABASE_URL; // Type-safe, validated
 */
export const env = validateEnv();

/**
 * Type of validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Check if a feature is enabled
 *
 * @example
 * import { isFeatureEnabled } from '@/lib/env';
 *
 * if (isFeatureEnabled('NEWSLETTER')) {
 *   // Newsletter feature is enabled
 * }
 */
export function isFeatureEnabled(feature: 'NEWSLETTER' | 'PETITIONS'): boolean {
  if (feature === 'NEWSLETTER') {
    return env.ENABLE_NEWSLETTER;
  }
  if (feature === 'PETITIONS') {
    return env.ENABLE_PETITIONS;
  }
  return false;
}

/**
 * Check if production environment
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

/**
 * Check if development environment
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

/**
 * Check if test environment
 */
export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}

/**
 * Check if Upstash Redis is configured
 */
export function hasUpstashRedis(): boolean {
  return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Check if email service is configured
 */
export function hasEmailService(): boolean {
  return !!(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
}

/**
 * Check if Sentry is configured
 */
export function hasSentry(): boolean {
  return !!(env.NEXT_PUBLIC_SENTRY_DSN && env.SENTRY_AUTH_TOKEN);
}

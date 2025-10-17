/**
 * Common Validation Schemas
 *
 * Reusable Zod schemas for common validation patterns
 */

import { z } from 'zod';

/**
 * Hungarian phone number validation
 * Formats: +36301234567, 06301234567, 301234567
 */
export const hungarianPhoneSchema = z
  .string()
  .regex(
    /^(\+36|06)?[0-9]{9}$/,
    'Érvénytelen telefonszám formátum (pl.: +36301234567 vagy 06301234567)'
  )
  .transform((phone) => {
    // Normalize to +36 format
    if (phone.startsWith('06')) {
      return '+36' + phone.slice(2);
    }
    if (!phone.startsWith('+')) {
      return '+36' + phone;
    }
    return phone;
  });

/**
 * Contact form validation
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'A név legalább 2 karakter hosszú kell legyen')
    .max(100, 'A név maximum 100 karakter hosszú lehet')
    .trim(),

  email: z
    .string()
    .email('Érvénytelen email cím formátum')
    .max(255, 'Az email cím túl hosszú')
    .toLowerCase()
    .trim(),

  subject: z
    .string()
    .min(3, 'A tárgy legalább 3 karakter hosszú kell legyen')
    .max(200, 'A tárgy maximum 200 karakter hosszú lehet')
    .trim()
    .optional(),

  message: z
    .string()
    .min(10, 'Az üzenet legalább 10 karakter hosszú kell legyen')
    .max(5000, 'Az üzenet maximum 5000 karakter hosszú lehet')
    .trim(),

  phone: hungarianPhoneSchema.optional(),

  newsletter: z.boolean().default(false).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

/**
 * Email validation (standalone)
 */
export const emailSchema = z
  .string()
  .email('Érvénytelen email cím formátum')
  .max(255, 'Az email cím túl hosszú')
  .toLowerCase()
  .trim();

/**
 * CUID validation (for database IDs)
 */
export const cuidSchema = z
  .string()
  .cuid('Érvénytelen azonosító formátum');

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z
    .number()
    .int()
    .min(1, 'Az oldalszám legalább 1 kell legyen')
    .default(1)
    .optional(),

  limit: z
    .number()
    .int()
    .min(1, 'A limit legalább 1 kell legyen')
    .max(100, 'A limit maximum 100 lehet')
    .default(10)
    .optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Search query validation
 */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'A keresési kifejezés nem lehet üres')
    .max(200, 'A keresési kifejezés túl hosszú')
    .trim(),

  ...paginationSchema.shape,
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * Date range validation
 */
export const dateRangeSchema = z
  .object({
    from: z.string().datetime().or(z.date()),
    to: z.string().datetime().or(z.date()),
  })
  .refine(
    (data) => {
      const from = new Date(data.from);
      const to = new Date(data.to);
      return from <= to;
    },
    {
      message: 'A kezdő dátum nem lehet később, mint a befejező dátum',
    }
  );

export type DateRange = z.infer<typeof dateRangeSchema>;

/**
 * File upload validation
 */
export const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'A fájlnév nem lehet üres')
    .max(255, 'A fájlnév túl hosszú')
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'A fájlnév csak betűket, számokat, pontot, kötőjelet és aláhúzást tartalmazhat'
    ),

  size: z
    .number()
    .int()
    .min(1, 'A fájl nem lehet üres')
    .max(10 * 1024 * 1024, 'A fájl maximum 10 MB lehet'), // 10 MB

  mimetype: z
    .string()
    .regex(
      /^(image\/(jpeg|png|gif|webp)|application\/pdf)$/,
      'Csak JPEG, PNG, GIF, WebP és PDF fájlok engedélyezettek'
    ),
});

export type FileUpload = z.infer<typeof fileUploadSchema>;

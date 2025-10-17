/**
 * Newsletter API Validation Schemas
 *
 * Centralized Zod schemas for newsletter-related endpoints
 */

import { z } from 'zod';
import { NewsletterCategory } from '@/types/newsletter';

/**
 * Newsletter subscription validation
 */
export const newsletterSubscribeSchema = z.object({
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

  categories: z
    .array(z.nativeEnum(NewsletterCategory))
    .min(1, 'Legalább egy kategóriát ki kell választani')
    .max(4, 'Maximum 4 kategóriát lehet kiválasztani'),

  source: z
    .enum(['CONTACT_FORM', 'POPUP', 'FOOTER', 'OTHER'])
    .default('CONTACT_FORM')
    .optional(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

/**
 * Newsletter unsubscribe validation
 */
export const newsletterUnsubscribeSchema = z.object({
  email: z
    .string()
    .email('Érvénytelen email cím formátum')
    .max(255)
    .toLowerCase()
    .trim()
    .optional(),

  token: z
    .string()
    .length(64, 'Érvénytelen leiratkozási token')
    .optional(),
}).refine(
  (data) => data.email || data.token,
  {
    message: 'Email cím vagy token megadása kötelező',
  }
);

export type NewsletterUnsubscribeInput = z.infer<typeof newsletterUnsubscribeSchema>;

/**
 * Newsletter campaign send validation (Admin)
 */
export const newsletterCampaignSendSchema = z.object({
  subject: z
    .string()
    .min(5, 'A tárgy legalább 5 karakter hosszú kell legyen')
    .max(200, 'A tárgy maximum 200 karakter hosszú lehet')
    .trim(),

  content: z
    .string()
    .min(10, 'A tartalom legalább 10 karakter hosszú kell legyen')
    .max(50000, 'A tartalom túl hosszú (max 50,000 karakter)'),

  recipients: z.enum(['all', 'category', 'selected', 'test']),

  selectedCategory: z
    .nativeEnum(NewsletterCategory)
    .optional(),

  selectedIds: z
    .array(z.string().cuid())
    .optional(),

  testEmail: z
    .string()
    .email()
    .optional(),
}).refine(
  (data) => {
    // If recipients is 'category', selectedCategory is required
    if (data.recipients === 'category' && !data.selectedCategory) {
      return false;
    }
    // If recipients is 'selected', selectedIds is required
    if (data.recipients === 'selected' && (!data.selectedIds || data.selectedIds.length === 0)) {
      return false;
    }
    // If recipients is 'test', testEmail is required
    if (data.recipients === 'test' && !data.testEmail) {
      return false;
    }
    return true;
  },
  {
    message: 'A kiválasztott címzett típushoz hiányzó adatok',
  }
);

export type NewsletterCampaignSendInput = z.infer<typeof newsletterCampaignSendSchema>;

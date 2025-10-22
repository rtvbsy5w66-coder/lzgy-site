/**
 * FUNCTIONAL Test: Zod Validation - ACTUAL CODE EXECUTION
 *
 * These tests ACTUALLY EXECUTE the Zod validation code.
 * They parse real data and verify transformations.
 */

import {
  newsletterSubscribeSchema,
  newsletterCampaignSendSchema,
} from '@/lib/validations/newsletter';
import {
  contactFormSchema,
  hungarianPhoneSchema,
  paginationSchema,
} from '@/lib/validations/common';
import { NewsletterCategory } from '@/types/newsletter';

describe('FUNCTIONAL: Zod Validation - Real Code Execution', () => {
  describe('EXECUTES: newsletterSubscribeSchema', () => {
    it('EXECUTES: Valid data parsing and transformation', () => {
      const input = {
        name: '  John Doe  ', // With whitespace
        email: 'JOHN@EXAMPLE.COM', // Uppercase (email validation doesn't allow leading/trailing spaces)
        categories: [NewsletterCategory.SZAKPOLITIKA],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Verify ACTUAL transformations happened
        expect(result.data.name).toBe('John Doe'); // Trimmed
        expect(result.data.email).toBe('john@example.com'); // Lowercased
        expect(result.data.categories).toEqual([NewsletterCategory.SZAKPOLITIKA]);
      }
    });

    it('EXECUTES: Rejection of too-short name', () => {
      const input = {
        name: 'J', // Only 1 character
        email: 'valid@example.com',
        categories: [NewsletterCategory.SZAKPOLITIKA],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors) {
        const nameError = result.error.errors.find(e => e.path && e.path.includes('name'));
        expect(nameError).toBeDefined();
      }
    });

    it('EXECUTES: Rejection of invalid email', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com', // Space in email
      ];

      invalidEmails.forEach(email => {
        const result = newsletterSubscribeSchema.safeParse({
          name: 'John Doe',
          email,
          categories: [NewsletterCategory.EU],
        });

        expect(result.success).toBe(false);
      });
    });

    it('EXECUTES: Category validation with multiple values', () => {
      const input = {
        name: 'Multi User',
        email: 'multi@example.com',
        categories: [NewsletterCategory.SZAKPOLITIKA, NewsletterCategory.V_KERULET, NewsletterCategory.EU],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categories).toHaveLength(3);
      }
    });

    it('EXECUTES: Rejection of empty categories', () => {
      const input = {
        name: 'No Categories',
        email: 'test@example.com',
        categories: [],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Default source value', () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        categories: [NewsletterCategory.SZAKPOLITIKA],
        // source not provided
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBe('CONTACT_FORM'); // Default value applied
      }
    });
  });

  describe('EXECUTES: contactFormSchema', () => {
    it('EXECUTES: Valid contact form data', () => {
      const input = {
        name: 'Contact User',
        email: 'CONTACT@EXAMPLE.COM',
        message: 'This is a test message that is long enough to pass validation',
        subject: 'Test Subject',
        newsletter: true,
      };

      const result = contactFormSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('contact@example.com'); // Lowercased
        expect(result.data.newsletter).toBe(true);
      }
    });

    it('EXECUTES: Message length validation', () => {
      const tooShort = {
        name: 'Test',
        email: 'test@example.com',
        message: 'Short', // Less than 10 characters
      };

      const result = contactFormSchema.safeParse(tooShort);
      expect(result.success).toBe(false);
    });

    it('EXECUTES: Optional fields handling', () => {
      const minimal = {
        name: 'Minimal User',
        email: 'minimal@example.com',
        message: 'This message is long enough for validation to pass successfully',
      };

      const result = contactFormSchema.safeParse(minimal);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.subject).toBeUndefined();
        expect(result.data.phone).toBeUndefined();
      }
    });
  });

  describe('EXECUTES: hungarianPhoneSchema', () => {
    it('EXECUTES: Phone number normalization - +36 format', () => {
      const inputs = [
        { input: '+36201234567', expected: '+36201234567' },
        { input: '06201234567', expected: '+36201234567' },
        { input: '201234567', expected: '+36201234567' },
      ];

      inputs.forEach(({ input, expected }) => {
        const result = hungarianPhoneSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(expected);
        }
      });
    });

    it('EXECUTES: Invalid phone number rejection', () => {
      const invalids = ['123', '06123', 'not-a-number', '+36 20 123 4567'];

      invalids.forEach(phone => {
        const result = hungarianPhoneSchema.safeParse(phone);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('EXECUTES: paginationSchema', () => {
    it('EXECUTES: Default values application', () => {
      const result = paginationSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('EXECUTES: Custom pagination values', () => {
      const result = paginationSchema.safeParse({ page: 5, limit: 50 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.limit).toBe(50);
      }
    });

    it('EXECUTES: Limit boundary validation', () => {
      const tooHigh = paginationSchema.safeParse({ page: 1, limit: 101 });
      expect(tooHigh.success).toBe(false);

      const tooLow = paginationSchema.safeParse({ page: 0, limit: 10 });
      expect(tooLow.success).toBe(false);
    });
  });

  describe('EXECUTES: newsletterCampaignSendSchema', () => {
    it('EXECUTES: Test campaign validation', () => {
      const input = {
        subject: 'Test Campaign Subject',
        content: 'This is test campaign content that is long enough',
        recipients: 'test',
        testEmail: 'test@example.com',
      };

      const result = newsletterCampaignSendSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.recipients).toBe('test');
        expect(result.data.testEmail).toBe('test@example.com');
      }
    });

    it('EXECUTES: Category campaign requires selectedCategory', () => {
      const withoutCategory = {
        subject: 'Category Campaign',
        content: 'Campaign content here',
        recipients: 'category',
        // selectedCategory missing
      };

      const result = newsletterCampaignSendSchema.safeParse(withoutCategory);
      expect(result.success).toBe(false);
    });

    it('EXECUTES: Category campaign with valid category', () => {
      const withCategory = {
        subject: 'Category Campaign',
        content: 'Campaign content here',
        recipients: 'category',
        selectedCategory: 'SZAKPOLITIKA',
      };

      const result = newsletterCampaignSendSchema.safeParse(withCategory);
      expect(result.success).toBe(true);
    });
  });

  describe('EXECUTES: XSS Prevention Scenarios', () => {
    it('EXECUTES: HTML tags in name field', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        categories: [NewsletterCategory.SZAKPOLITIKA],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      // Zod validates structure, sanitization happens at application level
      expect(result.success).toBe(true);
      if (result.success) {
        // Verify the data is captured for sanitization
        expect(result.data.name).toContain('<script>');
      }
    });

    it('EXECUTES: SQL injection patterns rejected by email validation', () => {
      const injections = [
        "'; DROP TABLE users; --",
        "admin'--",
        "1' OR '1'='1",
      ];

      injections.forEach(injection => {
        const result = newsletterSubscribeSchema.safeParse({
          name: 'Attacker',
          email: injection,
          categories: [NewsletterCategory.EU],
        });

        expect(result.success).toBe(false); // Invalid email format
      });
    });
  });

  describe('EXECUTES: Complex Validation Scenarios', () => {
    it('EXECUTES: Maximum valid newsletter subscription', () => {
      const maxValid = {
        name: 'A'.repeat(100), // Max length (100)
        email: 'a@' + 'b'.repeat(248) + '.com', // Max length (255 chars total)
        categories: [
          NewsletterCategory.SZAKPOLITIKA,
          NewsletterCategory.V_KERULET,
          NewsletterCategory.EU,
          NewsletterCategory.POLITIKAI_EDUGAMIFIKACIO
        ], // All 4 categories
        source: 'POPUP' as const,
      };

      const result = newsletterSubscribeSchema.safeParse(maxValid);
      expect(result.success).toBe(true);
    });

    it('EXECUTES: All possible source values', () => {
      const sources = ['CONTACT_FORM', 'POPUP', 'FOOTER', 'OTHER'] as const;

      sources.forEach(source => {
        const result = newsletterSubscribeSchema.safeParse({
          name: 'Test',
          email: 'test@example.com',
          categories: [NewsletterCategory.EU],
          source,
        });

        expect(result.success).toBe(true);
      });
    });
  });
});

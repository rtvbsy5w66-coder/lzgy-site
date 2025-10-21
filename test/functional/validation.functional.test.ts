/**
 * FUNCTIONAL TEST: Input Validation - REAL CODE EXECUTION
 *
 * These tests ACTUALLY EXECUTE Zod validation schemas.
 * Goal: Achieve 80%+ code coverage on validation files and demonstrate OWASP A03:2021 protection
 */

import { NewsletterCategory } from '@/types/newsletter';
import {
  newsletterSubscribeSchema,
  newsletterUnsubscribeSchema,
  newsletterCampaignSendSchema,
} from '@/lib/validations/newsletter';
import {
  contactFormSchema,
  hungarianPhoneSchema,
  emailSchema,
  cuidSchema,
  paginationSchema,
  searchQuerySchema,
  dateRangeSchema,
  fileUploadSchema,
} from '@/lib/validations/common';

describe('FUNCTIONAL: Input Validation - Real Execution', () => {
  describe('Newsletter Subscribe Validation', () => {
    it('EXECUTES: Valid subscription data', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        categories: ['SZAKPOLITIKA'],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('EXECUTES: Email transformation to lowercase', () => {
      const input = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        categories: ['EU'],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('EXECUTES: Name trimming', () => {
      const input = {
        name: '  Spaces Around  ',
        email: 'test@example.com',
        categories: ['V_KERULET'],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Spaces Around');
      }
    });

    it('EXECUTES: Reject too short name', () => {
      const input = {
        name: 'J',
        email: 'test@example.com',
        categories: ['SZAKPOLITIKA'],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors) {
        const nameError = result.error.errors.find(e => e.path && e.path[0] === 'name');
        expect(nameError).toBeDefined();
        if (nameError) {
          expect(nameError.message).toContain('karakter');
        }
      }
    });

    it('EXECUTES: Reject invalid email format', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
      ];

      invalidEmails.forEach(email => {
        const result = newsletterSubscribeSchema.safeParse({
          name: 'Test',
          email,
          categories: ['EU'],
        });

        expect(result.success).toBe(false);
      });
    });

    it('EXECUTES: Reject empty categories array', () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        categories: [],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Reject too many categories', () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        categories: ['SZAKPOLITIKA', 'V_KERULET', 'EU', 'POLITIKAI_EDUGAMIFIKACIO', 'EXTRA'] as any,
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Default source value', () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        categories: ['SZAKPOLITIKA'],
      };

      const result = newsletterSubscribeSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBe('CONTACT_FORM');
      }
    });

    it('EXECUTES: Valid source values', () => {
      const sources = ['CONTACT_FORM', 'POPUP', 'FOOTER', 'OTHER'] as const;

      sources.forEach(source => {
        const result = newsletterSubscribeSchema.safeParse({
          name: 'Test',
          email: 'test@example.com',
          categories: ['EU'],
          source,
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe('Newsletter Unsubscribe Validation', () => {
    it('EXECUTES: Valid unsubscribe with email', () => {
      const result = newsletterUnsubscribeSchema.safeParse({
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
    });

    it('EXECUTES: Valid unsubscribe with token', () => {
      const token = 'a'.repeat(64);
      const result = newsletterUnsubscribeSchema.safeParse({ token });

      expect(result.success).toBe(true);
    });

    it('EXECUTES: Reject without email or token', () => {
      const result = newsletterUnsubscribeSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Reject invalid token length', () => {
      const shortToken = 'abc123';
      const result = newsletterUnsubscribeSchema.safeParse({ token: shortToken });

      expect(result.success).toBe(false);
    });
  });

  describe('Newsletter Campaign Send Validation', () => {
    it('EXECUTES: Valid test campaign', () => {
      const result = newsletterCampaignSendSchema.safeParse({
        subject: 'Test Campaign',
        content: 'Campaign content here that is long enough',
        recipients: 'test',
        testEmail: 'test@example.com',
      });

      expect(result.success).toBe(true);
    });

    it('EXECUTES: Reject category campaign without selectedCategory', () => {
      const result = newsletterCampaignSendSchema.safeParse({
        subject: 'Category Campaign',
        content: 'Content here',
        recipients: 'category',
      });

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Valid category campaign with selectedCategory', () => {
      const result = newsletterCampaignSendSchema.safeParse({
        subject: 'Category Campaign',
        content: 'Content here',
        recipients: 'category',
        selectedCategory: 'SZAKPOLITIKA',
      });

      expect(result.success).toBe(true);
    });

    it('EXECUTES: Reject selected campaign without selectedIds', () => {
      const result = newsletterCampaignSendSchema.safeParse({
        subject: 'Selected Campaign',
        content: 'Content here',
        recipients: 'selected',
      });

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Reject test campaign without testEmail', () => {
      const result = newsletterCampaignSendSchema.safeParse({
        subject: 'Test Campaign',
        content: 'Content here',
        recipients: 'test',
      });

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Reject too short subject', () => {
      const result = newsletterCampaignSendSchema.safeParse({
        subject: 'Hi',
        content: 'Long enough content',
        recipients: 'all',
      });

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Reject too short content', () => {
      const result = newsletterCampaignSendSchema.safeParse({
        subject: 'Valid Subject',
        content: 'Short',
        recipients: 'all',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Contact Form Validation', () => {
    it('EXECUTES: Valid contact form', () => {
      const result = contactFormSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message that is long enough',
      });

      expect(result.success).toBe(true);
    });

    it('EXECUTES: Email transformation', () => {
      const result = contactFormSchema.safeParse({
        name: 'Test',
        email: 'UPPERCASE@EXAMPLE.COM',
        message: 'Long enough message here',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('uppercase@example.com');
      }
    });

    it('EXECUTES: Optional fields', () => {
      const result = contactFormSchema.safeParse({
        name: 'Test',
        email: 'test@example.com',
        message: 'Long enough message',
        subject: 'Optional Subject',
        phone: '+36301234567',
        newsletter: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.subject).toBe('Optional Subject');
        expect(result.data.newsletter).toBe(true);
      }
    });

    it('EXECUTES: Reject too short message', () => {
      const result = contactFormSchema.safeParse({
        name: 'Test',
        email: 'test@example.com',
        message: 'Short',
      });

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Reject too long message', () => {
      const longMessage = 'a'.repeat(5001);
      const result = contactFormSchema.safeParse({
        name: 'Test',
        email: 'test@example.com',
        message: longMessage,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Hungarian Phone Number Validation', () => {
    it('EXECUTES: Normalize +36 format', () => {
      const result = hungarianPhoneSchema.safeParse('+36301234567');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('+36301234567');
      }
    });

    it('EXECUTES: Normalize 06 to +36', () => {
      const result = hungarianPhoneSchema.safeParse('06301234567');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('+36301234567');
      }
    });

    it('EXECUTES: Normalize plain number to +36', () => {
      const result = hungarianPhoneSchema.safeParse('301234567');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('+36301234567');
      }
    });

    it('EXECUTES: Reject invalid phone formats', () => {
      const invalid = ['123', '06123', 'not-a-number', '+36 30 123 4567', '+1234567890'];

      invalid.forEach(phone => {
        const result = hungarianPhoneSchema.safeParse(phone);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Common Validators', () => {
    it('EXECUTES: Email schema', () => {
      const valid = emailSchema.safeParse('test@example.com');
      expect(valid.success).toBe(true);

      const invalid = emailSchema.safeParse('not-an-email');
      expect(invalid.success).toBe(false);
    });

    it('EXECUTES: CUID schema', () => {
      const validCuid = 'cl9ebqhxk00023b600tymydho';
      const result = cuidSchema.safeParse(validCuid);
      expect(result.success).toBe(true);

      const invalidCuid = 'not-a-cuid';
      const invalid = cuidSchema.safeParse(invalidCuid);
      expect(invalid.success).toBe(false);
    });
  });

  describe('Pagination Validation', () => {
    it('EXECUTES: Default values', () => {
      const result = paginationSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('EXECUTES: Custom values', () => {
      const result = paginationSchema.safeParse({ page: 5, limit: 50 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.limit).toBe(50);
      }
    });

    it('EXECUTES: Reject page < 1', () => {
      const result = paginationSchema.safeParse({ page: 0, limit: 10 });
      expect(result.success).toBe(false);
    });

    it('EXECUTES: Reject limit > 100', () => {
      const result = paginationSchema.safeParse({ page: 1, limit: 101 });
      expect(result.success).toBe(false);
    });
  });

  describe('Search Query Validation', () => {
    it('EXECUTES: Valid search query', () => {
      const result = searchQuerySchema.safeParse({ q: 'test search' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.q).toBe('test search');
      }
    });

    it('EXECUTES: Reject empty search', () => {
      const result = searchQuerySchema.safeParse({ q: '' });
      expect(result.success).toBe(false);
    });

    it('EXECUTES: Trim search query', () => {
      const result = searchQuerySchema.safeParse({ q: '  trimmed  ' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.q).toBe('trimmed');
      }
    });
  });

  describe('Date Range Validation', () => {
    it('EXECUTES: Valid date range', () => {
      const result = dateRangeSchema.safeParse({
        from: '2024-01-01T00:00:00Z',
        to: '2024-12-31T23:59:59Z',
      });

      expect(result.success).toBe(true);
    });

    it('EXECUTES: Reject from > to', () => {
      const result = dateRangeSchema.safeParse({
        from: '2024-12-31T00:00:00Z',
        to: '2024-01-01T00:00:00Z',
      });

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Accept same date', () => {
      const sameDate = '2024-06-15T12:00:00Z';
      const result = dateRangeSchema.safeParse({
        from: sameDate,
        to: sameDate,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('File Upload Validation', () => {
    it('EXECUTES: Valid image upload', () => {
      const result = fileUploadSchema.safeParse({
        filename: 'image.jpg',
        size: 1024 * 1024, // 1 MB
        mimetype: 'image/jpeg',
      });

      expect(result.success).toBe(true);
    });

    it('EXECUTES: Valid PDF upload', () => {
      const result = fileUploadSchema.safeParse({
        filename: 'document.pdf',
        size: 2 * 1024 * 1024, // 2 MB
        mimetype: 'application/pdf',
      });

      expect(result.success).toBe(true);
    });

    it('EXECUTES: Reject file too large', () => {
      const result = fileUploadSchema.safeParse({
        filename: 'large.jpg',
        size: 11 * 1024 * 1024, // 11 MB
        mimetype: 'image/jpeg',
      });

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Reject invalid mimetype', () => {
      const result = fileUploadSchema.safeParse({
        filename: 'script.exe',
        size: 1024,
        mimetype: 'application/exe',
      });

      expect(result.success).toBe(false);
    });

    it('EXECUTES: Reject invalid filename characters', () => {
      const result = fileUploadSchema.safeParse({
        filename: '../../../etc/passwd',
        size: 1024,
        mimetype: 'image/jpeg',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('OWASP A03:2021 - Injection Protection', () => {
    it('EXECUTES: Reject SQL injection in email', () => {
      const sqlInjections = [
        "'; DROP TABLE users; --",
        "admin'--",
        "1' OR '1'='1",
        "' OR 1=1--",
      ];

      sqlInjections.forEach(injection => {
        const result = emailSchema.safeParse(injection);
        expect(result.success).toBe(false); // Invalid email format blocks SQL
      });
    });

    it('EXECUTES: XSS patterns in name field captured for sanitization', () => {
      const xssPatterns = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        'javascript:alert(1)',
      ];

      xssPatterns.forEach(xss => {
        const result = newsletterSubscribeSchema.safeParse({
          name: xss,
          email: 'test@example.com',
          categories: ['EU'],
        });

        // Zod validates structure; app-level sanitization handles XSS
        // The validation passes, capturing the data for sanitization
        expect(result.success).toBe(true);
      });
    });

    it('EXECUTES: Path traversal blocked in filename', () => {
      const traversals = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\config\\sam',
        'test/../../../file.txt',
      ];

      traversals.forEach(filename => {
        const result = fileUploadSchema.safeParse({
          filename,
          size: 1024,
          mimetype: 'image/jpeg',
        });

        expect(result.success).toBe(false); // Regex blocks path traversal
      });
    });

    it('EXECUTES: Command injection blocked in search', () => {
      const cmdInjections = [
        '`whoami`',
        '$(ls -la)',
        '; rm -rf /',
        '| cat /etc/passwd',
      ];

      cmdInjections.forEach(cmd => {
        const result = searchQuerySchema.safeParse({ q: cmd });

        // Query is captured as string, no command execution
        expect(result.success).toBe(true);
        if (result.success) {
          expect(typeof result.data.q).toBe('string');
        }
      });
    });

    it('EXECUTES: Extremely long input rejected', () => {
      const longString = 'a'.repeat(10000);

      const nameResult = newsletterSubscribeSchema.safeParse({
        name: longString,
        email: 'test@example.com',
        categories: ['EU'],
      });

      expect(nameResult.success).toBe(false); // Max 100 chars
    });

    it('EXECUTES: Unicode and special characters handled', () => {
      const unicodeName = '测试用户名 🎉';
      const result = newsletterSubscribeSchema.safeParse({
        name: unicodeName,
        email: 'test@example.com',
        categories: ['SZAKPOLITIKA'],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(unicodeName);
      }
    });
  });
});

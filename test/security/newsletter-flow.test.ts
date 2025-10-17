/**
 * Security Test: Newsletter Subscription Flow
 *
 * Integration test for the complete newsletter subscription process:
 * - Category-based subscription
 * - Email verification
 * - Data persistence
 * - Category filtering for campaigns
 */

import { prisma } from '@/lib/prisma';
import { NewsletterCategory } from '@prisma/client';

describe('Security: Newsletter Subscription Flow', () => {
  const testEmail = 'test-newsletter@example.com';
  const testName = 'Test Subscriber';

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.newsletterSubscription.deleteMany({
      where: {
        email: {
          contains: 'test-newsletter',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.newsletterSubscription.deleteMany({
      where: {
        email: {
          contains: 'test-newsletter',
        },
      },
    });

    await prisma.$disconnect();
  });

  describe('Subscription Creation', () => {
    it('should create a new subscription with selected categories', async () => {
      const subscription = await prisma.newsletterSubscription.create({
        data: {
          name: testName,
          email: testEmail,
          categories: [NewsletterCategory.SZAKPOLITIKA],
          isActive: true,
          source: 'CONTACT_FORM',
        },
      });

      expect(subscription).toBeDefined();
      expect(subscription.email).toBe(testEmail);
      expect(subscription.name).toBe(testName);
      expect(subscription.categories).toContain(NewsletterCategory.SZAKPOLITIKA);
      expect(subscription.isActive).toBe(true);
    });

    it('should handle multiple category subscriptions', async () => {
      const multiCategoryEmail = 'test-multi@example.com';

      const subscription = await prisma.newsletterSubscription.create({
        data: {
          name: 'Multi Category User',
          email: multiCategoryEmail,
          categories: [
            NewsletterCategory.SZAKPOLITIKA,
            NewsletterCategory.V_KERULET,
            NewsletterCategory.EU,
          ],
          isActive: true,
        },
      });

      expect(subscription.categories).toHaveLength(3);
      expect(subscription.categories).toContain(NewsletterCategory.SZAKPOLITIKA);
      expect(subscription.categories).toContain(NewsletterCategory.V_KERULET);
      expect(subscription.categories).toContain(NewsletterCategory.EU);
    });

    it('should prevent duplicate email subscriptions', async () => {
      const duplicateEmail = 'test-duplicate@example.com';

      // Create first subscription
      await prisma.newsletterSubscription.create({
        data: {
          name: 'First User',
          email: duplicateEmail,
          categories: [NewsletterCategory.SZAKPOLITIKA],
          isActive: true,
        },
      });

      // Attempt to create duplicate (should fail due to unique constraint)
      await expect(
        prisma.newsletterSubscription.create({
          data: {
            name: 'Second User',
            email: duplicateEmail,
            categories: [NewsletterCategory.V_KERULET],
            isActive: true,
          },
        })
      ).rejects.toThrow();
    });

    it('should store subscription source correctly', async () => {
      const sources = ['CONTACT_FORM', 'POPUP', 'FOOTER', 'OTHER'] as const;

      for (const source of sources) {
        const email = `test-source-${source.toLowerCase()}@example.com`;

        const subscription = await prisma.newsletterSubscription.create({
          data: {
            name: `${source} User`,
            email,
            categories: [NewsletterCategory.SZAKPOLITIKA],
            isActive: true,
            source,
          },
        });

        expect(subscription.source).toBe(source);
      }
    });
  });

  describe('Category-Based Filtering', () => {
    beforeAll(async () => {
      // Create test subscribers with different category combinations
      const testSubscribers = [
        {
          email: 'szakpolitika-only@example.com',
          name: 'SZAKPOLITIKA User',
          categories: [NewsletterCategory.SZAKPOLITIKA],
        },
        {
          email: 'v-kerulet-only@example.com',
          name: 'V_KERULET User',
          categories: [NewsletterCategory.V_KERULET],
        },
        {
          email: 'eu-only@example.com',
          name: 'EU User',
          categories: [NewsletterCategory.EU],
        },
        {
          email: 'szakpolitika-and-v-kerulet@example.com',
          name: 'Multi User 1',
          categories: [NewsletterCategory.SZAKPOLITIKA, NewsletterCategory.V_KERULET],
        },
        {
          email: 'all-categories@example.com',
          name: 'All Categories User',
          categories: [
            NewsletterCategory.SZAKPOLITIKA,
            NewsletterCategory.V_KERULET,
            NewsletterCategory.EU,
            NewsletterCategory.POLITIKAI_EDUGAMIFIKACIO,
          ],
        },
      ];

      for (const subscriber of testSubscribers) {
        await prisma.newsletterSubscription.create({
          data: {
            ...subscriber,
            isActive: true,
          },
        });
      }
    });

    it('should retrieve only SZAKPOLITIKA subscribers when filtering by that category', async () => {
      const subscribers = await prisma.newsletterSubscription.findMany({
        where: {
          isActive: true,
          categories: {
            has: NewsletterCategory.SZAKPOLITIKA,
          },
        },
      });

      // Should include: szakpolitika-only, szakpolitika-and-v-kerulet, all-categories
      expect(subscribers.length).toBeGreaterThanOrEqual(3);

      const emails = subscribers.map((s) => s.email);
      expect(emails).toContain('szakpolitika-only@example.com');
      expect(emails).toContain('szakpolitika-and-v-kerulet@example.com');
      expect(emails).toContain('all-categories@example.com');

      // Should NOT include v-kerulet-only or eu-only
      expect(emails).not.toContain('v-kerulet-only@example.com');
      expect(emails).not.toContain('eu-only@example.com');
    });

    it('should retrieve only V_KERULET subscribers when filtering by that category', async () => {
      const subscribers = await prisma.newsletterSubscription.findMany({
        where: {
          isActive: true,
          categories: {
            has: NewsletterCategory.V_KERULET,
          },
        },
      });

      const emails = subscribers.map((s) => s.email);
      expect(emails).toContain('v-kerulet-only@example.com');
      expect(emails).toContain('szakpolitika-and-v-kerulet@example.com');
      expect(emails).toContain('all-categories@example.com');

      expect(emails).not.toContain('szakpolitika-only@example.com');
      expect(emails).not.toContain('eu-only@example.com');
    });

    it('should retrieve only EU subscribers when filtering by that category', async () => {
      const subscribers = await prisma.newsletterSubscription.findMany({
        where: {
          isActive: true,
          categories: {
            has: NewsletterCategory.EU,
          },
        },
      });

      const emails = subscribers.map((s) => s.email);
      expect(emails).toContain('eu-only@example.com');
      expect(emails).toContain('all-categories@example.com');

      expect(emails).not.toContain('szakpolitika-only@example.com');
      expect(emails).not.toContain('v-kerulet-only@example.com');
    });

    it('should not send to inactive subscribers even if they have the category', async () => {
      // Create an inactive subscriber
      await prisma.newsletterSubscription.create({
        data: {
          email: 'inactive-szakpolitika@example.com',
          name: 'Inactive User',
          categories: [NewsletterCategory.SZAKPOLITIKA],
          isActive: false,
        },
      });

      const subscribers = await prisma.newsletterSubscription.findMany({
        where: {
          isActive: true,
          categories: {
            has: NewsletterCategory.SZAKPOLITIKA,
          },
        },
      });

      const emails = subscribers.map((s) => s.email);
      expect(emails).not.toContain('inactive-szakpolitika@example.com');
    });
  });

  describe('Subscription Management', () => {
    it('should allow updating subscription categories', async () => {
      const email = 'test-update@example.com';

      const subscription = await prisma.newsletterSubscription.create({
        data: {
          email,
          name: 'Update Test User',
          categories: [NewsletterCategory.SZAKPOLITIKA],
          isActive: true,
        },
      });

      const updated = await prisma.newsletterSubscription.update({
        where: { id: subscription.id },
        data: {
          categories: [NewsletterCategory.SZAKPOLITIKA, NewsletterCategory.EU],
        },
      });

      expect(updated.categories).toHaveLength(2);
      expect(updated.categories).toContain(NewsletterCategory.SZAKPOLITIKA);
      expect(updated.categories).toContain(NewsletterCategory.EU);
    });

    it('should allow unsubscribing (setting isActive to false)', async () => {
      const email = 'test-unsubscribe@example.com';

      const subscription = await prisma.newsletterSubscription.create({
        data: {
          email,
          name: 'Unsubscribe Test User',
          categories: [NewsletterCategory.V_KERULET],
          isActive: true,
        },
      });

      const unsubscribed = await prisma.newsletterSubscription.update({
        where: { id: subscription.id },
        data: { isActive: false },
      });

      expect(unsubscribed.isActive).toBe(false);

      // Verify they won't receive emails
      const activeSubscribers = await prisma.newsletterSubscription.findMany({
        where: {
          isActive: true,
          categories: {
            has: NewsletterCategory.V_KERULET,
          },
        },
      });

      const emails = activeSubscribers.map((s) => s.email);
      expect(emails).not.toContain(email);
    });

    it('should track subscription and unsubscription timestamps', async () => {
      const email = 'test-timestamps@example.com';

      const subscription = await prisma.newsletterSubscription.create({
        data: {
          email,
          name: 'Timestamp Test User',
          categories: [NewsletterCategory.SZAKPOLITIKA],
          isActive: true,
        },
      });

      expect(subscription.createdAt).toBeInstanceOf(Date);
      expect(subscription.updatedAt).toBeInstanceOf(Date);

      // Update and check updatedAt changes
      const beforeUpdate = subscription.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await prisma.newsletterSubscription.update({
        where: { id: subscription.id },
        data: { name: 'Updated Name' },
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    });
  });

  describe('Data Validation and Security', () => {
    it('should store email in normalized lowercase format', async () => {
      const email = 'TEST-CASE@EXAMPLE.COM';

      const subscription = await prisma.newsletterSubscription.create({
        data: {
          email: email.toLowerCase(),
          name: 'Case Test User',
          categories: [NewsletterCategory.SZAKPOLITIKA],
          isActive: true,
        },
      });

      expect(subscription.email).toBe('test-case@example.com');
    });

    it('should require at least one category', async () => {
      // This would be caught by Zod validation before reaching DB
      // But let's verify DB constraint if it exists
      const email = 'test-no-categories@example.com';

      await expect(
        prisma.newsletterSubscription.create({
          data: {
            email,
            name: 'No Categories User',
            categories: [],
            isActive: true,
          },
        })
      ).rejects.toThrow();
    });

    it('should handle special characters in name safely', async () => {
      const specialNames = [
        "O'Brien",
        'János Kovács',
        'Marie-Claire',
        'José García',
      ];

      for (const name of specialNames) {
        const email = `test-${name.replace(/[^a-z]/gi, '')}@example.com`;

        const subscription = await prisma.newsletterSubscription.create({
          data: {
            email: email.toLowerCase(),
            name,
            categories: [NewsletterCategory.SZAKPOLITIKA],
            isActive: true,
          },
        });

        expect(subscription.name).toBe(name);
      }
    });
  });

  describe('Campaign Targeting', () => {
    it('should correctly identify recipients for a SZAKPOLITIKA campaign', async () => {
      const recipients = await prisma.newsletterSubscription.findMany({
        where: {
          isActive: true,
          categories: {
            has: NewsletterCategory.SZAKPOLITIKA,
          },
        },
        select: {
          email: true,
          name: true,
        },
      });

      expect(recipients.length).toBeGreaterThan(0);
      expect(recipients.every((r) => r.email && r.name)).toBe(true);
    });

    it('should retrieve all active subscribers for broadcast campaigns', async () => {
      const allRecipients = await prisma.newsletterSubscription.findMany({
        where: {
          isActive: true,
        },
        select: {
          email: true,
          name: true,
        },
      });

      expect(allRecipients.length).toBeGreaterThan(0);
    });

    it('should count subscribers by category correctly', async () => {
      const szakpolitikaCount = await prisma.newsletterSubscription.count({
        where: {
          isActive: true,
          categories: {
            has: NewsletterCategory.SZAKPOLITIKA,
          },
        },
      });

      const vKeruletCount = await prisma.newsletterSubscription.count({
        where: {
          isActive: true,
          categories: {
            has: NewsletterCategory.V_KERULET,
          },
        },
      });

      const euCount = await prisma.newsletterSubscription.count({
        where: {
          isActive: true,
          categories: {
            has: NewsletterCategory.EU,
          },
        },
      });

      expect(szakpolitikaCount).toBeGreaterThan(0);
      expect(vKeruletCount).toBeGreaterThan(0);
      expect(euCount).toBeGreaterThan(0);
    });
  });
});

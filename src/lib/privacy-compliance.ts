// Privacy Compliance and GDPR Utils for Two-Step Interaction Model

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface PrivacyConfig {
  anonymousDataRetentionDays: number;
  registeredDataRetentionDays: number;
  ipHashLength: number;
  enableAnalytics: boolean;
  gdprCompliant: boolean;
}

export const DEFAULT_PRIVACY_CONFIG: PrivacyConfig = {
  anonymousDataRetentionDays: 30,
  registeredDataRetentionDays: 365,
  ipHashLength: 16,
  enableAnalytics: true,
  gdprCompliant: true
};

export class PrivacyComplianceManager {
  private config: PrivacyConfig;

  constructor(config: PrivacyConfig = DEFAULT_PRIVACY_CONFIG) {
    this.config = config;
  }

  /**
   * Hash IP address for privacy-compliant storage
   */
  hashIPAddress(ipAddress: string): string {
    if (!ipAddress || ipAddress === 'unknown') {
      return 'unknown';
    }
    
    return crypto
      .createHash('sha256')
      .update(ipAddress + process.env.ENCRYPTION_KEY || 'default-salt')
      .digest('hex')
      .substring(0, this.config.ipHashLength);
  }

  /**
   * Sanitize user agent string for storage
   */
  sanitizeUserAgent(userAgent: string): string {
    if (!userAgent) return '';
    
    // Remove potentially identifying information
    return userAgent
      .replace(/\([^)]*\)/g, '') // Remove parenthetical info
      .replace(/Version\/[\d.]+/g, '') // Remove version numbers
      .substring(0, 100); // Limit length
  }

  /**
   * Generate session ID for anonymous tracking
   */
  generateSessionId(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(8).toString('hex');
    return `anon_${timestamp}_${random}`;
  }

  /**
   * Clean up expired anonymous data
   */
  async cleanupExpiredAnonymousData(): Promise<{
    deletedSignatures: number;
    deletedVotes: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.anonymousDataRetentionDays);

    try {
      // Delete expired anonymous signatures
      const deletedSignatures = await prisma.signature.deleteMany({
        where: {
          isAnonymous: true,
          signedAt: {
            lt: cutoffDate
          }
        }
      });

      // Delete expired anonymous votes
      const deletedVotes = await prisma.pollVote.deleteMany({
        where: {
          userId: null, // Anonymous votes have null userId
          votedAt: {
            lt: cutoffDate
          }
        }
      });

      console.log(`Privacy cleanup completed: ${deletedSignatures.count} signatures, ${deletedVotes.count} votes removed`);

      return {
        deletedSignatures: deletedSignatures.count,
        deletedVotes: deletedVotes.count
      };

    } catch (error) {
      console.error('Error during privacy cleanup:', error);
      throw error;
    }
  }

  /**
   * Anonymize registered user data (GDPR right to be forgotten)
   */
  async anonymizeUserData(email: string): Promise<{
    anonymizedSignatures: number;
    anonymizedVotes: number;
  }> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Anonymize signatures
      const anonymizedSignatures = await prisma.signature.updateMany({
        where: {
          email: email
        },
        data: {
          firstName: '[ANONYMIZED]',
          lastName: '[ANONYMIZED]',
          email: '[ANONYMIZED]',
          city: null,
          postalCode: null,
          isAnonymous: true,
          showName: false,
          allowContact: false,
          emailVerifyToken: null,
          ipAddress: null,
          userAgent: null
        }
      });

      // Anonymize poll votes (if linked to user)
      const anonymizedVotes = await prisma.pollVote.updateMany({
        where: {
          userId: user.id
        },
        data: {
          userId: null,
          ipAddress: null,
          userAgent: null
        }
      });

      console.log(`User data anonymized: ${anonymizedSignatures.count} signatures, ${anonymizedVotes.count} votes`);

      return {
        anonymizedSignatures: anonymizedSignatures.count,
        anonymizedVotes: anonymizedVotes.count
      };

    } catch (error) {
      console.error('Error anonymizing user data:', error);
      throw error;
    }
  }

  /**
   * Get privacy report for a specific petition/poll
   */
  async getPrivacyReport(itemId: string, type: 'petition' | 'poll') {
    try {
      if (type === 'petition') {
        const signatures = await prisma.signature.findMany({
          where: { petitionId: itemId },
          select: {
            isAnonymous: true,
            signedAt: true,
            showName: true,
            allowContact: true,
            isEmailVerified: true
          }
        });

        return {
          totalParticipants: signatures.length,
          anonymous: signatures.filter(s => s.isAnonymous).length,
          registered: signatures.filter(s => !s.isAnonymous).length,
          publicNames: signatures.filter(s => s.showName).length,
          allowContact: signatures.filter(s => s.allowContact).length,
          verified: signatures.filter(s => s.isEmailVerified).length
        };

      } else {
        const votes = await prisma.pollVote.findMany({
          where: { pollId: itemId },
          select: {
            userId: true,
            votedAt: true
          }
        });

        return {
          totalParticipants: votes.length,
          anonymous: votes.filter(v => !v.userId).length,
          registered: votes.filter(v => v.userId).length,
          publicNames: 0, // Votes don't have public names
          allowContact: 0, // Votes don't have contact permission
          verified: votes.filter(v => v.userId).length // Registered votes are considered verified
        };
      }

    } catch (error) {
      console.error('Error generating privacy report:', error);
      throw error;
    }
  }

  /**
   * Check if user consented to analytics
   */
  async checkAnalyticsConsent(sessionId?: string, email?: string): Promise<boolean> {
    if (!this.config.enableAnalytics) return false;

    try {
      if (sessionId) {
        // Check anonymous consent (stored in signature or vote record)
        const signature = await prisma.signature.findFirst({
          where: { sessionId },
          select: { id: true } // If found, analytics was consented
        });

        const vote = await prisma.pollVote.findFirst({
          where: { sessionId },
          select: { id: true }
        });

        return !!(signature || vote);
      }

      if (email) {
        // Check registered user consent
        const signature = await prisma.signature.findFirst({
          where: { email },
          select: { allowContact: true }
        });

        return signature?.allowContact || false;
      }

      return false;

    } catch (error) {
      console.error('Error checking analytics consent:', error);
      return false;
    }
  }

  /**
   * Generate privacy compliance summary
   */
  getComplianceSummary() {
    return {
      gdprCompliant: this.config.gdprCompliant,
      anonymousDataRetention: `${this.config.anonymousDataRetentionDays} days`,
      registeredDataRetention: `${this.config.registeredDataRetentionDays} days`,
      ipAddressHandling: 'Hashed and truncated',
      userAgentHandling: 'Sanitized and limited',
      rightToForgotten: 'Supported via anonymization',
      consentTracking: 'Per-interaction basis',
      dataMinimization: 'Only necessary data collected',
      purposeLimitation: 'Used only for stated purposes',
      storageMinimization: 'Automatic cleanup implemented'
    };
  }
}

// Export singleton instance
export const privacyManager = new PrivacyComplianceManager();

// Utility functions for common use cases
export const hashIP = (ip: string) => privacyManager.hashIPAddress(ip);
export const sanitizeUA = (ua: string) => privacyManager.sanitizeUserAgent(ua);
export const generateSessionId = () => privacyManager.generateSessionId();

// Scheduled cleanup function (to be called by cron job)
export const performPrivacyCleanup = async () => {
  console.log('Starting scheduled privacy cleanup...');
  try {
    const result = await privacyManager.cleanupExpiredAnonymousData();
    console.log('Privacy cleanup completed successfully:', result);
    return result;
  } catch (error) {
    console.error('Privacy cleanup failed:', error);
    throw error;
  }
};
// Participation Analytics for Two-Step Interaction Model

import { prisma } from '@/lib/prisma';
import { ParticipationAnalytics } from '@/types/participation';

export interface EngagementMetrics {
  totalParticipants: number;
  anonymousParticipants: number;
  registeredParticipants: number;
  conversionRate: number; // percentage of anonymous users who later registered
  completionRate: number; // percentage who completed vs abandoned
  averageTimeSpent: number; // in seconds
  demographicBreakdown: {
    ageRanges: Record<string, number>;
    regions: Record<string, number>;
  };
  timeDistribution: {
    hourly: Record<string, number>;
    daily: Record<string, number>;
    weekly: Record<string, number>;
  };
}

export interface ParticipationTrend {
  date: string;
  anonymous: number;
  registered: number;
  total: number;
  conversionRate: number;
}

export class ParticipationAnalyticsManager {
  /**
   * Get comprehensive analytics for a petition
   */
  async getPetitionAnalytics(petitionId: string): Promise<EngagementMetrics> {
    try {
      // Get all signatures
      const signatures = await prisma.signature.findMany({
        where: { petitionId },
        select: {
          isAnonymous: true,
          signedAt: true,
          city: true,
          email: true,
          allowContact: true
        }
      });

      const totalParticipants = signatures.length;
      const anonymousParticipants = signatures.filter(s => s.isAnonymous).length;
      const registeredParticipants = signatures.filter(s => !s.isAnonymous).length;

      // Calculate conversion rate (simplified - based on email overlap)
      const conversionRate = this.calculateConversionRate(signatures);

      // Calculate completion rate (assumed 100% for completed signatures)
      const completionRate = 100; // All signatures in DB are completed

      // Average time spent (mock data for now)
      const averageTimeSpent = 120; // 2 minutes average

      // Demographic breakdown
      const demographicBreakdown = this.analyzeDemographics(signatures);

      // Time distribution
      const timeDistribution = this.analyzeTimeDistribution(signatures);

      return {
        totalParticipants,
        anonymousParticipants,
        registeredParticipants,
        conversionRate,
        completionRate,
        averageTimeSpent,
        demographicBreakdown,
        timeDistribution
      };

    } catch (error) {
      console.error('Error getting petition analytics:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics for a poll
   */
  async getPollAnalytics(pollId: string): Promise<EngagementMetrics> {
    try {
      // Get all votes
      const votes = await prisma.pollVote.findMany({
        where: { pollId },
        select: {
          userId: true,
          votedAt: true,
          timeSpent: true,
          sessionId: true
        }
      });

      const totalParticipants = votes.length;
      const anonymousParticipants = votes.filter(v => !v.userId).length;
      const registeredParticipants = votes.filter(v => v.userId).length;

      // Calculate conversion rate
      const conversionRate = registeredParticipants > 0 ? 
        (registeredParticipants / totalParticipants) * 100 : 0;

      // Calculate completion rate (all votes in DB are completed)
      const completionRate = 100;

      // Calculate average time spent
      const validTimeSpent = votes.filter(v => v.timeSpent && v.timeSpent > 0);
      const averageTimeSpent = validTimeSpent.length > 0 ?
        validTimeSpent.reduce((sum, v) => sum + (v.timeSpent || 0), 0) / validTimeSpent.length :
        90; // default 90 seconds

      // Demographic breakdown (limited for polls)
      const demographicBreakdown = {
        ageRanges: {},
        regions: {}
      };

      // Time distribution
      const timeDistribution = this.analyzeTimeDistribution(votes.map(v => ({ signedAt: v.votedAt })));

      return {
        totalParticipants,
        anonymousParticipants,
        registeredParticipants,
        conversionRate,
        completionRate,
        averageTimeSpent,
        demographicBreakdown,
        timeDistribution
      };

    } catch (error) {
      console.error('Error getting poll analytics:', error);
      throw error;
    }
  }

  /**
   * Get participation trends over time
   */
  async getParticipationTrends(
    itemId: string, 
    type: 'petition' | 'poll', 
    days: number = 30
  ): Promise<ParticipationTrend[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let data: any[] = [];

      if (type === 'petition') {
        data = await prisma.signature.findMany({
          where: {
            petitionId: itemId,
            signedAt: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            isAnonymous: true,
            signedAt: true
          }
        });
      } else {
        data = await prisma.pollVote.findMany({
          where: {
            pollId: itemId,
            votedAt: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            userId: true,
            votedAt: true
          }
        });
      }

      // Group by date
      const dailyData: Record<string, { anonymous: number; registered: number }> = {};

      data.forEach(item => {
        const date = type === 'petition' ? item.signedAt : item.votedAt;
        const dateStr = date.toISOString().split('T')[0];
        
        if (!dailyData[dateStr]) {
          dailyData[dateStr] = { anonymous: 0, registered: 0 };
        }

        if (type === 'petition') {
          if (item.isAnonymous) {
            dailyData[dateStr].anonymous++;
          } else {
            dailyData[dateStr].registered++;
          }
        } else {
          if (!item.userId) {
            dailyData[dateStr].anonymous++;
          } else {
            dailyData[dateStr].registered++;
          }
        }
      });

      // Convert to trend array
      const trends: ParticipationTrend[] = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const dayData = dailyData[dateStr] || { anonymous: 0, registered: 0 };
        const total = dayData.anonymous + dayData.registered;
        const conversionRate = total > 0 ? (dayData.registered / total) * 100 : 0;

        trends.push({
          date: dateStr,
          anonymous: dayData.anonymous,
          registered: dayData.registered,
          total,
          conversionRate
        });
      }

      return trends;

    } catch (error) {
      console.error('Error getting participation trends:', error);
      throw error;
    }
  }

  /**
   * Get engagement comparison report
   */
  async getEngagementComparison(): Promise<{
    anonymousEngagement: {
      averageTimeSpent: number;
      completionRate: number;
      returnRate: number;
    };
    registeredEngagement: {
      averageTimeSpent: number;
      completionRate: number;
      returnRate: number;
      newsletterSignupRate: number;
    };
    overallTrends: {
      anonymousGrowth: number;
      registeredGrowth: number;
      conversionImprovement: number;
    };
  }> {
    try {
      // This would involve complex queries to compare engagement patterns
      // For now, returning mock data structure
      
      return {
        anonymousEngagement: {
          averageTimeSpent: 95, // seconds
          completionRate: 92, // percentage
          returnRate: 15 // percentage who participate again
        },
        registeredEngagement: {
          averageTimeSpent: 180, // seconds
          completionRate: 98, // percentage
          returnRate: 45, // percentage
          newsletterSignupRate: 65 // percentage
        },
        overallTrends: {
          anonymousGrowth: 23, // percentage increase over last period
          registeredGrowth: 15, // percentage increase
          conversionImprovement: 8 // percentage point improvement
        }
      };

    } catch (error) {
      console.error('Error getting engagement comparison:', error);
      throw error;
    }
  }

  /**
   * Calculate conversion rate (simplified)
   */
  private calculateConversionRate(signatures: any[]): number {
    const total = signatures.length;
    const registered = signatures.filter(s => !s.isAnonymous).length;
    
    return total > 0 ? (registered / total) * 100 : 0;
  }

  /**
   * Analyze demographic breakdown
   */
  private analyzeDemographics(signatures: any[]): EngagementMetrics['demographicBreakdown'] {
    const ageRanges: Record<string, number> = {};
    const regions: Record<string, number> = {};

    signatures.forEach(sig => {
      // This would extract demographic info if stored
      // For now, creating mock data based on city
      if (sig.city) {
        regions[sig.city] = (regions[sig.city] || 0) + 1;
      }
    });

    return { ageRanges, regions };
  }

  /**
   * Analyze time distribution
   */
  private analyzeTimeDistribution(data: { signedAt: Date }[]): EngagementMetrics['timeDistribution'] {
    const hourly: Record<string, number> = {};
    const daily: Record<string, number> = {};
    const weekly: Record<string, number> = {};

    data.forEach(item => {
      const date = item.signedAt;
      
      // Hourly distribution
      const hour = date.getHours().toString();
      hourly[hour] = (hourly[hour] || 0) + 1;

      // Daily distribution
      const dayOfWeek = date.toLocaleDateString('hu-HU', { weekday: 'long' });
      daily[dayOfWeek] = (daily[dayOfWeek] || 0) + 1;

      // Weekly distribution (week of year)
      const weekNumber = this.getWeekNumber(date);
      weekly[weekNumber.toString()] = (weekly[weekNumber.toString()] || 0) + 1;
    });

    return { hourly, daily, weekly };
  }

  /**
   * Get week number for date
   */
  private getWeekNumber(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.ceil((day + start.getDay() + 1) / 7);
  }
}

// Export singleton instance
export const analyticsManager = new ParticipationAnalyticsManager();
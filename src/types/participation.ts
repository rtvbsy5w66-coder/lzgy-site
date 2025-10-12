// Participation Types for Two-Step Interaction Model

export type ParticipationType = 'ANONYMOUS' | 'REGISTERED' | 'HYBRID';

export interface ParticipationChoice {
  type: 'ANONYMOUS' | 'REGISTERED';
  label: string;
  description: string;
  benefits: string[];
  icon: string;
}

export interface AnonymousParticipationData {
  sessionId: string;
  // Optional demographic data (non-identifying)
  ageRange?: string;
  region?: string;
  // Privacy settings
  allowAnalytics?: boolean;
}

export interface RegisteredParticipationData {
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  postalCode?: string;
  // Privacy and communication preferences
  showName?: boolean;
  allowContact?: boolean;
  subscribeNewsletter?: boolean;
  emailNotifications?: boolean;
}

// Union type for all participation data
export type ParticipationData = AnonymousParticipationData | RegisteredParticipationData;

// For petitions
export interface AnonymousSignatureRequest {
  sessionId: string;
  ageRange?: string;
  region?: string;
  allowAnalytics?: boolean;
}

export interface RegisteredSignatureRequest {
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  postalCode?: string;
  showName: boolean;
  allowContact: boolean;
  subscribeNewsletter?: boolean;
}

// For polls/voting
export interface AnonymousVoteRequest {
  optionId: string;
  sessionId: string;
  timeSpent?: number;
  allowAnalytics?: boolean;
}

export interface RegisteredVoteRequest {
  optionId: string;
  email?: string;
  name?: string;
  timeSpent?: number;
  subscribeUpdates?: boolean;
}

// Analytics and engagement tracking
export interface ParticipationAnalytics {
  totalParticipants: number;
  anonymousCount: number;
  registeredCount: number;
  conversionRate: number; // anonymous to registered
  completionRate: number;
  averageTimeSpent: number;
}

// UI States
export interface ParticipationFlowState {
  step: 'choice' | 'form' | 'confirmation';
  selectedType: 'ANONYMOUS' | 'REGISTERED' | null;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

// Privacy compliance
export interface PrivacySettings {
  dataRetentionDays: number;
  anonymizeAfterDays: number;
  allowAnalytics: boolean;
  allowCookies: boolean;
  gdprCompliant: boolean;
}

// Configuration for each petition/poll
export interface ParticipationConfig {
  allowAnonymous: boolean;
  allowRegistered: boolean;
  defaultType: 'ANONYMOUS' | 'REGISTERED';
  requireEmail: boolean;
  showConversionPrompt: boolean; // Encourage anonymous users to register
  privacySettings: PrivacySettings;
}
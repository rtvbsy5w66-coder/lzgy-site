import { 
  CampaignSequence, 
  SequenceEmail, 
  SequenceExecution, 
  SequenceLog,
  SequenceStatus,
  ExecutionStatus 
} from '@prisma/client';

// ===== EXTENDED TYPES WITH RELATIONS =====

export interface CampaignSequenceWithEmails extends CampaignSequence {
  emails: SequenceEmail[];
  executions?: SequenceExecution[];
  _count?: {
    emails: number;
    executions: number;
  };
}

export interface SequenceExecutionWithLogs extends SequenceExecution {
  logs: SequenceLog[];
  sequence?: CampaignSequence;
}

export interface SequenceEmailWithSequence extends SequenceEmail {
  sequence: CampaignSequence;
}

// ===== CREATE/UPDATE TYPES =====

export interface CreateSequenceData {
  name: string;
  description?: string;
  targetAudience: string;
  audienceFilter?: any;
  startDate: Date;
  totalDuration: number;
  autoEnroll?: boolean;
  createdBy: string;
  emails: CreateSequenceEmailData[];
}

export interface CreateSequenceEmailData {
  name: string;
  subject: string;
  content: string;
  previewText?: string;
  order: number;
  delayDays: number;
  sendTime: string;
  timezone?: string;
  conditions?: any;
  isActive?: boolean;
}

export interface UpdateSequenceData {
  name?: string;
  description?: string;
  targetAudience?: string;
  audienceFilter?: any;
  startDate?: Date;
  totalDuration?: number;
  autoEnroll?: boolean;
  status?: SequenceStatus;
}

// ===== DASHBOARD/STATS TYPES =====

export interface SequenceStats {
  id: string;
  name: string;
  status: SequenceStatus;
  totalSubscribers: number;
  activeSubscribers: number;
  completedSubscribers: number;
  totalEmails: number;
  emailsSent: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  currentStep: {
    step: number;
    dueCount: number;
    nextSendDate?: Date;
  };
}

export interface SequenceExecutionStats {
  subscriberEmail: string;
  subscriberName?: string;
  status: ExecutionStatus;
  currentStep: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  startedAt: Date;
  lastEmailSent?: Date;
  nextEmailDue?: Date;
  completionRate: number;
}

// ===== TARGETING TYPES =====

export interface AudienceFilter {
  categories?: string[];
  tags?: string[];
  registrationDateFrom?: Date;
  registrationDateTo?: Date;
  engagement?: 'HIGH' | 'MEDIUM' | 'LOW';
  excludeUnsubscribed?: boolean;
  customConditions?: {
    field: string;
    operator: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
    value: any;
  }[];
}

export interface SequenceConditions {
  // Feltételes logika
  sendIf?: {
    previousEmailOpened?: boolean;
    previousEmailClicked?: boolean;
    daysSinceLastEmail?: number;
    subscriberTag?: string;
  };
  skipIf?: {
    unsubscribed?: boolean;
    bounced?: boolean;
    inactiveForDays?: number;
  };
}

// ===== API TYPES =====

export interface CreateSequenceRequest {
  sequence: CreateSequenceData;
}

export interface UpdateSequenceRequest {
  sequenceId: string;
  updates: UpdateSequenceData;
}

export interface StartSequenceRequest {
  sequenceId: string;
  subscriberEmails?: string[];
  startImmediately?: boolean;
}

export interface SequencePreviewRequest {
  sequenceId: string;
  emailOrder: number;
  subscriberEmail: string;
}

// ===== SCHEDULER TYPES =====

export interface SequenceSchedulerResult {
  processedSequences: number;
  emailsSent: number;
  results: SequenceProcessResult[];
}

export interface SequenceProcessResult {
  sequenceId: string;
  sequenceName: string;
  emailsSent: number;
  errors?: string[];
  success: boolean;
}

// ===== VALIDATION TYPES =====

export interface SequenceValidationError {
  field: string;
  message: string;
  emailOrder?: number;
}

export interface SequenceValidationResult {
  valid: boolean;
  errors: SequenceValidationError[];
  warnings: SequenceValidationError[];
}

// ===== TEMPLATE TYPES =====

export interface SequenceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  emails: SequenceTemplateEmail[];
  previewImage?: string;
}

export interface SequenceTemplateEmail {
  name: string;
  subject: string;
  content: string;
  delayDays: number;
  sendTime: string;
  description: string;
}

// ===== ANALYTICS TYPES =====

export interface SequenceAnalytics {
  sequenceId: string;
  timeRange: {
    from: Date;
    to: Date;
  };
  metrics: {
    totalSubscribers: number;
    activeSubscribers: number;
    completedSubscribers: number;
    totalEmailsSent: number;
    totalEmailsOpened: number;
    totalEmailsClicked: number;
    averageOpenRate: number;
    averageClickRate: number;
    unsubscribeRate: number;
    completionRate: number;
  };
  emailPerformance: {
    order: number;
    subject: string;
    sentCount: number;
    openCount: number;
    clickCount: number;
    openRate: number;
    clickRate: number;
  }[];
  dailyStats: {
    date: Date;
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
  }[];
}

// ===== CONSTANTS =====

export const TARGET_AUDIENCES = {
  ALL: 'Minden feliratkozó',
  STUDENTS: 'Diákok',
  VOTERS: 'Szavazók', 
  SUPPORTERS: 'Támogatók',
  NEWSLETTER_SUBSCRIBERS: 'Hírlevél feliratkozók',
  EVENT_ATTENDEES: 'Esemény résztvevők',
  CUSTOM: 'Egyedi szűrés'
} as const;

export const SEQUENCE_TEMPLATES = {
  STUDENT_CAMPAIGN: 'Diák Kampány',
  ELECTION_CAMPAIGN: 'Választási Kampány',
  EVENT_SERIES: 'Esemény Sorozat',
  WELCOME_SERIES: 'Üdvözlő Sorozat',
  NEWSLETTER_ONBOARDING: 'Hírlevél Bevezetés',
  CUSTOM: 'Egyedi Sequence'
} as const;

export const DEFAULT_SEND_TIMES = [
  '08:00', '09:00', '10:00', '11:00', 
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00'
] as const;

// ===== EXPORT ALL PRISMA ENUMS =====
export { SequenceStatus, ExecutionStatus } from '@prisma/client';
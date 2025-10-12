// Önkormányzati problémakezelő rendszer típusok

export enum IssueStatus {
  SUBMITTED = 'SUBMITTED',      // Beküldve
  REVIEWED = 'REVIEWED',        // Áttekintve
  IN_PROGRESS = 'IN_PROGRESS',  // Folyamatban
  RESOLVED = 'RESOLVED',        // Megoldva
  CLOSED = 'CLOSED',            // Lezárva
  REJECTED = 'REJECTED'         // Elutasítva
}

export enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'number' | 'email' | 'tel' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // select, radio opciókhoz
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface IssueCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  order: number;
  formFields?: FormField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Issue {
  id: string;
  categoryId: string;
  category?: IssueCategory;
  
  // Bejelentő adatai
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  reporterAddress?: string;
  
  // Probléma részletei
  title: string;
  description: string;
  location?: string;
  urgency: IssuePriority;
  
  // Státusz és kezelés
  status: IssueStatus;
  assignedTo?: string;
  resolution?: string;
  
  // Dinamikus mezők
  customFields?: Record<string, any>;
  
  // Melléklet
  attachments: string[];
  
  // Nyomonkövetés
  trackingNumber: string;
  isPublic: boolean;
  citizenNotified: boolean;
  
  // Időbélyegek
  submittedAt: Date;
  reviewedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // Kapcsolatok
  statusUpdates?: IssueStatusUpdate[];
  notifications?: IssueNotification[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueStatusUpdate {
  id: string;
  issueId: string;
  previousStatus?: IssueStatus;
  newStatus: IssueStatus;
  comment?: string;
  internalNote?: string;
  updatedBy: string;
  updatedByRole?: string;
  notifyCitizen: boolean;
  citizenNotified: boolean;
  createdAt: Date;
}

export interface IssueNotification {
  id: string;
  issueId: string;
  type: string;
  subject: string;
  message: string;
  recipientEmail: string;
  recipientName?: string;
  sent: boolean;
  sentAt?: Date;
  error?: string;
  createdAt: Date;
}

export interface IssueSubmissionData {
  categoryId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  reporterAddress?: string;
  title: string;
  description: string;
  location?: string;
  urgency: IssuePriority;
  customFields?: Record<string, any>;
  attachments?: File[];
}

export interface IssueTrackingResult {
  issue: Issue;
  found: boolean;
  canView: boolean;
}

// Status változás címkék magyarul
export const IssueStatusLabels: Record<IssueStatus, string> = {
  [IssueStatus.SUBMITTED]: 'Beküldve',
  [IssueStatus.REVIEWED]: 'Áttekintve',
  [IssueStatus.IN_PROGRESS]: 'Folyamatban',
  [IssueStatus.RESOLVED]: 'Megoldva',
  [IssueStatus.CLOSED]: 'Lezárva',
  [IssueStatus.REJECTED]: 'Elutasítva'
};

// Prioritás címkék magyarul
export const IssuePriorityLabels: Record<IssuePriority, string> = {
  [IssuePriority.LOW]: 'Alacsony',
  [IssuePriority.MEDIUM]: 'Közepes',
  [IssuePriority.HIGH]: 'Magas',
  [IssuePriority.URGENT]: 'Sürgős'
};

// Status színek
export const IssueStatusColors: Record<IssueStatus, string> = {
  [IssueStatus.SUBMITTED]: '#6b7280',    // gray
  [IssueStatus.REVIEWED]: '#3b82f6',     // blue
  [IssueStatus.IN_PROGRESS]: '#f59e0b',  // amber
  [IssueStatus.RESOLVED]: '#10b981',     // emerald
  [IssueStatus.CLOSED]: '#8b5cf6',       // violet
  [IssueStatus.REJECTED]: '#ef4444'      // red
};

// Prioritás színek
export const IssuePriorityColors: Record<IssuePriority, string> = {
  [IssuePriority.LOW]: '#10b981',      // emerald
  [IssuePriority.MEDIUM]: '#f59e0b',   // amber
  [IssuePriority.HIGH]: '#f97316',     // orange
  [IssuePriority.URGENT]: '#ef4444'    // red
};
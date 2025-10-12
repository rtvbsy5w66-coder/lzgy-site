export interface PetitionCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    petitions: number;
  };
}

export interface Petition {
  id: string;
  title: string;
  description: string;
  fullText?: string;
  targetGoal: number;
  categoryId: string;
  tags?: string;
  status: PetitionStatus;
  isPublic: boolean;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdBy?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  category?: PetitionCategory;
  signatures?: Signature[];
  _count?: {
    signatures: number;
    verifiedSignatures: number;
  };
}

export interface Signature {
  id: string;
  petitionId: string;
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  postalCode?: string;
  isEmailVerified: boolean;
  emailVerifyToken?: string;
  emailVerifiedAt?: Date;
  showName: boolean;
  allowContact: boolean;
  status: SignatureStatus;
  isVisible: boolean;
  ipAddress?: string;
  userAgent?: string;
  signedAt: Date;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNote?: string;
  petition?: Petition;
}

export enum PetitionStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED'
}

export enum SignatureStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SPAM = 'SPAM'
}

export interface CreatePetitionRequest {
  title: string;
  description: string;
  fullText?: string;
  targetGoal: number;
  categoryId: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
}

export interface UpdatePetitionRequest extends Partial<CreatePetitionRequest> {
  status?: PetitionStatus;
  isActive?: boolean;
}

export interface CreateSignatureRequest {
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  postalCode?: string;
  showName?: boolean;
  allowContact?: boolean;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface PetitionListFilters {
  category?: string;
  status?: PetitionStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SignatureListFilters {
  petitionId?: string;
  status?: SignatureStatus;
  verified?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PetitionStats {
  totalPetitions: number;
  activePetitions: number;
  totalSignatures: number;
  averageSignaturesPerPetition: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    signatures: number;
    petitions: number;
  }>;
}
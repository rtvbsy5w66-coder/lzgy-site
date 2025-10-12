export type PollStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type ShowResultsType = 'NEVER' | 'AFTER_VOTING' | 'LIVE' | 'AFTER_END';

export interface Poll {
  id: string;
  title: string;
  description?: string;
  status: PollStatus;
  category?: string;
  
  // Time constraints
  startDate?: string;
  endDate?: string;
  timeLimit?: number; // in minutes
  
  // Voting rules
  isPublic: boolean;
  allowAnonymous: boolean;
  maxVotesPerUser?: number;
  showResults: ShowResultsType;
  showLiveCount: boolean;
  
  // Metadata
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  options: PollOption[];
  votes?: PollVote[];
  _count?: {
    votes: number;
    options: number;
  };
}

export interface PollOption {
  id: string;
  pollId: string;
  optionText: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  createdAt: string;
  
  votes?: PollVote[];
  _count?: {
    votes: number;
  };
}

export interface PollVote {
  id: string;
  pollId: string;
  optionId: string;
  userId?: string;
  sessionId?: string;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  votedAt: string;
  timeSpent?: number;
  
  poll?: Poll;
  option?: PollOption;
  user?: {
    name?: string;
    email?: string;
  };
}

export interface PollResult {
  id: string;
  pollId: string;
  optionId: string;
  voteCount: number;
  percentage: number;
  calculatedAt: string;
}

// Form types for creating/editing polls
export interface PollFormData {
  title: string;
  description?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  timeLimit?: number;
  isPublic: boolean;
  allowAnonymous: boolean;
  maxVotesPerUser?: number;
  showResults: ShowResultsType;
  showLiveCount: boolean;
  options: PollOptionFormData[];
}

export interface PollOptionFormData {
  optionText: string;
  description?: string;
  imageUrl?: string;
}

// Vote submission types
export interface VoteSubmissionData {
  optionId: string;
  sessionId?: string;
  timeSpent?: number;
}

// Statistics types
export interface PollStats {
  totalVotes: number;
  uniqueVoters: number;
  averageTimeSpent?: number;
  votingRate: number; // votes per hour or day
}

export interface PollResultsResponse {
  poll: Poll;
  results: Array<{
    option: PollOption;
    voteCount: number;
    percentage: number;
  }>;
  stats: PollStats;
  userVote?: PollVote;
  canVote: boolean;
  timeRemaining?: number; // seconds until poll closes
}

// Real-time countdown helper types
export interface PollTimeStatus {
  status: 'not_started' | 'active' | 'ending_soon' | 'closed';
  timeRemaining?: number; // in seconds
  timeUntilStart?: number; // in seconds
  message: string;
}

// Validation types
export interface PollValidation {
  canVote: boolean;
  reason?: string;
  timeRemaining?: number;
  hasVoted: boolean;
  votesLeft?: number;
}
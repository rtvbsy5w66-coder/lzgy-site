export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'TEXT_INPUT' | 'MULTIPLE_SELECT';

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  status: QuizStatus;
  category?: string;
  timeLimit?: number; // in minutes
  maxAttempts?: number;
  isPublic: boolean;
  showResults: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  questions: QuizQuestion[];
  _count?: {
    results: number;
  };
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  questionType: QuestionType;
  explanation?: string;
  points: number;
  required: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId?: string;
  sessionId?: string;
  score: number;
  totalPoints: number;
  timeSpent?: number; // in seconds
  completedAt: string;
  userAgent?: string;
  ipAddress?: string;
  answers: QuizAnswer[];
  user?: {
    name?: string;
    email?: string;
  };
}

export interface QuizAnswer {
  id: string;
  resultId: string;
  questionId: string;
  optionId?: string;
  textAnswer?: string;
  isCorrect: boolean;
  points: number;
  answeredAt: string;
  question?: {
    question: string;
    explanation?: string;
    points: number;
  };
  option?: {
    optionText: string;
    isCorrect: boolean;
  };
}

// Form types for creating/editing quizzes
export interface QuizFormData {
  title: string;
  description?: string;
  category?: string;
  timeLimit?: number;
  maxAttempts?: number;
  isPublic: boolean;
  showResults: boolean;
  questions: QuestionFormData[];
}

export interface QuestionFormData {
  question: string;
  questionType: QuestionType;
  explanation?: string;
  points: number;
  required: boolean;
  options: OptionFormData[];
}

export interface OptionFormData {
  optionText: string;
  isCorrect: boolean;
}

// Submit types
export interface SubmitAnswerData {
  questionId: string;
  optionId?: string;
  optionIds?: string[]; // for MULTIPLE_SELECT
  textAnswer?: string;
}

export interface SubmitQuizData {
  answers: SubmitAnswerData[];
  timeSpent?: number;
  sessionId?: string;
}

// Statistics types
export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  averagePercentage: number;
  averageTimeSpent?: number;
}

export interface QuizResultsResponse {
  results: QuizResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: QuizStats;
  quiz: {
    title: string;
    _count: {
      questions: number;
    };
  };
}
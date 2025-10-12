// ===============================================
// V. KERÜLETI KÉPVISELŐI BEJELENTÉSI RENDSZER - TYPES
// ===============================================

export const CATEGORIES = {
  ROADS: 'roads',
  LIGHTING: 'lighting',
  PARKS: 'parks',
  WASTE: 'waste',
  TRAFFIC: 'traffic',
  NOISE: 'noise',
  SOCIAL: 'social',
  GRANTS: 'grants',
  TRANSPARENCY: 'transparency',
  OTHER: 'other',
} as const;

export type CategoryType = typeof CATEGORIES[keyof typeof CATEGORIES];

// Kategória labels magyar nyelven - PONTOSAN EGYEZNEK A SLIDER KATEGÓRIÁKKAL
export const CATEGORY_LABELS: Record<CategoryType, string> = {
  roads: '🛣️ Úthibák és járdák',
  lighting: '💡 Közvilágítás',
  parks: '🌳 Parkok és zöldterületek',
  waste: '🗑️ Hulladékkezelés',
  traffic: '🚦 Közlekedés',
  noise: '🔊 Zajszennyezés',
  social: '❤️ Szociális ügyek',
  grants: '💰 Pályázatok és támogatások',
  transparency: '⚖️ Átláthatóság és korrupció',
  other: '❓ Egyéb probléma',
};

// Kategória rövid leírások - PONTOSAN EGYEZNEK A SLIDER LEÍRÁSOKKAL
export const CATEGORY_DESCRIPTIONS: Record<CategoryType, string> = {
  roads: 'Útburkolat károk, járdahibák, kátyúk',
  lighting: 'Utcai világítás hibák, kiégett lámpák',
  parks: 'Park karbantartás, játszóterek, növényzet',
  waste: 'Szemétszállítás, konténerek, illegális lerakás',
  traffic: 'KRESZ táblák, zebra, parkolás, dugók',
  noise: 'Túlzott zaj, építkezési zajok',
  social: 'Idősellátás, családsegítés, szociális támogatások',
  grants: 'EU pályázatok, önkormányzati támogatások, civil szervezetek',
  transparency: 'Közpénzek felhasználása, beszerzések, átláthatóság',
  other: 'Minden más önkormányzati ügy',
};

// Sürgősségi szintek
export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  EMERGENCY: 'emergency',
} as const;

export type UrgencyType = typeof URGENCY_LEVELS[keyof typeof URGENCY_LEVELS];

export const URGENCY_LABELS: Record<UrgencyType, string> = {
  low: 'Alacsony',
  medium: 'Közepes',
  high: 'Sürgős',
  emergency: 'Vészhelyzet',
};

export const URGENCY_COLORS: Record<UrgencyType, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
};

export const URGENCY_ICONS: Record<UrgencyType, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  emergency: '🔴',
};

// Státuszok
export const REPORT_STATUS = {
  SUBMITTED: 'submitted',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived',
} as const;

export type ReportStatusType = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];

export const STATUS_LABELS: Record<ReportStatusType, string> = {
  submitted: 'Beküldve',
  in_progress: 'Folyamatban',
  resolved: 'Megoldva',
  archived: 'Archiválva',
};

export const STATUS_COLORS: Record<ReportStatusType, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
};

// Felelős osztályok
export const DEPARTMENTS = {
  PUBLIC_WORKS: 'public_works',
  UTILITIES: 'utilities',
  ENVIRONMENT: 'environment',
  TRAFFIC: 'traffic',
  SOCIAL: 'social',
  CULTURE: 'culture',
  ADMINISTRATION: 'administration',
  DEVELOPMENT: 'development',
} as const;

export type DepartmentType = typeof DEPARTMENTS[keyof typeof DEPARTMENTS];

export const DEPARTMENT_LABELS: Record<DepartmentType, string> = {
  public_works: 'Közterület-fenntartás',
  utilities: 'Közművek és Infrastruktúra',
  environment: 'Környezetvédelem',
  traffic: 'Közlekedési Osztály',
  social: 'Szociális és Családügyi Osztály',
  culture: 'Kulturális és Oktatási Osztály',
  administration: 'Igazgatási Osztály',
  development: 'Városfejlesztési Osztály',
};

// Költségbecslés kategóriák
export const COST_ESTIMATES = {
  UNDER_100K: 'under_100k',
  '100K_500K': '100k_500k',
  '500K_1M': '500k_1m',
  '1M_5M': '1m_5m',
  OVER_5M: 'over_5m',
  UNKNOWN: 'unknown',
} as const;

export type CostEstimateType = typeof COST_ESTIMATES[keyof typeof COST_ESTIMATES];

export const COST_ESTIMATE_LABELS: Record<CostEstimateType, string> = {
  under_100k: '100 ezer Ft alatt',
  '100k_500k': '100-500 ezer Ft',
  '500k_1m': '500 ezer - 1 millió Ft',
  '1m_5m': '1-5 millió Ft',
  over_5m: '5 millió Ft felett',
  unknown: 'Ismeretlen / Nem becsülhető',
};

// Kerületi területek
export const DISTRICT_AREAS = {
  BELVAROS: 'Belváros',
  LIPOTVAROS: 'Lipótváros',
  BOTH: 'Mindkettő',
} as const;

export type DistrictAreaType = typeof DISTRICT_AREAS[keyof typeof DISTRICT_AREAS];

// TypeScript interfaces
export interface CreateReportData {
  category: CategoryType;
  subcategory: string;
  title: string;
  description: string;
  addressText: string;
  addressId?: string;
  postalCode?: string;
  affectedArea?: string;
  urgency: UrgencyType;
  department?: DepartmentType;
  estimatedCost?: CostEstimateType;
  legalIssue?: boolean;
  categoryData?: Record<string, any>;
}

export interface ReportData {
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // Képviselő
  authorId: string;
  representativeName: string;
  districtArea?: string;
  
  // Tartalom
  category: CategoryType;
  subcategory: string;
  title: string;
  description: string;
  
  // Helyszín
  addressId?: string;
  addressText: string;
  postalCode?: string;
  affectedArea?: string;
  
  // Státusz
  urgency: UrgencyType;
  department?: DepartmentType;
  estimatedCost?: CostEstimateType;
  status: ReportStatusType;
  assignedTo?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  
  // Adminisztratív
  legalIssue: boolean;
  internalNotes?: string;
  categoryData?: Record<string, any>;
  
  // Relations (optional for API responses)
  author?: {
    name?: string;
    email?: string;
  };
  address?: {
    id: string;
    fullAddress: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  _count?: {
    attachments: number;
    history: number;
  };
  attachments?: Array<{
    id: string;
    filename: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  history?: Array<{
    id: string;
    createdAt: string;
    changedBy: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    comment?: string;
  }>;
}

export interface ReportListResponse {
  success: boolean;
  data: ReportData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateReportResponse {
  success: boolean;
  reportId: string;
  data: ReportData;
}

// History action types
export const HISTORY_ACTIONS = {
  CREATED: 'created',
  STATUS_CHANGED: 'status_changed',
  ASSIGNED: 'assigned',
  UPDATED: 'updated',
  COMMENT_ADDED: 'comment_added',
} as const;

export type HistoryActionType = typeof HISTORY_ACTIONS[keyof typeof HISTORY_ACTIONS];

export const HISTORY_ACTION_LABELS: Record<HistoryActionType, string> = {
  created: 'Létrehozva',
  status_changed: 'Státusz módosítva',
  assigned: 'Kiosztva',
  updated: 'Frissítve',
  comment_added: 'Megjegyzés hozzáadva',
};
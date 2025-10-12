// Hírek kategória rendszer - külön a program kategóriáktól
export const NEWS_CATEGORIES = [
  "Hírek",
  "Események", 
  "Közlemények",
  "Sajtóközlemények",
  "Kampány",
  "V. kerület"
] as const;

export type NewsCategoryType = typeof NEWS_CATEGORIES[number];

// Hírek kategória leírások
export const NEWS_CATEGORY_DESCRIPTIONS: Record<NewsCategoryType, string> = {
  "Hírek": "Általános hírek és aktualitások",
  "Események": "Rendezvények és események hírei",
  "Közlemények": "Hivatalos közlemények és bejelentések",
  "Sajtóközlemények": "Sajtó számára készült hivatalos közlemények",
  "Kampány": "Kampányhoz kapcsolódó hírek és információk",
  "V. kerület": "V. kerületi képviselői munkához kapcsolódó hírek és fejlesztések"
};

// Hírek kategória színek
export const NEWS_CATEGORY_COLORS: Record<NewsCategoryType, { primary: string; secondary: string }> = {
  "Hírek": { primary: "#3b82f6", secondary: "#dbeafe" },
  "Események": { primary: "#10b981", secondary: "#d1fae5" },
  "Közlemények": { primary: "#f59e0b", secondary: "#fef3c7" },
  "Sajtóközlemények": { primary: "#ef4444", secondary: "#fee2e2" },
  "Kampány": { primary: "#8b5cf6", secondary: "#ede9fe" },
  "V. kerület": { primary: "#dc2626", secondary: "#fecaca" }
};
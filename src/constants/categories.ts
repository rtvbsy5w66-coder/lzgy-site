// Egységes kategória rendszer - bővített programpontokkal
export const CATEGORIES = [
  "Szociálpolitika",
  "Oktatáspolitika", 
  "Egészségügy",
  "Közlekedés",
  "Turizmus és vendéglátás",
  "Honvédelem",
  "Rendvédelem",
  "Nyugdíjasok támogatása",
  "Integritás és elszámoltatás"
] as const;

export type CategoryType = typeof CATEGORIES[number];

// Kategória leírások
export const CATEGORY_DESCRIPTIONS: Record<CategoryType, string> = {
  "Szociálpolitika": "Családtámogatás, szociális lakhatás és társadalmi felzárkóztatás",
  "Oktatáspolitika": "Digitális oktatás, pedagógus támogatás és felsőoktatás fejlesztése",
  "Egészségügy": "Várólisták felszámolása, egészségügyi dolgozók támogatása és megelőzés",
  "Közlekedés": "Ingyenes tömegközlekedés, elektromos közlekedés és vasútfejlesztés",
  "Turizmus és vendéglátás": "Kulturális turizmus, gyógyturizmus és vidéki turizmus fejlesztése",
  "Honvédelem": "Katonai modernizáció, veterán támogatás és polgári védelem",
  "Rendvédelem": "Közbiztonság növelése, kiberbűnözés elleni küzdelem és igazságszolgáltatás",
  "Nyugdíjasok támogatása": "Nyugdíjemelés, idősellátás és aktív időskor programok",
  "Integritás és elszámoltatás": "Átlátható közbeszerzés, korrupcióellenes intézkedések és etikai normák"
};

// Kategória színek és ikonok
export const CATEGORY_COLORS: Record<CategoryType, { primary: string; secondary: string }> = {
  "Szociálpolitika": { primary: "#f59e0b", secondary: "#fef3c7" },
  "Oktatáspolitika": { primary: "#3b82f6", secondary: "#dbeafe" },
  "Egészségügy": { primary: "#ef4444", secondary: "#fee2e2" },
  "Közlekedés": { primary: "#8b5cf6", secondary: "#ede9fe" },
  "Turizmus és vendéglátás": { primary: "#22c55e", secondary: "#dcfce7" },
  "Honvédelem": { primary: "#6b7280", secondary: "#f3f4f6" },
  "Rendvédelem": { primary: "#1f2937", secondary: "#f9fafb" },
  "Nyugdíjasok támogatása": { primary: "#ec4899", secondary: "#fce7f3" },
  "Integritás és elszámoltatás": { primary: "#0891b2", secondary: "#cffafe" }
};
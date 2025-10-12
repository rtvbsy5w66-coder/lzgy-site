// ===============================================
// SUBCATEGORY DEFINITIONS - V. KERÜLETI BEJELENTÉSEK
// ===============================================

import { CategoryType } from './report.types';

export interface Subcategory {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export const SUBCATEGORIES: Record<CategoryType, Subcategory[]> = {
  roads: [
    { 
      value: 'road', 
      label: 'Útburkolat probléma', 
      description: 'Kátyú, repedés, süllyedés, úthibák',
      icon: '🛣️'
    },
    { 
      value: 'sidewalk', 
      label: 'Járda hibája', 
      description: 'Sérült járda, akadálymentes hozzáférés problémák',
      icon: '🚶'
    },
    { 
      value: 'lighting', 
      label: 'Közvilágítás', 
      description: 'Nem működő vagy hibás utcai világítás',
      icon: '💡'
    },
    { 
      value: 'street_furniture', 
      label: 'Közterületi eszköz', 
      description: 'Pad, szemeteskosár, kerékpártároló, buszmegálló',
      icon: '🪑'
    },
    { 
      value: 'utilities', 
      label: 'Közmű probléma', 
      description: 'Víz, gáz, elektromos hálózat hibája',
      icon: '⚡'
    },
    { 
      value: 'drainage', 
      label: 'Vízelvezetés', 
      description: 'Csatorna, szikkasztás, vízelfolyás problémák',
      icon: '🌊'
    },
    { 
      value: 'other', 
      label: 'Egyéb infrastruktúra',
      icon: '🔧'
    },
  ],

  lighting: [
    {
      value: 'street_light',
      label: 'Utcai világítás',
      description: 'Nem működő vagy hibás lámpatest',
      icon: '💡'
    },
    {
      value: 'park_light',
      label: 'Park világítás',
      description: 'Közterületi világítás problémák',
      icon: '🔦'
    },
    {
      value: 'safety_lighting',
      label: 'Biztonsági világítás',
      description: 'Közbiztonsági célú megvilágítás',
      icon: '🚨'
    },
    {
      value: 'decorative',
      label: 'Díszvilágítás',
      description: 'Ünnepi, díszkivilágítás',
      icon: '✨'
    },
    {
      value: 'other',
      label: 'Egyéb világítási probléma',
      icon: '🔧'
    },
  ],

  parks: [
    { 
      value: 'waste', 
      label: 'Hulladékkezelés', 
      description: 'Nem ürített kuka, túlcsordult konténer',
      icon: '🗑️'
    },
    { 
      value: 'illegal_dump', 
      label: 'Illegális szemétlerakás', 
      description: 'Jogtalan hulladéklerakás közterületen',
      icon: '🚫'
    },
    { 
      value: 'green_area', 
      label: 'Zöldterület gondozása', 
      description: 'Park állapota, fa metszése, virágültetés',
      icon: '🌳'
    },
    { 
      value: 'dangerous_tree', 
      label: 'Veszélyes fa', 
      description: 'Kidőlés veszélye, beteg fa',
      icon: '⚠️'
    },
    { 
      value: 'street_cleaning', 
      label: 'Utcaseprés', 
      description: 'Közterület tisztasági problémák',
      icon: '🧹'
    },
    { 
      value: 'graffiti', 
      label: 'Graffiti / rongálás', 
      description: 'Falfirka, vandalizmus eltávolítása',
      icon: '🎨'
    },
    { 
      value: 'pest_control', 
      label: 'Kártevő irtás', 
      description: 'Patkány, egyéb kártevők',
      icon: '🐀'
    },
    { 
      value: 'other', 
      label: 'Egyéb tisztasági probléma',
      icon: '🧽'
    },
  ],

  waste: [
    {
      value: 'collection',
      label: 'Hulladékgy űjtés',
      description: 'Nem ürített kuka, túlcsordult konténer',
      icon: '🗑️'
    },
    {
      value: 'illegal_dump',
      label: 'Illegális szemétlerakás',
      description: 'Jogtalan hulladéklerakás közterületen',
      icon: '🚫'
    },
    {
      value: 'recycling',
      label: 'Szelektív hulladék',
      description: 'Újrahasznosítási problémák',
      icon: '♻️'
    },
    {
      value: 'bulk_waste',
      label: 'Lomtalanítás',
      description: 'Nagytárgyú hulladék elszállítás',
      icon: '🛋️'
    },
    {
      value: 'other',
      label: 'Egyéb hulladékkezelési probléma',
      icon: '🧹'
    },
  ],

  traffic: [
    { 
      value: 'parking', 
      label: 'Parkolási probléma', 
      description: 'Tiltott parkolás, hiányzó parkolóhelyek',
      icon: '🅿️'
    },
    { 
      value: 'traffic_signs', 
      label: 'KRESZ tábla', 
      description: 'Hiányzó, sérült, rossz helyen lévő táblák',
      icon: '⛔'
    },
    { 
      value: 'crosswalk', 
      label: 'Gyalogátkelő', 
      description: 'Zebra festés, világítás problémák',
      icon: '🚸'
    },
    { 
      value: 'traffic_lights', 
      label: 'Jelzőlámpa', 
      description: 'Hibás működés, programozási probléma',
      icon: '🚥'
    },
    { 
      value: 'bike_lane', 
      label: 'Kerékpárút', 
      description: 'Kerékpársáv állapota, elválasztás',
      icon: '🚴'
    },
    { 
      value: 'congestion', 
      label: 'Forgalmi probléma', 
      description: 'Dugó, torlódás, forgalomszervezés',
      icon: '🚗'
    },
    { 
      value: 'speed_control', 
      label: 'Sebességkorlátozás', 
      description: 'Sebességcsökkentő intézkedések javaslata',
      icon: '⏱️'
    },
    { 
      value: 'other', 
      label: 'Egyéb közlekedési probléma',
      icon: '🚧'
    },
  ],

  noise: [
    { 
      value: 'noise', 
      label: 'Zajszennyezés', 
      description: 'Építkezés, szórakozóhely, forgalmi zaj',
      icon: '🔊'
    },
    { 
      value: 'neighbor_conflict', 
      label: 'Szomszédsági konfliktus', 
      description: 'Lakók közötti viták közvetítése',
      icon: '🏠'
    },
    { 
      value: 'business_issue', 
      label: 'Üzlet / vendéglátóhely', 
      description: 'Működési engedély, nyitvatartás problémák',
      icon: '🏪'
    },
    { 
      value: 'construction', 
      label: 'Építkezési panasz', 
      description: 'Engedély nélküli építkezés, időtúllépés',
      icon: '🏗️'
    },
    { 
      value: 'pet_issue', 
      label: 'Állattartási probléma', 
      description: 'Kutyafuttatás, sétáltatás, ürülék',
      icon: '🐕'
    },
    { 
      value: 'air_quality', 
      label: 'Levegőminőség', 
      description: 'Szennyezés, szag, füst panaszok',
      icon: '💨'
    },
    { 
      value: 'other', 
      label: 'Egyéb lakossági panasz',
      icon: '📢'
    },
  ],

  social: [
    { 
      value: 'event_proposal', 
      label: 'Rendezvény szervezés', 
      description: 'Közösségi program, fesztivál javaslat',
      icon: '🎉'
    },
    { 
      value: 'space_development', 
      label: 'Közösségi tér fejlesztése', 
      description: 'Játszótér, park, közösségi ház',
      icon: '🏛️'
    },
    { 
      value: 'cultural_program', 
      label: 'Kulturális program', 
      description: 'Kiállítás, koncert, előadás szervezése',
      icon: '🎭'
    },
    { 
      value: 'ngo_support', 
      label: 'Civil szervezet támogatása', 
      description: 'Alapítványok, egyesületek segítése',
      icon: '🤝'
    },
    { 
      value: 'youth_program', 
      label: 'Ifjúsági program', 
      description: 'Fiataloknak szóló kezdeményezések',
      icon: '👨‍🎓'
    },
    { 
      value: 'senior_program', 
      label: 'Idősek programja', 
      description: 'Nyugdíjasoknak szóló szolgáltatások',
      icon: '👵'
    },
    { 
      value: 'sports', 
      label: 'Sport és rekreáció', 
      description: 'Sportpályák, mozgási lehetőségek',
      icon: '⚽'
    },
    { 
      value: 'other', 
      label: 'Egyéb közösségi kezdeményezés',
      icon: '🎪'
    },
  ],

  grants: [
    { 
      value: 'infrastructure_dev', 
      label: 'Infrastruktúra fejlesztés', 
      description: 'Út, járda, tér felújítás, korszerűsítés',
      icon: '🏗️'
    },
    { 
      value: 'social_dev', 
      label: 'Szociális fejlesztés', 
      description: 'Idősek otthona, óvoda, egészségügyi központ',
      icon: '🏥'
    },
    { 
      value: 'economic_dev', 
      label: 'Gazdasági fejlesztés', 
      description: 'Vállalkozói környezet, üzletfejlesztés',
      icon: '💼'
    },
    { 
      value: 'cultural_dev', 
      label: 'Kulturális fejlesztés', 
      description: 'Múzeum, könyvtár, galéria, művelődési ház',
      icon: '📚'
    },
    { 
      value: 'digital_dev', 
      label: 'Digitális fejlesztés', 
      description: 'Smart city, WiFi, digitalizáció',
      icon: '💻'
    },
    { 
      value: 'tourism_dev', 
      label: 'Turizmus fejlesztés', 
      description: 'Látványosságok, vendégfogadás javítása',
      icon: '🗺️'
    },
    { 
      value: 'environmental_dev', 
      label: 'Környezeti fejlesztés', 
      description: 'Zöld technológiák, fenntarthatóság',
      icon: '🌱'
    },
    { 
      value: 'other', 
      label: 'Egyéb fejlesztési javaslat',
      icon: '📈'
    },
  ],

  transparency: [
    { 
      value: 'document', 
      label: 'Dokumentum kérése', 
      description: 'Határozat, szerződés, jegyzőkönyv lekérése',
      icon: '📑'
    },
    { 
      value: 'budget_data', 
      label: 'Költségvetési adat', 
      description: 'Bevételek, kiadások, pénzügyi információk',
      icon: '💰'
    },
    { 
      value: 'decision_status', 
      label: 'Döntés végrehajtása', 
      description: 'Képviselőtestületi határozat státusza',
      icon: '✅'
    },
    { 
      value: 'contract_info', 
      label: 'Szerződés információ', 
      description: 'Közbeszerzés, közterület hasznosítás',
      icon: '📜'
    },
    { 
      value: 'meeting_minutes', 
      label: 'Ülés jegyzőkönyv', 
      description: 'Testületi ülések jegyzőkönyvei',
      icon: '📝'
    },
    { 
      value: 'public_data', 
      label: 'Közérdekű adat', 
      description: 'Információszabadság szerinti kérelem',
      icon: '🔍'
    },
    { 
      value: 'statistics', 
      label: 'Statisztikai adatok', 
      description: 'Kerületi mutatók, felmérések',
      icon: '📊'
    },
    { 
      value: 'other', 
      label: 'Egyéb információkérés',
      icon: '❓'
    },
  ],
  
  other: [
    { 
      value: 'uncategorized', 
      label: 'Nem kategorizálható', 
      description: 'Egyedi, speciális eset',
      icon: '❓'
    },
    { 
      value: 'multi_category', 
      label: 'Több kategóriát érint', 
      description: 'Összetett probléma több területen',
      icon: '🔄'
    },
    { 
      value: 'new_type', 
      label: 'Új típusú probléma', 
      description: 'Korábban nem tapasztalt jelenség',
      icon: '🆕'
    },
    { 
      value: 'complex', 
      label: 'Összetett ügy', 
      description: 'Több lépcsős, hosszú távú megoldás',
      icon: '🧩'
    },
    { 
      value: 'urgent_general', 
      label: 'Sürgős általános ügy', 
      description: 'Gyors reagálást igénylő probléma',
      icon: '⚡'
    },
  ],
};

// Helper functions
export function getSubcategoriesForCategory(category: CategoryType): Subcategory[] {
  return SUBCATEGORIES[category] || [];
}

export function getSubcategoryLabel(category: CategoryType, subcategoryValue: string): string {
  const subcategories = getSubcategoriesForCategory(category);
  const found = subcategories.find(sub => sub.value === subcategoryValue);
  return found?.label || subcategoryValue;
}

export function getSubcategoryIcon(category: CategoryType, subcategoryValue: string): string {
  const subcategories = getSubcategoriesForCategory(category);
  const found = subcategories.find(sub => sub.value === subcategoryValue);
  return found?.icon || '📋';
}

// Recommended departments by category
export const RECOMMENDED_DEPARTMENTS: Record<CategoryType, string[]> = {
  roads: ['public_works', 'utilities'],
  lighting: ['public_works', 'utilities'],
  parks: ['public_works', 'environment'],
  waste: ['public_works', 'environment'],
  traffic: ['traffic', 'public_works'],
  noise: ['administration', 'social'],
  social: ['culture', 'social'],
  grants: ['development', 'administration'],
  transparency: ['administration'],
  other: ['administration'],
};

export function getRecommendedDepartments(category: CategoryType): string[] {
  return RECOMMENDED_DEPARTMENTS[category] || ['administration'];
}
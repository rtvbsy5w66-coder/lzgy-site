// Newsletter category types and interfaces

export enum NewsletterCategory {
  SZAKPOLITIKA = 'SZAKPOLITIKA',
  V_KERULET = 'V_KERULET', 
  POLITIKAI_EDUGAMIFIKACIO = 'POLITIKAI_EDUGAMIFIKACIO',
  EU = 'EU'
}

export enum NewsletterSource {
  CONTACT_FORM = 'CONTACT_FORM',
  PROFILE = 'PROFILE',
  DIRECT = 'DIRECT'
}

export interface NewsletterCategoryInfo {
  id: NewsletterCategory;
  name: string;
  description: string;
  emoji: string;
  frequency: string;
  exampleTopics: string[];
}

export const NEWSLETTER_CATEGORIES: Record<NewsletterCategory, NewsletterCategoryInfo> = {
  [NewsletterCategory.SZAKPOLITIKA]: {
    id: NewsletterCategory.SZAKPOLITIKA,
    name: 'Szakpolitika',
    description: 'Részletes elemzések szakpolitikai kérdésekről: oktatás, egészségügy, gazdaság, környezetvédelem',
    emoji: '📊',
    frequency: 'Hetente 1-2 alkalommal',
    exampleTopics: [
      'Oktatási reformok elemzése',
      'Egészségügyi fejlesztések',
      'Gazdaságpolitikai javaslatok',
      'Környezetvédelmi intézkedések'
    ]
  },
  [NewsletterCategory.V_KERULET]: {
    id: NewsletterCategory.V_KERULET,
    name: 'V. kerület',
    description: 'Helyi hírek, események és fejlesztések a V. kerületből',
    emoji: '🏛️',
    frequency: 'Hetente',
    exampleTopics: [
      'Kerületi önkormányzati hírek',
      'Helyi fejlesztési projektek',
      'Közösségi események',
      'Forgalmi és infrastrukturális változások'
    ]
  },
  [NewsletterCategory.POLITIKAI_EDUGAMIFIKACIO]: {
    id: NewsletterCategory.POLITIKAI_EDUGAMIFIKACIO,
    name: 'Politikai Edugamifikáció',
    description: 'Innovatív módszerek a politikai oktatásban: gamifikáció, interaktív tartalmak, kvízek',
    emoji: '🎮',
    frequency: 'Kéthetente',
    exampleTopics: [
      'Politikai kvízek és játékok',
      'Interaktív oktatási tartalmak',
      'Gamifikációs módszerek',
      'Digitális polgári részvétel'
    ]
  },
  [NewsletterCategory.EU]: {
    id: NewsletterCategory.EU,
    name: 'Európai Unió',
    description: 'EU-s hírek, jogszabályok és magyarországi hatások elemzése',
    emoji: '🇪🇺',
    frequency: 'Hetente',
    exampleTopics: [
      'EU jogszabályok magyarázata',
      'Európai támogatások',
      'Brexit és egyéb EU fejlemények',
      'Magyarország EU-s kapcsolatai'
    ]
  }
};

export interface NewsletterSubscription {
  id: string;
  email: string;
  name: string;
  categories: NewsletterCategory[];
  isActive: boolean;
  subscribedAt: Date;
  lastUpdatedAt: Date;
  unsubscribeToken?: string;
}

export interface NewsletterPreferences {
  [NewsletterCategory.SZAKPOLITIKA]: boolean;
  [NewsletterCategory.V_KERULET]: boolean;
  [NewsletterCategory.POLITIKAI_EDUGAMIFIKACIO]: boolean;
  [NewsletterCategory.EU]: boolean;
}

export interface NewsletterSubscriptionRequest {
  name: string;
  email: string;
  categories: NewsletterCategory[];
  source: NewsletterSource;
}

export interface NewsletterUnsubscribeRequest {
  email: string;
  categories?: NewsletterCategory[]; // If not provided, unsubscribe from all
  unsubscribeAll?: boolean;
}
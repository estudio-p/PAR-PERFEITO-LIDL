export type CardRole = 'feature' | 'benefit';
export type CardThemeRange = 'deluxe' | 'favorina' | 'madeira' | 'quebranozes';

export interface CardPairDef {
  id: number;
  pairName: string;
  range: CardThemeRange;
  rangeName: string;
  featureTitle: string;
  benefitTitle: string;
  featureIcon: string;
  benefitIcon: string;
  storyExplanation: string;
}

export interface GameCard {
  id: string; // e.g. "pair_1_feature"
  pairId: number;
  pairName: string;
  range: CardThemeRange;
  role: CardRole;
  title: string;
  icon: string;
  categoryLabel: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number; // Calculated score based on speed & precision
  timeSeconds: number; // Total seconds taken
  attempts: number; // Total clicks / attempts
  date: string;
  userId?: string;
  userEmail?: string;
  photoURL?: string;
  rgpdConsentMarketing?: boolean;
}

export interface MetricEvent {
  id: string;
  timestamp: string;
  event: string;
  data: Record<string, unknown>;
}

export type GameStatus = 'idle' | 'playing' | 'won';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  rgpdConsentEstudioP: boolean;
  rgpdConsentMarketing: boolean;
  consentTimestamp?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface HistoricalPerson {
  id: string;
  name: string;
  birthDate: string;
  deathDate: string;
  birthPlace: string;
  deathPlace: string;
  birthCoordinates: Coordinates;
  deathCoordinates: Coordinates;
  fameScore?: number;
  wikidataId?: string;
}

export type GuessResult = 'correct' | 'incorrect' | null;

export type HintKey = 'methodOfDeath' | 'gender' | 'profession';

export type ProfessionCategory =
  | 'politician'
  | 'explorer'
  | 'religious-figure'
  | 'entertainer'
  | 'sportsperson'
  | 'writer'
  | 'philosopher'
  | 'royal-family'
  | 'scientist'
  | 'artist'
  | 'military-figure'
  | 'activist'
  | 'revolutionary'
  | 'business-figure'
  | 'criminal-outlaw'
  | 'other';

export interface PersonHints {
  methodOfDeath: string;
  gender: string;
  profession: string;
}

export type RevealedHints = Record<HintKey, boolean>;

export type GameMode = 'practice' | 'daily' | 'easy-daily';

export interface DailyLeaderboardEntry {
  id: string;
  username: string;
  score: number;
  correctGuesses: number;
  remainingHelperActions: number;
  completedAt: string;
}

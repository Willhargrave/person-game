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

export interface PersonHints {
  methodOfDeath: string;
  gender: string;
  profession: string;
}

export type RevealedHints = Record<HintKey, boolean>;

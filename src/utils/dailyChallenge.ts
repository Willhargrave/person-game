import type { DailyLeaderboardEntry, HistoricalPerson, HintKey } from '../types.js';
import type { Language } from '../i18n.js';
import { isObscurePerson } from './people.js';

export type DailyShareMode = 'daily' | 'easy-daily';

export const dailyHelperBonusPoints = 2;
export const dailyInitialChances = 1;

const leaderboardKeyPrefix = 'trace-my-life-daily-leaderboard';

const getSeedForDate = (dateKey: string): number => {
  let hash = 2166136261;

  for (const character of dateKey) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const seededRandom = (seed: number) => {
  let state = seed || 1;

  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return (state >>> 0) / 4294967296;
  };
};

export const getDailyDateKey = (date = new Date()): string => date.toISOString().slice(0, 10);

export interface DailyResetCountdown {
  hours: number;
  minutes: number;
  seconds: number;
}

export const getNextDailyResetAt = (date = new Date()): Date =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );

export const getDailyResetCountdown = (date = new Date()): DailyResetCountdown => {
  const millisecondsUntilReset = Math.max(getNextDailyResetAt(date).getTime() - date.getTime(), 0);
  const totalSeconds = Math.floor(millisecondsUntilReset / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

export const getDailyPeople = (
  people: HistoricalPerson[],
  dateKey = getDailyDateKey(),
): HistoricalPerson[] => {
  const random = seededRandom(getSeedForDate(dateKey));
  const shuffled = people.filter((person) => !isObscurePerson(person));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const currentPerson = shuffled[index];
    const swapPerson = shuffled[swapIndex];

    if (currentPerson && swapPerson) {
      shuffled[index] = swapPerson;
      shuffled[swapIndex] = currentPerson;
    }
  }

  return shuffled;
};

export const getDailyScore = (correctGuesses: number, remainingHelperActions: number): number =>
  correctGuesses + remainingHelperActions * dailyHelperBonusPoints;

export const getRemainingDailyHelperActions = (
  unusedHints: Record<HintKey, boolean>,
): number => Object.values(unusedHints).filter(Boolean).length;

export interface DailyMissOutcome {
  remainingChances: number;
  isGameOver: boolean;
}

export const getDailyMissOutcome = (currentChances: number): DailyMissOutcome => {
  if (currentChances > 0) {
    return {
      remainingChances: currentChances - 1,
      isGameOver: false,
    };
  }

  return {
    remainingChances: 0,
    isGameOver: true,
  };
};

const getLeaderboardKey = (dateKey: string): string => `${leaderboardKeyPrefix}-${dateKey}`;

const isLeaderboardEntry = (value: unknown): value is DailyLeaderboardEntry => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Partial<DailyLeaderboardEntry>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.username === 'string' &&
    typeof entry.score === 'number' &&
    Number.isFinite(entry.score) &&
    typeof entry.correctGuesses === 'number' &&
    Number.isFinite(entry.correctGuesses) &&
    typeof entry.remainingHelperActions === 'number' &&
    Number.isFinite(entry.remainingHelperActions) &&
    typeof entry.completedAt === 'string'
  );
};

export const readDailyLeaderboard = (
  storage: Pick<Storage, 'getItem'>,
  dateKey: string,
): DailyLeaderboardEntry[] => {
  const rawEntries = storage.getItem(getLeaderboardKey(dateKey));

  if (!rawEntries) {
    return [];
  }

  try {
    const parsedEntries = JSON.parse(rawEntries) as unknown;

    if (!Array.isArray(parsedEntries)) {
      return [];
    }

    return parsedEntries.filter(isLeaderboardEntry).sort((firstEntry, secondEntry) => {
      if (secondEntry.score !== firstEntry.score) {
        return secondEntry.score - firstEntry.score;
      }

      return firstEntry.completedAt.localeCompare(secondEntry.completedAt);
    });
  } catch {
    return [];
  }
};

export const saveDailyLeaderboardEntry = (
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  dateKey: string,
  entry: DailyLeaderboardEntry,
): DailyLeaderboardEntry[] => {
  const entries = [...readDailyLeaderboard(storage, dateKey), entry]
    .sort((firstEntry, secondEntry) => {
      if (secondEntry.score !== firstEntry.score) {
        return secondEntry.score - firstEntry.score;
      }

      return firstEntry.completedAt.localeCompare(secondEntry.completedAt);
    })
    .slice(0, 20);

  storage.setItem(getLeaderboardKey(dateKey), JSON.stringify(entries));
  return entries;
};

export const createDailyShareText = (
  entry: DailyLeaderboardEntry,
  dateKey: string,
  siteUrl: string,
  language: Language = 'en',
  mode: DailyShareMode = 'daily',
): string =>
  [
    ...(language === 'ja'
      ? [
        `Trace My Life デイリー ${dateKey}`,
        `スコア: ${entry.score}`,
        ...(mode === 'easy-daily' ? [] : [`正解数: ${entry.correctGuesses}`]),
      ]
      : [
        `Trace My Life Daily ${dateKey}`,
        `Score: ${entry.score}`,
        ...(mode === 'easy-daily' ? [] : [`Correct People: ${entry.correctGuesses}`]),
      ]),
    siteUrl,
  ].join('\n');

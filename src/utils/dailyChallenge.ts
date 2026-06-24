import type { DailyLeaderboardEntry, HistoricalPerson, HintKey } from '../types.js';

export const dailyHelperBonusPoints = 2;
export const dailyInitialLives = 1;

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

export const getDailyPeople = (
  people: HistoricalPerson[],
  dateKey = getDailyDateKey(),
): HistoricalPerson[] => {
  const random = seededRandom(getSeedForDate(dateKey));
  const shuffled = [...people];

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
  remainingLives: number;
  isGameOver: boolean;
}

export const getDailyMissOutcome = (currentLives: number): DailyMissOutcome => {
  if (currentLives > 0) {
    return {
      remainingLives: currentLives - 1,
      isGameOver: false,
    };
  }

  return {
    remainingLives: 0,
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
  totalPeople: number,
): string =>
  [
    `Trace My Life Daily ${dateKey}`,
    `Score: ${entry.score}`,
    `Correct: ${entry.correctGuesses}/${totalPeople}`,
    `Helpers saved: ${entry.remainingHelperActions}`,
  ].join('\n');

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DailyLeaderboardEntry, HistoricalPerson, RevealedHints } from '../types.js';
import {
  createDailyShareText,
  getDailyPeople,
  getDailyMissOutcome,
  getDailyScore,
  getRemainingDailyHelperActions,
  readDailyLeaderboard,
  saveDailyLeaderboardEntry,
} from './dailyChallenge.js';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const people: HistoricalPerson[] = [
  {
    id: 'ada-lovelace',
    name: 'Ada Lovelace',
    birthDate: '1815',
    deathDate: '1852',
    birthPlace: 'London, England',
    deathPlace: 'London, England',
    birthCoordinates: { lat: 51.5072, lng: -0.1276 },
    deathCoordinates: { lat: 51.5072, lng: -0.1276 },
  },
  {
    id: 'ibn-sina',
    name: 'Ibn Sina',
    birthDate: '980',
    deathDate: '1037',
    birthPlace: 'Afshona, Uzbekistan',
    deathPlace: 'Hamadan, Iran',
    birthCoordinates: { lat: 39.77, lng: 64.42 },
    deathCoordinates: { lat: 34.8, lng: 48.52 },
  },
  {
    id: 'frida-kahlo',
    name: 'Frida Kahlo',
    birthDate: '1907',
    deathDate: '1954',
    birthPlace: 'Coyoacan, Mexico',
    deathPlace: 'Coyoacan, Mexico',
    birthCoordinates: { lat: 19.35, lng: -99.16 },
    deathCoordinates: { lat: 19.35, lng: -99.16 },
  },
];

const makeEntry = (
  id: string,
  score: number,
  completedAt: string,
): DailyLeaderboardEntry => ({
  id,
  username: id,
  score,
  correctGuesses: score,
  remainingHelperActions: 0,
  completedAt,
});

describe('daily challenge utilities', () => {
  it('creates a stable daily order for the same date', () => {
    const firstOrder = getDailyPeople(people, '2026-06-23').map((person) => person.id);
    const secondOrder = getDailyPeople(people, '2026-06-23').map((person) => person.id);

    assert.deepEqual(firstOrder, secondOrder);
    assert.deepEqual(firstOrder.sort(), people.map((person) => person.id).sort());
  });

  it('scores correct guesses plus saved helper actions', () => {
    const unusedHints: RevealedHints = {
      methodOfDeath: true,
      gender: false,
      profession: true,
    };

    assert.equal(getRemainingDailyHelperActions(unusedHints), 2);
    assert.equal(getDailyScore(4, 2), 8);
  });

  it('uses a life before ending the daily run', () => {
    assert.deepEqual(getDailyMissOutcome(1), {
      remainingLives: 0,
      isGameOver: false,
    });
    assert.deepEqual(getDailyMissOutcome(0), {
      remainingLives: 0,
      isGameOver: true,
    });
  });

  it('sorts and filters leaderboard entries', () => {
    const storage = new MemoryStorage();
    const olderHighScore = makeEntry('older', 12, '2026-06-23T10:00:00.000Z');
    const newerHighScore = makeEntry('newer', 12, '2026-06-23T11:00:00.000Z');
    const lowerScore = makeEntry('lower', 5, '2026-06-23T09:00:00.000Z');

    storage.setItem(
      'trace-my-life-daily-leaderboard-2026-06-23',
      JSON.stringify([lowerScore, { bad: 'entry' }, newerHighScore, olderHighScore]),
    );

    assert.deepEqual(
      readDailyLeaderboard(storage, '2026-06-23').map((entry) => entry.id),
      ['older', 'newer', 'lower'],
    );
  });

  it('saves a leaderboard entry and produces share text', () => {
    const storage = new MemoryStorage();
    const entry = makeEntry('player', 7, '2026-06-23T10:00:00.000Z');
    const leaderboard = saveDailyLeaderboardEntry(storage, '2026-06-23', entry);

    assert.equal(leaderboard[0]?.id, 'player');
    assert.match(createDailyShareText(entry, '2026-06-23', 20), /Score: 7/);
  });
});

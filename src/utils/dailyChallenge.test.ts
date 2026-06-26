import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DailyLeaderboardEntry, HistoricalPerson, RevealedHints } from '../types.js';
import {
  createDailyShareText,
  getDailyResetCountdown,
  getDailyPeople,
  getDailyMissOutcome,
  getNextDailyResetAt,
  getDailyScore,
  getRemainingDailyHelperActions,
  readDailyCompletion,
  readDailyLeaderboard,
  saveDailyLeaderboardEntry,
  saveDailyCompletion,
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
  {
    id: 'shane-warne',
    name: 'Shane Warne',
    birthDate: '1969',
    deathDate: '2022',
    birthPlace: 'Upper Ferntree Gully, Australia',
    deathPlace: 'Koh Samui, Thailand',
    birthCoordinates: { lat: -37.9, lng: 145.3 },
    deathCoordinates: { lat: 9.5, lng: 100.0 },
  },
];

const makeEntry = (
  id: string,
  score: number,
  completedAt: string,
  roundResults: DailyLeaderboardEntry['roundResults'] = ['correct', 'correct', 'missed'],
): DailyLeaderboardEntry => ({
  id,
  username: id,
  score,
  correctGuesses: score,
  remainingHelperActions: 0,
  completedAt,
  roundResults,
});

describe('daily challenge utilities', () => {
  it('creates a stable daily order for the same date', () => {
    const firstOrder = getDailyPeople(people, '2026-06-23').map((person) => person.id);
    const secondOrder = getDailyPeople(people, '2026-06-23').map((person) => person.id);

    assert.deepEqual(firstOrder, secondOrder);
    assert.deepEqual([...firstOrder].sort(), ['frida-kahlo', 'ibn-sina']);
  });

  it('removes obscure people from the daily order before shuffling', () => {
    const dailyOrder = getDailyPeople(people, '2026-06-23').map((person) => person.id);

    assert.deepEqual(dailyOrder.includes('shane-warne'), false);
  });

  it('resets the daily challenge at midnight UTC', () => {
    assert.equal(
      getNextDailyResetAt(new Date('2026-06-25T23:59:58.000Z')).toISOString(),
      '2026-06-26T00:00:00.000Z',
    );
    assert.deepEqual(getDailyResetCountdown(new Date('2026-06-25T22:58:57.000Z')), {
      hours: 1,
      minutes: 1,
      seconds: 3,
    });
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

  it('scores easy daily without helper bonuses', () => {
    assert.equal(getDailyScore(4, 0), 4);
  });

  it('uses a chance before ending the daily run', () => {
    assert.deepEqual(getDailyMissOutcome(1), {
      remainingChances: 0,
      isGameOver: false,
    });
    assert.deepEqual(getDailyMissOutcome(0), {
      remainingChances: 0,
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

    const shareText = createDailyShareText(
      entry,
      '2026-06-23',
      'https://person-game-iota.vercel.app/',
    );

    assert.equal(leaderboard[0]?.id, 'player');
    assert.equal(
      shareText,
      [
        'Trace My Life Daily 2026-06-23',
        'Score: 7',
        '🟩🟩🟥',
        'Correct People: 7',
        'https://person-game-iota.vercel.app/',
      ].join('\n'),
    );
    assert.doesNotMatch(shareText, /Helpers saved/);
    assert.doesNotMatch(shareText, /Correct: 7\/20/);
  });

  it('produces Japanese share text', () => {
    const entry = makeEntry('player', 7, '2026-06-23T10:00:00.000Z');

    assert.equal(
      createDailyShareText(entry, '2026-06-23', 'https://person-game-iota.vercel.app/', 'ja'),
      [
        'Trace My Life デイリー 2026-06-23',
        'スコア: 7',
        '🟩🟩🟥',
        '正解数: 7',
        'https://person-game-iota.vercel.app/',
      ].join('\n'),
    );
  });

  it('produces shorter easy daily share text without correct people', () => {
    const entry = makeEntry('player', 7, '2026-06-25T10:00:00.000Z');

    assert.equal(
      createDailyShareText(
        entry,
        '2026-06-25',
        'https://person-game-iota.vercel.app/',
        'en',
        'easy-daily',
      ),
      [
        'Trace My Life Daily 2026-06-25',
        'Score: 7',
        '🟩🟩🟥',
        'https://person-game-iota.vercel.app/',
      ].join('\n'),
    );
  });

  it('keeps old share text shape when no round results were stored', () => {
    const entry = makeEntry('player', 7, '2026-06-25T10:00:00.000Z');
    delete entry.roundResults;

    assert.equal(
      createDailyShareText(
        entry,
        '2026-06-25',
        'https://person-game-iota.vercel.app/',
        'en',
        'easy-daily',
      ),
      [
        'Trace My Life Daily 2026-06-25',
        'Score: 7',
        'https://person-game-iota.vercel.app/',
      ].join('\n'),
    );
  });

  it('stores one daily completion record for the date', () => {
    const storage = new MemoryStorage();
    const completion = saveDailyCompletion(storage, {
      dateKey: '2026-06-25',
      mode: 'easy-daily',
      score: 4,
      correctGuesses: 4,
      remainingHelperActions: 0,
      completedAt: '2026-06-25T10:00:00.000Z',
    });

    assert.deepEqual(readDailyCompletion(storage, '2026-06-25'), completion);
  });

  it('replaces the daily completion record if another mode is saved for the same date', () => {
    const storage = new MemoryStorage();
    saveDailyCompletion(storage, {
      dateKey: '2026-06-25',
      mode: 'easy-daily',
      score: 4,
      correctGuesses: 4,
      remainingHelperActions: 0,
      completedAt: '2026-06-25T10:00:00.000Z',
    });
    const hardCompletion = saveDailyCompletion(storage, {
      dateKey: '2026-06-25',
      mode: 'daily',
      score: 8,
      correctGuesses: 4,
      remainingHelperActions: 2,
      completedAt: '2026-06-25T11:00:00.000Z',
    });

    assert.deepEqual(readDailyCompletion(storage, '2026-06-25'), hardCompletion);
  });

  it('ignores malformed and old completion records', () => {
    const storage = new MemoryStorage();
    storage.setItem('trace-my-life-daily-completion-2026-06-25', JSON.stringify({ bad: true }));
    saveDailyCompletion(storage, {
      dateKey: '2026-06-24',
      mode: 'easy-daily',
      score: 4,
      correctGuesses: 4,
      remainingHelperActions: 0,
      completedAt: '2026-06-24T10:00:00.000Z',
    });

    assert.equal(readDailyCompletion(storage, '2026-06-25'), null);
  });
});

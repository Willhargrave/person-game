import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  arcadeInitialChances,
  getArcadeChancesAfterScore,
  getArcadeEarnedChances,
  getArcadeMissOutcome,
} from './arcade.js';

describe('arcade utilities', () => {
  it('starts Arcade with one extra chance', () => {
    assert.equal(arcadeInitialChances, 1);
  });

  it('earns one extra chance for every 15 points', () => {
    assert.equal(getArcadeEarnedChances(0), 0);
    assert.equal(getArcadeEarnedChances(14), 0);
    assert.equal(getArcadeEarnedChances(15), 1);
    assert.equal(getArcadeEarnedChances(30), 2);
  });

  it('adds only newly crossed chance thresholds after scoring', () => {
    assert.equal(getArcadeChancesAfterScore(10, 15, 1), 2);
    assert.equal(getArcadeChancesAfterScore(15, 20, 2), 2);
    assert.equal(getArcadeChancesAfterScore(29, 34, 0), 1);
  });

  it('uses available chances before ending the Arcade run', () => {
    assert.deepEqual(getArcadeMissOutcome(1), {
      remainingChances: 0,
      isGameOver: false,
    });
    assert.deepEqual(getArcadeMissOutcome(0), {
      remainingChances: 0,
      isGameOver: true,
    });
  });
});

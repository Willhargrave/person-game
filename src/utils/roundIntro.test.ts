import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getRoutePointAtProgress,
  isRoundIntroReady,
  roundIntroDeathHoldMs,
  roundIntroOverviewDurationMs,
  roundIntroRouteDurationMs,
  roundIntroSettleMs,
  roundIntroSteps,
} from './roundIntro.js';

describe('round intro sequence', () => {
  it('loads birth, route, death, then ready in order', () => {
    assert.deepEqual(
      roundIntroSteps.map((step) => step.stage),
      ['birth', 'route', 'death', 'overview', 'settle', 'ready'],
    );
  });

  it('only enables guessing when the intro is ready', () => {
    assert.equal(isRoundIntroReady('birth'), false);
    assert.equal(isRoundIntroReady('route'), false);
    assert.equal(isRoundIntroReady('death'), false);
    assert.equal(isRoundIntroReady('overview'), false);
    assert.equal(isRoundIntroReady('settle'), false);
    assert.equal(isRoundIntroReady('ready'), true);
  });

  it('leaves enough time between each reveal', () => {
    assert.deepEqual(
      roundIntroSteps.map((step) => step.delayMs),
      [1500, 2000, 1800, 1800, 250, 0],
    );
    assert.equal(roundIntroSteps[1]?.delayMs, roundIntroRouteDurationMs);
    assert.equal(roundIntroSteps[2]?.delayMs, roundIntroDeathHoldMs);
    assert.equal(roundIntroSteps[3]?.delayMs, roundIntroOverviewDurationMs);
    assert.equal(roundIntroSteps[4]?.delayMs, roundIntroSettleMs);
  });

  it('calculates the route-follow camera position', () => {
    assert.deepEqual(
      getRoutePointAtProgress({ lat: 10, lng: 20 }, { lat: 30, lng: 60 }, 0.5),
      { lat: 20, lng: 40 },
    );
  });

  it('keeps route-follow progress inside the route endpoints', () => {
    assert.deepEqual(
      getRoutePointAtProgress({ lat: 10, lng: 20 }, { lat: 30, lng: 60 }, -1),
      { lat: 10, lng: 20 },
    );
    assert.deepEqual(
      getRoutePointAtProgress({ lat: 10, lng: 20 }, { lat: 30, lng: 60 }, 2),
      { lat: 30, lng: 60 },
    );
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getRoutePointAtProgress,
  isRoundIntroReady,
  roundIntroRouteDurationMs,
  roundIntroSteps,
} from './roundIntro.js';

describe('round intro sequence', () => {
  it('loads birth, route, death, then ready in order', () => {
    assert.deepEqual(
      roundIntroSteps.map((step) => step.stage),
      ['birth', 'route', 'death', 'ready'],
    );
  });

  it('only enables guessing when the intro is ready', () => {
    assert.equal(isRoundIntroReady('birth'), false);
    assert.equal(isRoundIntroReady('route'), false);
    assert.equal(isRoundIntroReady('death'), false);
    assert.equal(isRoundIntroReady('ready'), true);
  });

  it('leaves enough time between each reveal', () => {
    assert.deepEqual(
      roundIntroSteps.map((step) => step.delayMs),
      [1500, 2000, 1600, 0],
    );
    assert.equal(roundIntroSteps[1]?.delayMs, roundIntroRouteDurationMs);
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

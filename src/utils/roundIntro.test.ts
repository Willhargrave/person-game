import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isRoundIntroReady, roundIntroSteps } from './roundIntro.js';

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
  });
});

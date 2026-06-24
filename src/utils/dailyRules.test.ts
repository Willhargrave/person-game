import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { dailyRulesItems, dailyRulesTitle } from './dailyRules.js';

describe('daily rules copy', () => {
  it('matches the concise rules explanation', () => {
    assert.equal(dailyRulesTitle, 'Rules');
    assert.deepEqual(
      dailyRulesItems.map((item) => item.text),
      [
        'Guess the famous figure from their birth and death locations.',
        'Reveal gender, cause of death, or profession if you need help.',
        'Each reveal can only be used once per Daily game.',
        'You start with one extra life.',
        'After that life is lost, one more wrong guess ends the game.',
        'Each unused reveal is worth 2 bonus points at the end.',
      ],
    );
  });

  it('includes helper icons for the reveal rule', () => {
    assert.deepEqual(dailyRulesItems[1]?.helperIcons, [
      { icon: '☠', label: 'Cause of death reveal' },
      { icon: '⚧', label: 'Gender reveal' },
      { icon: '⚒', label: 'Profession reveal' },
    ]);
  });
});

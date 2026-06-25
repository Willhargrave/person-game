import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { dailyRulesItems, dailyRulesTitle, getDailyRulesItems } from './dailyRules.js';

describe('daily rules copy', () => {
  it('matches the concise rules explanation', () => {
    assert.equal(dailyRulesTitle, 'Rules');
    assert.deepEqual(
      getDailyRulesItems('daily').map((item) => item.text),
      [
        'Guess the famous figure from their birth and death locations.',
        'Reveal gender, cause of death, or profession if you need help.',
        'Each reveal can only be used once per Daily game.',
        'You start with one extra chance.',
        'After that chance is used, one more wrong guess ends the game.',
        'Each unused reveal is worth 2 bonus points at the end.',
      ],
    );
    assert.deepEqual(dailyRulesItems, getDailyRulesItems('daily'));
  });

  it('removes helper action instructions for easy daily', () => {
    assert.deepEqual(
      getDailyRulesItems('easy-daily').map((item) => item.text),
      [
        'Guess the famous figure from their birth and death locations.',
        'Gender, cause of death, and profession are revealed from the start.',
        'You start with one extra chance.',
        'After that chance is used, one more wrong guess ends the game.',
      ],
    );
    assert.equal(
      getDailyRulesItems('easy-daily').some((item) => item.text.includes('unused reveal')),
      false,
    );
    assert.equal(
      getDailyRulesItems('easy-daily').some((item) => item.text.includes('Reveal gender')),
      false,
    );
  });

  it('includes helper icons for the reveal rule', () => {
    assert.deepEqual(getDailyRulesItems('daily')[1]?.helperIcons, [
      { icon: '☠', label: 'Cause of death reveal' },
      { icon: '⚧', label: 'Gender reveal' },
      { icon: '⚒', label: 'Profession reveal' },
    ]);
    assert.deepEqual(getDailyRulesItems('easy-daily')[1]?.helperIcons, [
      { icon: '☠', label: 'Cause of death reveal' },
      { icon: '⚧', label: 'Gender reveal' },
      { icon: '⚒', label: 'Profession reveal' },
    ]);
  });

  it('includes the chance icon for chance rules', () => {
    assert.deepEqual(getDailyRulesItems('daily')[3]?.chanceIcon, {
      icon: '◆',
      label: 'Chance',
    });
    assert.deepEqual(getDailyRulesItems('daily')[4]?.chanceIcon, {
      icon: '◆',
      label: 'Chance',
    });
    assert.deepEqual(getDailyRulesItems('easy-daily')[2]?.chanceIcon, {
      icon: '◆',
      label: 'Chance',
    });
    assert.deepEqual(getDailyRulesItems('easy-daily')[3]?.chanceIcon, {
      icon: '◆',
      label: 'Chance',
    });
  });
});

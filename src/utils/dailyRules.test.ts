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
        'You also get clues based on their cause of death, gender and profession.',
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

  it('returns Japanese daily rules copy', () => {
    assert.deepEqual(
      getDailyRulesItems('easy-daily', 'ja').map((item) => item.text),
      [
        '出生地と死没地から有名人を当てます。',
        'さらに、死因・性別・職業に関する手がかりも表示されます。',
        '追加で1回だけ間違えられるチャンスがあります。',
        'そのチャンスを使った後、もう一度間違えると終了です。',
      ],
    );
  });

  it('includes helper icons for the reveal rule', () => {
    assert.deepEqual(getDailyRulesItems('daily')[1]?.helperIcons, [
      { icon: '☠', label: 'Cause of death reveal' },
      { icon: '⚧', label: 'Gender reveal' },
      { icon: '⚒', label: 'Profession reveal' },
    ]);
    assert.equal(getDailyRulesItems('easy-daily')[1]?.helperIcons, undefined);
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

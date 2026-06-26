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

  it('returns arcade rules copy', () => {
    assert.deepEqual(
      getDailyRulesItems('arcade').map((item) => item.text),
      [
        'Guess the famous figure from their birth and death locations.',
        'Reveal gender, cause of death, or profession if you need help.',
        'You get more points for using fewer reveals.',
        '0 reveals used: 5 points',
        '1 reveal used: 3 points',
        '2 reveals used: 2 points',
        '3 reveals used: 1 point',
        'You start with one extra chance.',
        'Every 15 points earns one extra chance.',
        'Arcade has no daily limit, so you can keep playing.',
      ],
    );
  });

  it('returns Japanese arcade rules copy', () => {
    assert.deepEqual(
      getDailyRulesItems('arcade', 'ja').map((item) => item.text),
      [
        '出生地と死没地から有名人を当てます。',
        '困ったときは性別、死因、職業を表示できます。',
        '表示を少なく使うほど高得点になります。',
        '表示0回: 5点',
        '表示1回: 3点',
        '表示2回: 2点',
        '表示3回: 1点',
        '追加で1回だけ間違えられるチャンスがあります。',
        '15点ごとに追加チャンスを1回獲得します。',
        'アーケードにデイリー制限はないので、続けて遊べます。',
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
    assert.deepEqual(getDailyRulesItems('arcade')[7]?.chanceIcon, {
      icon: '◆',
      label: 'Chance',
    });
    assert.deepEqual(getDailyRulesItems('arcade')[8]?.chanceIcon, {
      icon: '◆',
      label: 'Chance',
    });
  });
});

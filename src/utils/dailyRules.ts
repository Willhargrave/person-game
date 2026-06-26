import type { Language } from '../i18n.js';

export const dailyRulesTitle = 'Rules';

export type DailyRulesMode = 'daily' | 'easy-daily' | 'practice';

export interface DailyRulesItem {
  text: string;
  helperIcons?: Array<{
    icon: string;
    label: string;
  }>;
  chanceIcon?: {
    icon: string;
    label: string;
  };
}

const rulesCopy = {
  en: {
    helperIcons: [
      { icon: '☠', label: 'Cause of death reveal' },
      { icon: '⚧', label: 'Gender reveal' },
      { icon: '⚒', label: 'Profession reveal' },
    ],
    chanceIcon: { icon: '◆', label: 'Chance' },
    base: [
      'Guess the famous figure from their birth and death locations.',
      'You start with one extra chance.',
      'After that chance is used, one more wrong guess ends the game.',
    ],
    standard: [
      'Reveal gender, cause of death, or profession if you need help.',
      'Each reveal can only be used once per Daily game.',
      'Each unused reveal is worth 2 bonus points at the end.',
    ],
    easy: 'You also get clues based on their cause of death, gender and profession.',
    practice: [
      'Guess the famous figure from their birth and death locations.',
      'Reveal gender, cause of death, or profession if you need help.',
      'You get more points for using fewer reveals.',
      '0 reveals used: 5 points',
      '1 reveal used: 3 points',
      '2 reveals used: 2 points',
      '3 reveals used: 1 point',
      'Practice has no daily limit, so you can keep playing.',
    ],
  },
  ja: {
    helperIcons: [
      { icon: '☠', label: '死因表示' },
      { icon: '⚧', label: '性別表示' },
      { icon: '⚒', label: '職業表示' },
    ],
    chanceIcon: { icon: '◆', label: 'チャンス' },
    base: [
      '出生地と死没地から有名人を当てます。',
      '追加で1回だけ間違えられるチャンスがあります。',
      'そのチャンスを使った後、もう一度間違えると終了です。',
    ],
    standard: [
      '困ったときは性別、死因、職業を表示できます。',
      '各表示はデイリー中に一度だけ使えます。',
      '未使用の表示は終了時に各2点のボーナスになります。',
    ],
    easy: 'さらに、死因・性別・職業に関する手がかりも表示されます。',
    practice: [
      '出生地と死没地から有名人を当てます。',
      '困ったときは性別、死因、職業を表示できます。',
      '表示を少なく使うほど高得点になります。',
      '表示0回: 5点',
      '表示1回: 3点',
      '表示2回: 2点',
      '表示3回: 1点',
      '練習モードにデイリー制限はないので、続けて遊べます。',
    ],
  },
} satisfies Record<Language, {
  helperIcons: NonNullable<DailyRulesItem['helperIcons']>;
  chanceIcon: NonNullable<DailyRulesItem['chanceIcon']>;
  base: string[];
  standard: string[];
  easy: string;
  practice: string[];
}>;

export const getDailyRulesItems = (
  mode: DailyRulesMode,
  language: Language = 'en',
): DailyRulesItem[] => {
  const copy = rulesCopy[language];

  if (mode === 'practice') {
    return copy.practice.map((text) => ({ text }));
  }

  const baseDailyRulesItems: DailyRulesItem[] = [
    { text: copy.base[0] ?? '' },
    { text: copy.base[1] ?? '', chanceIcon: copy.chanceIcon },
    { text: copy.base[2] ?? '', chanceIcon: copy.chanceIcon },
  ];

  if (mode === 'easy-daily') {
    return [
      baseDailyRulesItems[0],
      { text: copy.easy },
      baseDailyRulesItems[1],
      baseDailyRulesItems[2],
    ].filter((item): item is DailyRulesItem => Boolean(item));
  }

  return [
    baseDailyRulesItems[0],
    { text: copy.standard[0] ?? '', helperIcons: copy.helperIcons },
    { text: copy.standard[1] ?? '' },
    baseDailyRulesItems[1],
    baseDailyRulesItems[2],
    { text: copy.standard[2] ?? '' },
  ].filter((item): item is DailyRulesItem => Boolean(item));
};

export const dailyRulesItems = getDailyRulesItems('daily');

import type { Language } from '../i18n.js';

export const dailyRulesTitle = 'Rules';

export type DailyRulesMode = 'daily' | 'easy-daily';

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
  },
} satisfies Record<Language, {
  helperIcons: NonNullable<DailyRulesItem['helperIcons']>;
  chanceIcon: NonNullable<DailyRulesItem['chanceIcon']>;
  base: string[];
  standard: string[];
  easy: string;
}>;

export const getDailyRulesItems = (
  mode: DailyRulesMode,
  language: Language = 'en',
): DailyRulesItem[] => {
  const copy = rulesCopy[language];
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

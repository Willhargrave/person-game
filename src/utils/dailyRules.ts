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

const helperIcons = [
  { icon: '☠', label: 'Cause of death reveal' },
  { icon: '⚧', label: 'Gender reveal' },
  { icon: '⚒', label: 'Profession reveal' },
];

const chanceIcon = { icon: '◆', label: 'Chance' };

const baseDailyRulesItems: DailyRulesItem[] = [
  {
    text: 'Guess the famous figure from their birth and death locations.',
  },
  {
    text: 'You start with one extra chance.',
    chanceIcon,
  },
  {
    text: 'After that chance is used, one more wrong guess ends the game.',
    chanceIcon,
  },
];

const standardDailyHelperRules: DailyRulesItem[] = [
  {
    text: 'Reveal gender, cause of death, or profession if you need help.',
    helperIcons,
  },
  {
    text: 'Each reveal can only be used once per Daily game.',
  },
];

const standardDailyBonusRule: DailyRulesItem = {
  text: 'Each unused reveal is worth 2 bonus points at the end.',
};

const easyDailyHelperRules: DailyRulesItem[] = [
  {
    text: 'Gender, cause of death, and profession are revealed from the start.',
    helperIcons,
  },
];

export const getDailyRulesItems = (mode: DailyRulesMode): DailyRulesItem[] => {
  if (mode === 'easy-daily') {
    return [
      baseDailyRulesItems[0],
      ...easyDailyHelperRules,
      baseDailyRulesItems[1],
      baseDailyRulesItems[2],
    ].filter((item): item is DailyRulesItem => Boolean(item));
  }

  return [
    baseDailyRulesItems[0],
    ...standardDailyHelperRules,
    baseDailyRulesItems[1],
    baseDailyRulesItems[2],
    standardDailyBonusRule,
  ].filter((item): item is DailyRulesItem => Boolean(item));
};

export const dailyRulesItems = getDailyRulesItems('daily');

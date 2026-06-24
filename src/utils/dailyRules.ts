export const dailyRulesTitle = 'Rules';

export interface DailyRulesItem {
  text: string;
  helperIcons?: Array<{
    icon: string;
    label: string;
  }>;
}

export const dailyRulesItems: DailyRulesItem[] = [
  {
    text: 'Guess the famous figure from their birth and death locations.',
  },
  {
    text: 'Reveal gender, cause of death, or profession if you need help.',
    helperIcons: [
      { icon: '☠', label: 'Cause of death reveal' },
      { icon: '⚧', label: 'Gender reveal' },
      { icon: '⚒', label: 'Profession reveal' },
    ],
  },
  {
    text: 'Each reveal can only be used once per Daily game.',
  },
  {
    text: 'You start with one extra life.',
  },
  {
    text: 'After that life is lost, one more wrong guess ends the game.',
  },
  {
    text: 'Each unused reveal is worth 2 bonus points at the end.',
  },
];

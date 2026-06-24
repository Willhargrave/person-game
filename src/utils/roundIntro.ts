export type RoundIntroStage = 'birth' | 'route' | 'death' | 'ready';

export interface RoundIntroStep {
  stage: RoundIntroStage;
  delayMs: number;
}

export const roundIntroSteps: RoundIntroStep[] = [
  { stage: 'birth', delayMs: 1500 },
  { stage: 'route', delayMs: 2000 },
  { stage: 'death', delayMs: 1600 },
  { stage: 'ready', delayMs: 0 },
];

export const isRoundIntroReady = (stage: RoundIntroStage): boolean => stage === 'ready';

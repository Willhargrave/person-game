export type RoundIntroStage = 'birth' | 'route' | 'death' | 'overview' | 'settle' | 'ready';

export interface RoundIntroStep {
  stage: RoundIntroStage;
  delayMs: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export const roundIntroRouteDurationMs = 2000;
export const roundIntroDeathHoldMs = 1800;
export const roundIntroOverviewDurationMs = 1800;
export const roundIntroSettleMs = 250;

export const roundIntroSteps: RoundIntroStep[] = [
  { stage: 'birth', delayMs: 1500 },
  { stage: 'route', delayMs: roundIntroRouteDurationMs },
  { stage: 'death', delayMs: roundIntroDeathHoldMs },
  { stage: 'overview', delayMs: roundIntroOverviewDurationMs },
  { stage: 'settle', delayMs: roundIntroSettleMs },
  { stage: 'ready', delayMs: 0 },
];

export const isRoundIntroReady = (stage: RoundIntroStage): boolean => stage === 'ready';

export const getRoutePointAtProgress = (
  startPoint: RoutePoint,
  endPoint: RoutePoint,
  progress: number,
): RoutePoint => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return {
    lat: startPoint.lat + (endPoint.lat - startPoint.lat) * clampedProgress,
    lng: startPoint.lng + (endPoint.lng - startPoint.lng) * clampedProgress,
  };
};

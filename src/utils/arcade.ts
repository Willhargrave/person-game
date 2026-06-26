export const arcadeInitialChances = 1;
export const arcadePointsPerBonusChance = 15;

export interface ArcadeMissOutcome {
  remainingChances: number;
  isGameOver: boolean;
}

export const getArcadeEarnedChances = (score: number): number =>
  Math.max(0, Math.floor(score / arcadePointsPerBonusChance));

export const getArcadeChancesAfterScore = (
  currentScore: number,
  nextScore: number,
  currentChances: number,
): number => {
  const currentEarnedChances = getArcadeEarnedChances(currentScore);
  const nextEarnedChances = getArcadeEarnedChances(nextScore);

  return currentChances + Math.max(0, nextEarnedChances - currentEarnedChances);
};

export const getArcadeMissOutcome = (currentChances: number): ArcadeMissOutcome => {
  if (currentChances > 0) {
    return {
      remainingChances: currentChances - 1,
      isGameOver: false,
    };
  }

  return {
    remainingChances: 0,
    isGameOver: true,
  };
};

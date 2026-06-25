import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import { GameMap } from './components/GameMap';
import { DailyRulesCard } from './components/DailyRulesCard';
import { GuessPanel } from './components/GuessPanel';
import { PersonInfo } from './components/PersonInfo';
import { ResultPanel } from './components/ResultPanel';
import peopleData from './data/historicalPeople.json';
import { fallbackHints, personHints } from './data/personHints';
import {
  getLocalizedClueHints,
  getLocalizedHints,
  getLocalizedPerson,
  getUiCopy,
  isLanguage,
  type Language,
} from './i18n';
import type {
  DailyLeaderboardEntry,
  GameMode,
  GuessResult,
  HintKey,
  HistoricalPerson,
  RevealedHints,
} from './types';
import {
  createDailyShareText,
  dailyInitialChances,
  type DailyCompletionRecord,
  type DailyShareMode,
  getDailyDateKey,
  getDailyMissOutcome,
  getDailyPeople,
  getDailyResetCountdown,
  getDailyScore,
  getRemainingDailyHelperActions,
  readDailyCompletion,
  readDailyLeaderboard,
  saveDailyCompletion,
  saveDailyLeaderboardEntry,
} from './utils/dailyChallenge';
import { getDailyRulesItems } from './utils/dailyRules';
import { getValidPeople, isCorrectGuess, pickPracticePerson } from './utils/people';
import {
  isRoundIntroReady,
  getNextRoundIntroStage,
  roundIntroSteps,
  type RoundIntroStage,
} from './utils/roundIntro';

const initialRevealedHints: RevealedHints = {
  methodOfDeath: false,
  gender: false,
  profession: false,
};

const initialDailyUnusedHints: RevealedHints = {
  methodOfDeath: true,
  gender: true,
  profession: true,
};

const allHintsRevealed: RevealedHints = {
  methodOfDeath: true,
  gender: true,
  profession: true,
};

const noDailyHelperActions: RevealedHints = {
  methodOfDeath: false,
  gender: false,
  profession: false,
};

const dailyHelperIcons: Array<{ hint: HintKey; icon: string; label: string }> = [
  { hint: 'methodOfDeath', icon: '☠', label: 'Cause of death helper' },
  { hint: 'gender', icon: '⚧', label: 'Gender helper' },
  { hint: 'profession', icon: '⚒', label: 'Profession helper' },
];

const dailyChanceIcon = '◆';
const fallbackShareUrl = 'https://person-game-iota.vercel.app/';

const getShareUrl = () => {
  if (window.location.origin) {
    return `${window.location.origin}/`;
  }

  return fallbackShareUrl;
};

const getPointsForHintCount = (hintCount: number) => {
  if (hintCount === 0) {
    return 5;
  }

  if (hintCount === 1) {
    return 3;
  }

  if (hintCount === 2) {
    return 2;
  }

  return 1;
};

const revealDelayMs = 450;
const languageStorageKey = 'trace-my-life-language';

const getEntryId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

interface DailyFinalStats {
  score: number;
  correctGuesses: number;
  remainingHelperActions: number;
  completedAt: string;
}

function App() {
  const people = useMemo(() => getValidPeople(peopleData), []);
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const savedLanguage = window.localStorage.getItem(languageStorageKey);
    return isLanguage(savedLanguage) ? savedLanguage : 'en';
  });
  const dailyDateKey = useMemo(() => getDailyDateKey(), []);
  const dailyPeople = useMemo(() => getDailyPeople(people, dailyDateKey), [dailyDateKey, people]);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [username, setUsername] = useState('');
  const [person, setPerson] = useState<HistoricalPerson | null>(null);
  const [usedPersonIds, setUsedPersonIds] = useState<string[]>([]);
  const [dailyRoundIndex, setDailyRoundIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [submittedGuess, setSubmittedGuess] = useState('');
  const [result, setResult] = useState<GuessResult>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [dailyCorrectGuesses, setDailyCorrectGuesses] = useState(0);
  const [dailyChances, setDailyChances] = useState(dailyInitialChances);
  const [dailyUnusedHints, setDailyUnusedHints] = useState<RevealedHints>(initialDailyUnusedHints);
  const [isDailyGameOver, setIsDailyGameOver] = useState(false);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<DailyLeaderboardEntry[]>([]);
  const [dailyEntry, setDailyEntry] = useState<DailyLeaderboardEntry | null>(null);
  const [dailyFinalStats, setDailyFinalStats] = useState<DailyFinalStats | null>(null);
  const [dailyEndReason, setDailyEndReason] = useState<string | null>(null);
  const [isDailyRulesOpen, setIsDailyRulesOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [chanceNotice, setChanceNotice] = useState<string | null>(null);
  const [dailyCountdownNow, setDailyCountdownNow] = useState(() => new Date());
  const [revealedHints, setRevealedHints] = useState<RevealedHints>(initialRevealedHints);
  const [isRevealLoading, setIsRevealLoading] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [roundIntroStage, setRoundIntroStage] = useState<RoundIntroStage>('ready');
  const revealTimerRef = useRef<number | null>(null);
  const roundIntroTimerRef = useRef<number | null>(null);

  const malformedCount = Array.isArray(peopleData) ? peopleData.length - people.length : 0;
  const copy = getUiCopy(language);
  const currentHints = person ? (personHints[person.id] ?? fallbackHints) : fallbackHints;
  const currentLocalizedHints = getLocalizedHints(currentHints, language);
  const currentLocalizedClueHints = getLocalizedClueHints(currentHints, language, person?.id);
  const currentLocalizedPerson = person ? getLocalizedPerson(person, language) : null;
  const revealedHintCount = Object.values(revealedHints).filter(Boolean).length;
  const isDailyMode = mode === 'daily' || mode === 'easy-daily';
  const isEasyDailyMode = mode === 'easy-daily';
  const dailyModeLabel = isEasyDailyMode ? copy.easyDailyMode : copy.dailyMode;
  const isDailyLastPerson = isDailyMode && dailyRoundIndex >= dailyPeople.length - 1;
  const shouldDailyEndAfterResult =
    isDailyMode &&
    result !== null &&
    (isDailyGameOver || (result === 'correct' && isDailyLastPerson));
  const dailyBlockedHints: RevealedHints = isEasyDailyMode
    ? { ...noDailyHelperActions }
    : {
        methodOfDeath: !dailyUnusedHints.methodOfDeath,
        gender: !dailyUnusedHints.gender,
        profession: !dailyUnusedHints.profession,
      };
  const isRoundReady = isRoundIntroReady(roundIntroStage);
  const dailyRulesItems = getDailyRulesItems(
    isEasyDailyMode ? 'easy-daily' : 'daily',
    language,
  );
  const dailyPreviewEntry: DailyLeaderboardEntry | null = dailyFinalStats
    ? {
        id: 'current-daily-preview',
        username: username.trim() || 'anonymous',
        score: dailyFinalStats.score,
        correctGuesses: dailyFinalStats.correctGuesses,
        remainingHelperActions: dailyFinalStats.remainingHelperActions,
        completedAt: dailyFinalStats.completedAt,
      }
    : null;
  const dailyLeaderboardPreview =
    dailyPreviewEntry && !dailyEntry
      ? [dailyPreviewEntry, ...dailyLeaderboard]
      : dailyLeaderboard;
  const dailyResetCountdown = getDailyResetCountdown(dailyCountdownNow);
  const nextDailyChallengeText = copy.nextDailyChallengeIn(
    dailyResetCountdown.hours,
    dailyResetCountdown.minutes,
    dailyResetCountdown.seconds,
  );
  const shouldShowUtilityRow = !isEasyDailyMode || isPanelMinimized;
  const getPersonName = useCallback(
    (candidate: HistoricalPerson) => getLocalizedPerson(candidate, language).name,
    [language],
  );

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(languageStorageKey, nextLanguage);
  };

  const handleAdvanceRoundIntro = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (
        !person ||
        result ||
        isSessionComplete ||
        isDailyRulesOpen ||
        isRoundReady ||
        isRevealLoading
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (target?.closest('button, a, input, textarea, select, label, [role="button"]')) {
        return;
      }

      clearRevealTimer();
      setRoundIntroStage((currentStage) => getNextRoundIntroStage(currentStage));
    },
    [
      clearRevealTimer,
      isDailyRulesOpen,
      isRevealLoading,
      isRoundReady,
      isSessionComplete,
      person,
      result,
    ],
  );

  useEffect(
    () => () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
      }

      if (roundIntroTimerRef.current) {
        window.clearTimeout(roundIntroTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!person || result || isSessionComplete || isDailyRulesOpen) {
      return;
    }

    let stepIndex = 0;
    let isCancelled = false;

    const runStep = () => {
      const step = roundIntroSteps[stepIndex];

      if (!step || isCancelled) {
        return;
      }

      setRoundIntroStage(step.stage);

      if (step.stage === 'ready') {
        roundIntroTimerRef.current = null;
        return;
      }

      roundIntroTimerRef.current = window.setTimeout(() => {
        stepIndex += 1;
        runStep();
      }, step.delayMs);
    };

    runStep();

    return () => {
      isCancelled = true;
      if (roundIntroTimerRef.current) {
        window.clearTimeout(roundIntroTimerRef.current);
        roundIntroTimerRef.current = null;
      }
    };
  }, [isDailyRulesOpen, isSessionComplete, person, result]);

  useEffect(() => {
    if (!isDailyMode || !isSessionComplete || !dailyFinalStats) {
      return;
    }

    setDailyCountdownNow(new Date());
    const countdownTimer = window.setInterval(() => {
      setDailyCountdownNow(new Date());
    }, 1000);

    return () => window.clearInterval(countdownTimer);
  }, [dailyFinalStats, isDailyMode, isSessionComplete]);

  const resetRoundState = useCallback((nextRevealedHints = initialRevealedHints) => {
    setGuess('');
    setSubmittedGuess('');
    setResult(null);
    setIsRevealLoading(false);
    setIsPanelMinimized(false);
    setChanceNotice(null);
    setRevealedHints({ ...nextRevealedHints });
    setRoundIntroStage('birth');
  }, []);

  const loadLeaderboard = useCallback(() => {
    setDailyLeaderboard(readDailyLeaderboard(window.localStorage, dailyDateKey));
  }, [dailyDateKey]);

  const restoreDailyCompletion = useCallback((completion: DailyCompletionRecord) => {
    clearRevealTimer();
    setUsername(completion.entry?.username ?? '');
    setMode(completion.mode);
    setPerson(null);
    setUsedPersonIds([]);
    setDailyRoundIndex(0);
    setDailyCorrectGuesses(completion.correctGuesses);
    setDailyChances(0);
    setDailyUnusedHints(
      completion.mode === 'easy-daily' ? { ...noDailyHelperActions } : { ...initialDailyUnusedHints },
    );
    setIsDailyGameOver(true);
    setDailyEntry(completion.entry ?? null);
    setDailyFinalStats({
      score: completion.score,
      correctGuesses: completion.correctGuesses,
      remainingHelperActions: completion.remainingHelperActions,
      completedAt: completion.completedAt,
    });
    setDailyEndReason(null);
    setIsDailyRulesOpen(false);
    setShareStatus(null);
    setChanceNotice(null);
    setIsSessionComplete(true);
    setIsRevealLoading(false);
    setIsPanelMinimized(false);
    loadLeaderboard();
    resetRoundState(completion.mode === 'easy-daily' ? allHintsRevealed : initialRevealedHints);
  }, [clearRevealTimer, loadLeaderboard, resetRoundState]);

  useEffect(() => {
    const latestCompletion = readDailyCompletion(window.localStorage, dailyDateKey);

    if (latestCompletion) {
      restoreDailyCompletion(latestCompletion);
    }
  }, [dailyDateKey, restoreDailyCompletion]);

  const startPractice = () => {
    clearRevealTimer();
    const firstPerson = pickPracticePerson(people, []);

    setMode('practice');
    setPerson(firstPerson);
    setUsedPersonIds(firstPerson ? [firstPerson.id] : []);
    setIsSessionComplete(false);
    setScore(0);
    setDailyEntry(null);
    setDailyFinalStats(null);
    setDailyEndReason(null);
    setIsDailyRulesOpen(false);
    setShareStatus(null);
    setChanceNotice(null);
    resetRoundState();
  };

  const startDaily = (nextMode: Extract<GameMode, 'daily' | 'easy-daily'> = 'daily') => {
    clearRevealTimer();
    const existingCompletion = readDailyCompletion(window.localStorage, dailyDateKey);

    if (existingCompletion) {
      restoreDailyCompletion(existingCompletion);
      return;
    }

    const isEasyDaily = nextMode === 'easy-daily';

    setUsername('');
    setMode(nextMode);
    setPerson(dailyPeople[0] ?? null);
    setUsedPersonIds([]);
    setDailyRoundIndex(0);
    setDailyCorrectGuesses(0);
    setDailyChances(dailyInitialChances);
    setDailyUnusedHints(
      isEasyDaily ? { ...noDailyHelperActions } : { ...initialDailyUnusedHints },
    );
    setIsDailyGameOver(false);
    setDailyEntry(null);
    setDailyFinalStats(null);
    setDailyEndReason(null);
    setIsDailyRulesOpen(true);
    setShareStatus(null);
    setChanceNotice(null);
    setIsSessionComplete(false);
    loadLeaderboard();
    resetRoundState(isEasyDaily ? allHintsRevealed : initialRevealedHints);
  };

  const returnToModeSelect = () => {
    clearRevealTimer();
    setMode(null);
    setPerson(null);
    setIsSessionComplete(false);
    setDailyEntry(null);
    setDailyFinalStats(null);
    setDailyEndReason(null);
    setIsDailyGameOver(false);
    setIsDailyRulesOpen(false);
    setShareStatus(null);
    setChanceNotice(null);
    resetRoundState();
  };

  const revealResult = (nextResult: Exclude<GuessResult, null>, nextGuess: string) => {
    clearRevealTimer();
    setSubmittedGuess(nextGuess);
    setIsRevealLoading(true);
    revealTimerRef.current = window.setTimeout(() => {
      setResult(nextResult);
      setIsRevealLoading(false);
      revealTimerRef.current = null;
    }, revealDelayMs);
  };

  const finishDaily = useCallback((reason: string | null) => {
    const completionMode: DailyShareMode = isEasyDailyMode ? 'easy-daily' : 'daily';
    const remainingHelperActions = isEasyDailyMode
      ? 0
      : getRemainingDailyHelperActions(dailyUnusedHints);
    const finalStats = {
      score: getDailyScore(dailyCorrectGuesses, remainingHelperActions),
      correctGuesses: dailyCorrectGuesses,
      remainingHelperActions,
      completedAt: new Date().toISOString(),
    };

    saveDailyCompletion(window.localStorage, {
      dateKey: dailyDateKey,
      mode: completionMode,
      ...finalStats,
    });

    setDailyFinalStats({
      ...finalStats,
    });
    setDailyEntry(null);
    setShareStatus(null);
    setDailyEndReason(reason);
    setIsDailyRulesOpen(false);
    setChanceNotice(null);
    setIsSessionComplete(true);
    setPerson(null);
    setResult(null);
    setIsRevealLoading(false);
    setIsPanelMinimized(false);
  }, [dailyCorrectGuesses, dailyDateKey, dailyUnusedHints, isEasyDailyMode]);

  const handleSaveDailyScore = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!dailyFinalStats) {
      return;
    }

    const entry: DailyLeaderboardEntry = {
      id: getEntryId(),
      username: username.trim() || 'anonymous',
      score: dailyFinalStats.score,
      correctGuesses: dailyFinalStats.correctGuesses,
      remainingHelperActions: dailyFinalStats.remainingHelperActions,
      completedAt: dailyFinalStats.completedAt,
    };

    const nextLeaderboard = saveDailyLeaderboardEntry(window.localStorage, dailyDateKey, entry);
    saveDailyCompletion(window.localStorage, {
      dateKey: dailyDateKey,
      mode: isEasyDailyMode ? 'easy-daily' : 'daily',
      score: dailyFinalStats.score,
      correctGuesses: dailyFinalStats.correctGuesses,
      remainingHelperActions: dailyFinalStats.remainingHelperActions,
      completedAt: dailyFinalStats.completedAt,
      entry,
    });
    setDailyEntry(entry);
    setDailyLeaderboard(nextLeaderboard);
    setUsername(entry.username);
  };

  const handleRevealHint = (hint: HintKey) => {
    if (isEasyDailyMode) {
      return;
    }

    if (isDailyMode) {
      if (!dailyUnusedHints[hint]) {
        return;
      }

      setDailyUnusedHints((currentHintsState) => ({
        ...currentHintsState,
        [hint]: false,
      }));
    }

    setRevealedHints((currentHintsState) => ({
      ...currentHintsState,
      [hint]: true,
    }));
  };

  const handleSubmit = () => {
    if (!person) {
      return;
    }

    const nextResult = isCorrectGuess(guess, person, language) ? 'correct' : 'incorrect';

    revealResult(nextResult, guess.trim());

    if (isDailyMode) {
      if (nextResult === 'correct') {
        setDailyCorrectGuesses((currentScore) => currentScore + 1);
      } else {
        const missOutcome = getDailyMissOutcome(dailyChances);
        setDailyChances(missOutcome.remainingChances);
        setIsDailyGameOver(missOutcome.isGameOver);

        if (isEasyDailyMode && !missOutcome.isGameOver) {
          setChanceNotice(copy.chanceRemaining);
        }
      }

      return;
    }

    if (nextResult === 'correct') {
      setScore((currentScore) => currentScore + getPointsForHintCount(revealedHintCount));
    }
  };

  const handleSkip = () => {
    revealResult('incorrect', '__SKIPPED__');

    if (isDailyMode) {
      const missOutcome = getDailyMissOutcome(dailyChances);
      setDailyChances(missOutcome.remainingChances);
      setIsDailyGameOver(missOutcome.isGameOver);

      if (isEasyDailyMode && !missOutcome.isGameOver) {
        setChanceNotice(copy.chanceRemaining);
      }
    }
  };

  const handleNextRound = () => {
    clearRevealTimer();

    if (isDailyMode) {
      if (isDailyGameOver) {
        finishDaily(null);
        return;
      }

      if (isDailyLastPerson) {
        finishDaily(copy.completedDaily);
        return;
      }

      const nextRoundIndex = dailyRoundIndex + 1;
      setDailyRoundIndex(nextRoundIndex);
      setPerson(dailyPeople[nextRoundIndex] ?? null);
      resetRoundState(isEasyDailyMode ? allHintsRevealed : initialRevealedHints);
      return;
    }

    const nextPerson = pickPracticePerson(people, usedPersonIds);

    if (!nextPerson) {
      setIsSessionComplete(true);
      setPerson(null);
      return;
    }

    setPerson(nextPerson);
    setUsedPersonIds((currentIds) => [...currentIds, nextPerson.id]);
    resetRoundState();
  };

  useEffect(() => {
    if (
      !isDailyMode ||
      !isDailyGameOver ||
      result !== 'incorrect' ||
      isRevealLoading ||
      isSessionComplete
    ) {
      return;
    }

    const gameOverTimer = window.setTimeout(() => {
      finishDaily(null);
    }, 5000);

    return () => window.clearTimeout(gameOverTimer);
  }, [finishDaily, isDailyGameOver, isDailyMode, isRevealLoading, isSessionComplete, result]);

  const handleShareDailyScore = async () => {
    const entry = dailyEntry ?? dailyPreviewEntry;

    if (!entry) {
      return;
    }

    const shareText = createDailyShareText(
      entry,
      dailyDateKey,
      getShareUrl(),
      language,
      isEasyDailyMode ? 'easy-daily' : 'daily',
    );

    try {
      await navigator.clipboard.writeText(shareText);
      setShareStatus(copy.copiedShareText);
    } catch {
      setShareStatus(copy.shareUnavailable);
    }
  };

  if (people.length === 0) {
    return (
      <main className="app-shell empty-state mode-select-state">
        <section className="panel">
          <h1>{copy.noPlayableTitle}</h1>
          <p>{copy.noPlayableBody}</p>
        </section>
      </main>
    );
  }

  if (!mode) {
    return (
      <main className="app-shell empty-state mode-select-state">
        <div className="mode-intro">
          <h1>{copy.appTitle}</h1>
          <p>{copy.tagline}</p>
        </div>
        <section className="mode-panel" aria-label={copy.chooseGameMode}>
          <div className="mode-actions">
            <button type="button" onClick={() => startDaily('easy-daily')}>
              {copy.easyDaily}
            </button>
            <button type="button" onClick={() => startDaily()}>
              {copy.daily}
            </button>
            <button type="button" onClick={startPractice}>
              {copy.practice}
            </button>
          </div>
          <div className="language-toggle" aria-label="Language">
            <button
              type="button"
              className={language === 'en' ? 'active' : ''}
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
            >
              <span aria-hidden="true">🇬🇧</span>
              EN
            </button>
            <button
              type="button"
              className={language === 'ja' ? 'active' : ''}
              onClick={() => setLanguage('ja')}
              aria-pressed={language === 'ja'}
            >
              <span aria-hidden="true">🇯🇵</span>
              JP
            </button>
          </div>
          {malformedCount > 0 ? (
            <p className="data-warning">{copy.malformedSeed(malformedCount)}</p>
          ) : null}
        </section>
        <footer className="source-footer">
          <p>
            {copy.sourcePrefix}{' '}
            <a href="https://www.wikidata.org/" target="_blank" rel="noreferrer">
              {copy.wikidata}
            </a>{' '}
            {copy.sourceMiddle}{' '}
            <a href="https://www.wikipedia.org/" target="_blank" rel="noreferrer">
              {copy.wikipedia}
            </a>
          </p>
          <p>
            Link to the{' '}
            <a
              className="source-footer-icon-link"
              href="https://github.com/Willhargrave/person-game"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="github-icon"
                focusable="false"
              >
                <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.38-3.37-1.38-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.37 9.37 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.95.68 1.91 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.1 10.1 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
              </svg>
              Github Source
            </a>{' '}
            and my{' '}
            <a
              href="https://will-hargrave-portfolio.vercel.app/en"
              target="_blank"
              rel="noreferrer"
            >
              Portfolio
            </a>
          </p>
        </footer>
      </main>
    );
  }

  if (isDailyMode && isSessionComplete && dailyFinalStats) {
    return (
      <main className="app-shell empty-state">
        <section className="daily-complete-layout" aria-label={copy.dailyChallenge(dailyModeLabel, dailyDateKey)}>
          <section className="panel daily-complete-panel">
            <div className="panel-heading">
              <p className="eyebrow">{copy.dailyChallenge(dailyModeLabel, dailyDateKey)}</p>
              <h1>{copy.points(dailyFinalStats.score)}</h1>
            </div>
            <p>{dailyEndReason ?? nextDailyChallengeText}</p>
            {!isEasyDailyMode ? (
              <dl className="daily-score-breakdown">
                <div>
                  <dt>{copy.correctPeople}</dt>
                  <dd>{dailyFinalStats.correctGuesses}</dd>
                </div>
                <div>
                  <dt>{copy.helperBonus}</dt>
                  <dd>{dailyFinalStats.remainingHelperActions * 2}</dd>
                </div>
                <div className="daily-score-total">
                  <dt>{copy.total}</dt>
                  <dd>{dailyFinalStats.score}</dd>
                </div>
              </dl>
            ) : null}
            <div className="daily-actions">
              <button type="button" onClick={handleShareDailyScore}>
                {copy.shareScore}
              </button>
              <button className="secondary-button" type="button" onClick={startPractice}>
                {copy.practice}
              </button>
            </div>
            {shareStatus ? <p className="share-status">{shareStatus}</p> : null}
            <form className="username-form" onSubmit={handleSaveDailyScore}>
              <label htmlFor="daily-username">{copy.username}</label>
              <input
                id="daily-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={Boolean(dailyEntry)}
                maxLength={24}
                placeholder={copy.anonymousPlaceholder}
                autoComplete="nickname"
              />
              <button type="submit" disabled={Boolean(dailyEntry)}>
                {copy.addScore}
              </button>
            </form>
          </section>
          <section className="panel leaderboard-section" aria-label="Daily leaderboard">
            <h2>{copy.leaderboard}</h2>
            {dailyLeaderboardPreview.length > 0 ? (
              <ol className="leaderboard-list">
                {dailyLeaderboardPreview.map((entry) => (
                  <li
                    key={entry.id}
                    className={
                      entry.id === dailyEntry?.id || entry.id === dailyPreviewEntry?.id
                        ? 'current-entry'
                        : ''
                    }
                  >
                    <span>{entry.username}</span>
                    <strong>{entry.score}</strong>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{copy.noScores}</p>
            )}
          </section>
        </section>
      </main>
    );
  }

  if (!person && isSessionComplete) {
    return (
      <main className="app-shell empty-state">
        <section className="panel">
          <h1>{copy.sessionCompleteTitle}</h1>
          <p className="score-line">
            {copy.score}: {score}
          </p>
          <p>{copy.sessionCompleteBody}</p>
          <button type="button" onClick={returnToModeSelect}>
            {copy.changeMode}
          </button>
        </section>
      </main>
    );
  }

  if (!person) {
    return (
      <main className="app-shell empty-state">
        <section className="panel">
          <h1>{copy.noPlayableTitle}</h1>
          <p>{copy.noPlayableBody}</p>
        </section>
      </main>
    );
  }

  const localizedPerson = currentLocalizedPerson ?? getLocalizedPerson(person, language);

  return (
    <main className="app-shell" onPointerDownCapture={handleAdvanceRoundIntro}>
      <GameMap
        person={person}
        localizedPerson={localizedPerson}
        labels={{
          birthplace: copy.birthplace,
          deathPlace: copy.deathPlace,
          bornIn: copy.bornIn,
          diedIn: copy.diedIn,
        }}
        introStage={roundIntroStage}
        deathCause={isEasyDailyMode ? currentLocalizedHints.methodOfDeath : undefined}
      />
      <div className="grain" aria-hidden="true" />
      {isDailyMode && isDailyRulesOpen ? (
        <DailyRulesCard
          title={copy.rulesTitle}
          items={dailyRulesItems}
          startLabel={isEasyDailyMode ? copy.startEasyDaily : copy.startDaily}
          helperIconsLabel={copy.hintsLabel}
          chanceIconLabel={copy.chanceLabel}
          onDismiss={() => setIsDailyRulesOpen(false)}
        />
      ) : null}
      <div className={`ui-stack ${isPanelMinimized ? 'minimized' : ''}`}>
        {shouldShowUtilityRow ? (
          <div className="utility-row">
            {!isEasyDailyMode ? (
              <div
                className={`score-panel ${isDailyMode ? 'daily-score-panel' : ''}`}
                aria-label="Current score"
              >
                {isDailyMode ? (
                  <span className="daily-status-icons">
                    <span className="daily-chance-icons" aria-label="Daily chances">
                      <span
                        className={`daily-chance-icon ${dailyChances > 0 ? '' : 'used'}`}
                        title={dailyChances > 0 ? copy.chanceAvailable : copy.chanceUsed}
                        aria-label={dailyChances > 0 ? copy.chanceAvailable : copy.chanceUsed}
                      >
                        {dailyChanceIcon}
                      </span>
                    </span>
                    <span className="daily-helper-icons" aria-label="Daily helpers">
                      {dailyHelperIcons.map((helper) => (
                        <span
                          key={helper.hint}
                          className={`daily-helper-icon ${
                            !dailyUnusedHints[helper.hint] ? 'used' : ''
                          }`}
                          title={copy.helperLabels[helper.hint]}
                          aria-label={`${copy.helperLabels[helper.hint]}: ${
                            dailyUnusedHints[helper.hint] ? copy.helperAvailable : copy.helperUsed
                          }`}
                        >
                          {helper.icon}
                        </span>
                      ))}
                    </span>
                  </span>
                ) : (
                  `Score: ${score}`
                )}
              </div>
            ) : null}
            {isPanelMinimized ? (
              <button
                className="panel-toggle"
                type="button"
                onClick={() => setIsPanelMinimized(false)}
                aria-label="Restore panel"
                aria-expanded={false}
              >
                +
              </button>
            ) : null}
          </div>
        ) : null}
        {chanceNotice ? (
          <section className="panel chance-notice" role="status" aria-live="polite">
            <p>{chanceNotice}</p>
          </section>
        ) : null}
        {!isPanelMinimized ? (
          <>
            {isRevealLoading ? (
              <section
                className="panel reveal-loading-panel"
                aria-live="polite"
                aria-label="Loading result"
              >
                <button
                  className="panel-minimize"
                  type="button"
                  onClick={() => setIsPanelMinimized(true)}
                  aria-label="Minimize panel"
                >
                  -
                </button>
                <span className="loading-spinner" aria-hidden="true" />
                <p>Revealing...</p>
              </section>
            ) : result ? (
              <ResultPanel
                result={result}
                person={person}
                localizedPerson={localizedPerson}
                guess={submittedGuess}
                hints={currentLocalizedHints}
                language={language}
                labels={{
                  minimizePanel: copy.minimizePanel,
                  correct: copy.correct,
                  skipped: copy.skipped,
                  incorrectGuess: copy.incorrectGuess,
                  nothing: copy.nothing,
                  born: copy.born,
                  died: copy.died,
                  loadingSummary: copy.loadingSummary,
                  summaryUnavailable: copy.summaryUnavailable,
                  fullProfile: copy.fullProfile,
                  viewSummary: copy.viewSummary,
                  backToCard: copy.backToCard,
                }}
                onNextRound={handleNextRound}
                onMinimize={() => setIsPanelMinimized(true)}
                nextRoundLabel={shouldDailyEndAfterResult ? copy.viewLeaderboard : copy.nextRound}
              />
            ) : !isRoundReady ? null : (
              <PersonInfo
                person={person}
                localizedPerson={localizedPerson}
                hints={currentLocalizedClueHints}
                labels={{
                  appTitle: copy.appTitle,
                  knownClues: copy.knownClues,
                  minimizePanel: copy.minimizePanel,
                  bornPrompt: copy.bornPrompt,
                  diedPrompt: copy.diedPrompt,
                  hintsLabel: copy.hintsLabel,
                  revealedDetails: copy.revealedDetails,
                  helperLabels: copy.helperLabels,
                }}
                revealedHints={revealedHints}
                disabledHints={isDailyMode ? dailyBlockedHints : undefined}
                displayMode={isEasyDailyMode ? 'easy-daily' : 'interactive'}
                onRevealHint={handleRevealHint}
                onMinimize={() => setIsPanelMinimized(true)}
              />
            )}
            {!result && !isRevealLoading && isRoundReady ? (
              <GuessPanel
                guess={guess}
                result={result}
                people={people}
                labels={{
                  title: copy.whoAmI,
                  placeholder: copy.guessPlaceholder,
                  submit: copy.submit,
                  skip: isDailyMode
                    ? dailyChances > 0
                      ? copy.skipRemaining
                      : copy.giveUp
                    : copy.skip,
                  nextRound: copy.nextRound,
                }}
                getPersonName={getPersonName}
                onGuessChange={setGuess}
                onSubmit={handleSubmit}
                onSkip={handleSkip}
                onNextRound={handleNextRound}
              />
            ) : null}
            {malformedCount > 0 ? (
              <p className="data-warning">
                {copy.malformedSeed(malformedCount)}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}

export default App;

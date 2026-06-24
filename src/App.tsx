import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { GameMap } from './components/GameMap';
import { DailyRulesCard } from './components/DailyRulesCard';
import { GuessPanel } from './components/GuessPanel';
import { PersonInfo } from './components/PersonInfo';
import { ResultPanel } from './components/ResultPanel';
import peopleData from './data/historicalPeople.json';
import { fallbackHints, personHints } from './data/personHints';
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
  dailyInitialLives,
  getDailyDateKey,
  getDailyMissOutcome,
  getDailyPeople,
  getDailyScore,
  getRemainingDailyHelperActions,
  readDailyLeaderboard,
  saveDailyLeaderboardEntry,
} from './utils/dailyChallenge';
import { dailyRulesItems, dailyRulesTitle } from './utils/dailyRules';
import { getValidPeople, isCorrectGuess, pickRandomPerson } from './utils/people';

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

const dailyHelperIcons: Array<{ hint: HintKey; icon: string; label: string }> = [
  { hint: 'methodOfDeath', icon: '☠', label: 'Cause of death helper' },
  { hint: 'gender', icon: '⚧', label: 'Gender helper' },
  { hint: 'profession', icon: '⚒', label: 'Profession helper' },
];

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
  const [dailyLives, setDailyLives] = useState(dailyInitialLives);
  const [dailyUnusedHints, setDailyUnusedHints] = useState<RevealedHints>(initialDailyUnusedHints);
  const [isDailyGameOver, setIsDailyGameOver] = useState(false);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<DailyLeaderboardEntry[]>([]);
  const [dailyEntry, setDailyEntry] = useState<DailyLeaderboardEntry | null>(null);
  const [dailyFinalStats, setDailyFinalStats] = useState<DailyFinalStats | null>(null);
  const [dailyEndReason, setDailyEndReason] = useState<string | null>(null);
  const [isDailyRulesOpen, setIsDailyRulesOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<RevealedHints>(initialRevealedHints);
  const [isRevealLoading, setIsRevealLoading] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const revealTimerRef = useRef<number | null>(null);

  const malformedCount = Array.isArray(peopleData) ? peopleData.length - people.length : 0;
  const currentHints = person ? (personHints[person.id] ?? fallbackHints) : fallbackHints;
  const revealedHintCount = Object.values(revealedHints).filter(Boolean).length;
  const isDailyMode = mode === 'daily';
  const isDailyLastPerson = isDailyMode && dailyRoundIndex >= dailyPeople.length - 1;
  const shouldDailyEndAfterResult =
    isDailyMode &&
    result !== null &&
    (isDailyGameOver || (result === 'correct' && isDailyLastPerson));
  const dailyBlockedHints: RevealedHints = {
    methodOfDeath: !dailyUnusedHints.methodOfDeath,
    gender: !dailyUnusedHints.gender,
    profession: !dailyUnusedHints.profession,
  };

  useEffect(
    () => () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
      }
    },
    [],
  );

  const clearRevealTimer = () => {
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  };

  const resetRoundState = () => {
    setGuess('');
    setSubmittedGuess('');
    setResult(null);
    setIsRevealLoading(false);
    setIsPanelMinimized(false);
    setRevealedHints({ ...initialRevealedHints });
  };

  const loadLeaderboard = () => {
    setDailyLeaderboard(readDailyLeaderboard(window.localStorage, dailyDateKey));
  };

  const startPractice = () => {
    clearRevealTimer();
    const firstPerson = pickRandomPerson(people);

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
    resetRoundState();
  };

  const startDaily = () => {
    clearRevealTimer();
    setUsername('');
    setMode('daily');
    setPerson(dailyPeople[0] ?? null);
    setUsedPersonIds([]);
    setDailyRoundIndex(0);
    setDailyCorrectGuesses(0);
    setDailyLives(dailyInitialLives);
    setDailyUnusedHints({ ...initialDailyUnusedHints });
    setIsDailyGameOver(false);
    setDailyEntry(null);
    setDailyFinalStats(null);
    setDailyEndReason(null);
    setIsDailyRulesOpen(true);
    setShareStatus(null);
    setIsSessionComplete(false);
    loadLeaderboard();
    resetRoundState();
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

  const finishDaily = (reason: string) => {
    const remainingHelperActions = getRemainingDailyHelperActions(dailyUnusedHints);
    setDailyFinalStats({
      score: getDailyScore(dailyCorrectGuesses, remainingHelperActions),
      correctGuesses: dailyCorrectGuesses,
      remainingHelperActions,
      completedAt: new Date().toISOString(),
    });
    setDailyEntry(null);
    setShareStatus(null);
    setDailyEndReason(reason);
    setIsDailyRulesOpen(false);
    setIsSessionComplete(true);
    setPerson(null);
    setResult(null);
    setIsRevealLoading(false);
    setIsPanelMinimized(false);
  };

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
    setDailyEntry(entry);
    setDailyLeaderboard(nextLeaderboard);
    setUsername(entry.username);
  };

  const handleRevealHint = (hint: HintKey) => {
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

    const nextResult = isCorrectGuess(guess, person) ? 'correct' : 'incorrect';

    revealResult(nextResult, guess.trim());

    if (isDailyMode) {
      if (nextResult === 'correct') {
        setDailyCorrectGuesses((currentScore) => currentScore + 1);
      } else {
        const missOutcome = getDailyMissOutcome(dailyLives);
        setDailyLives(missOutcome.remainingLives);
        setIsDailyGameOver(missOutcome.isGameOver);
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
      setDailyLives(0);
      setIsDailyGameOver(true);
    }
  };

  const handleNextRound = () => {
    clearRevealTimer();

    if (isDailyMode) {
      if (isDailyGameOver) {
        finishDaily('You ran out of lives.');
        return;
      }

      if (isDailyLastPerson) {
        finishDaily('You completed every person in today\'s challenge.');
        return;
      }

      const nextRoundIndex = dailyRoundIndex + 1;
      setDailyRoundIndex(nextRoundIndex);
      setPerson(dailyPeople[nextRoundIndex] ?? null);
      resetRoundState();
      return;
    }

    const unseenPeople = people.filter((candidate) => !usedPersonIds.includes(candidate.id));
    const nextPerson = pickRandomPerson(unseenPeople);

    if (!nextPerson) {
      setIsSessionComplete(true);
      setPerson(null);
      return;
    }

    setPerson(nextPerson);
    setUsedPersonIds((currentIds) => [...currentIds, nextPerson.id]);
    resetRoundState();
  };

  const handleShareDailyScore = async () => {
    if (!dailyEntry) {
      return;
    }

    const shareText = createDailyShareText(dailyEntry, dailyDateKey, dailyPeople.length);

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Trace My Life Daily',
          text: shareText,
        });
        setShareStatus('Shared.');
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareStatus('Copied share text.');
    } catch {
      setShareStatus('Share unavailable.');
    }
  };

  if (people.length === 0) {
    return (
      <main className="app-shell empty-state">
        <section className="panel">
          <h1>No playable data found</h1>
          <p>
            Check <code>src/data/historicalPeople.json</code> for missing names, dates, places, or
            coordinates.
          </p>
        </section>
      </main>
    );
  }

  if (!mode) {
    return (
      <main className="app-shell empty-state">
        <div className="mode-intro">
          <h1>Trace My Life</h1>
          <p>Uncover famous people based on their birth and death</p>
        </div>
        <section className="panel mode-panel">
          <div className="mode-actions">
            <button type="button" onClick={startDaily}>
              Daily
            </button>
            <button type="button" onClick={startPractice}>
              Practice
            </button>
          </div>
          {malformedCount > 0 ? (
            <p className="data-warning">
              {malformedCount} malformed seed{' '}
              {malformedCount === 1 ? 'record was' : 'records were'} skipped.
            </p>
          ) : null}
        </section>
      </main>
    );
  }

  if (isDailyMode && isSessionComplete && dailyFinalStats) {
    return (
      <main className="app-shell empty-state">
        <section className="panel daily-complete-panel">
          <div className="panel-heading">
            <p className="eyebrow">Daily Challenge {dailyDateKey}</p>
            <h1>{dailyFinalStats.score} points</h1>
          </div>
          {dailyEndReason ? <p>{dailyEndReason}</p> : null}
          <dl className="daily-score-breakdown">
            <div>
              <dt>Correct</dt>
              <dd>{dailyFinalStats.correctGuesses}</dd>
            </div>
            <div>
              <dt>Helpers saved</dt>
              <dd>{dailyFinalStats.remainingHelperActions}</dd>
            </div>
          </dl>
          {!dailyEntry ? (
            <form className="username-form" onSubmit={handleSaveDailyScore}>
              <label htmlFor="daily-username">Username</label>
              <input
                id="daily-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={24}
                placeholder="Leave blank for anonymous"
                autoComplete="nickname"
              />
              <button type="submit">Add score</button>
            </form>
          ) : (
            <>
              <div className="daily-actions">
                <button type="button" onClick={handleShareDailyScore}>
                  Share score
                </button>
                <button className="secondary-button" type="button" onClick={startDaily}>
                  Play Daily again
                </button>
                <button className="secondary-button" type="button" onClick={returnToModeSelect}>
                  Change mode
                </button>
              </div>
              {shareStatus ? <p className="share-status">{shareStatus}</p> : null}
              <section className="leaderboard-section" aria-label="Daily leaderboard">
                <h2>Daily Leaderboard</h2>
                {dailyLeaderboard.length > 0 ? (
                  <ol className="leaderboard-list">
                    {dailyLeaderboard.map((entry) => (
                      <li
                        key={entry.id}
                        className={entry.id === dailyEntry.id ? 'current-entry' : ''}
                      >
                        <span>{entry.username}</span>
                        <strong>{entry.score}</strong>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>No scores yet.</p>
                )}
              </section>
            </>
          )}
        </section>
      </main>
    );
  }

  if (!person && isSessionComplete) {
    return (
      <main className="app-shell empty-state">
        <section className="panel">
          <h1>Session complete</h1>
          <p className="score-line">Score: {score}</p>
          <p>
            You have seen every person in this seed set. Refresh the page to start a new session.
          </p>
          <button type="button" onClick={returnToModeSelect}>
            Change mode
          </button>
        </section>
      </main>
    );
  }

  if (!person) {
    return (
      <main className="app-shell empty-state">
        <section className="panel">
          <h1>No playable data found</h1>
          <p>
            Check <code>src/data/historicalPeople.json</code> for missing names, dates, places, or
            coordinates.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <GameMap person={person} />
      <div className="grain" aria-hidden="true" />
      {isDailyMode && isDailyRulesOpen ? (
        <DailyRulesCard
          title={dailyRulesTitle}
          items={dailyRulesItems}
          onDismiss={() => setIsDailyRulesOpen(false)}
        />
      ) : null}
      <div className={`ui-stack ${isPanelMinimized ? 'minimized' : ''}`}>
        <div className="utility-row">
          <div
            className={`score-panel ${isDailyMode ? 'daily-score-panel' : ''}`}
            aria-label="Current score"
          >
            {isDailyMode ? (
              <>
                <span>
                  Daily: {dailyCorrectGuesses} points • {dailyLives}{' '}
                  {dailyLives === 1 ? 'life' : 'lives'}
                </span>
                <span className="daily-helper-icons" aria-label="Daily helpers">
                  {dailyHelperIcons.map((helper) => (
                    <span
                      key={helper.hint}
                      className={`daily-helper-icon ${
                        dailyUnusedHints[helper.hint] ? '' : 'used'
                      }`}
                      title={helper.label}
                      aria-label={`${helper.label}: ${
                        dailyUnusedHints[helper.hint] ? 'available' : 'used'
                      }`}
                    >
                      {helper.icon}
                    </span>
                  ))}
                </span>
              </>
            ) : (
              `Score: ${score}`
            )}
          </div>
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
                guess={submittedGuess}
                hints={currentHints}
                onNextRound={handleNextRound}
                onMinimize={() => setIsPanelMinimized(true)}
                nextRoundLabel={shouldDailyEndAfterResult ? 'View leaderboard' : 'Next round'}
              />
            ) : (
              <PersonInfo
                person={person}
                hints={currentHints}
                revealedHints={revealedHints}
                disabledHints={isDailyMode ? dailyBlockedHints : undefined}
                onRevealHint={handleRevealHint}
                onMinimize={() => setIsPanelMinimized(true)}
              />
            )}
            {!result && !isRevealLoading ? (
              <GuessPanel
                guess={guess}
                result={result}
                people={people}
                onGuessChange={setGuess}
                onSubmit={handleSubmit}
                onSkip={isDailyMode ? undefined : handleSkip}
                onNextRound={handleNextRound}
              />
            ) : null}
            {malformedCount > 0 ? (
              <p className="data-warning">
                {malformedCount} malformed seed{' '}
                {malformedCount === 1 ? 'record was' : 'records were'} skipped.
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}

export default App;

import { useEffect, useMemo, useRef, useState } from 'react';
import { GameMap } from './components/GameMap';
import { GuessPanel } from './components/GuessPanel';
import { PersonInfo } from './components/PersonInfo';
import { ResultPanel } from './components/ResultPanel';
import peopleData from './data/historicalPeople.json';
import { fallbackHints, personHints } from './data/personHints';
import type { GuessResult, HintKey, HistoricalPerson, RevealedHints } from './types';
import { getValidPeople, isCorrectGuess, pickRandomPerson } from './utils/people';

const initialRevealedHints: RevealedHints = {
  methodOfDeath: false,
  gender: false,
  profession: false,
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

function App() {
  const people = useMemo(() => getValidPeople(peopleData), []);
  const firstPerson = useMemo(() => pickRandomPerson(people), [people]);
  const [person, setPerson] = useState<HistoricalPerson | null>(firstPerson);
  const [usedPersonIds, setUsedPersonIds] = useState<string[]>(() =>
    firstPerson ? [firstPerson.id] : [],
  );
  const [guess, setGuess] = useState('');
  const [submittedGuess, setSubmittedGuess] = useState('');
  const [result, setResult] = useState<GuessResult>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [revealedHints, setRevealedHints] = useState<RevealedHints>(initialRevealedHints);
  const [isRevealLoading, setIsRevealLoading] = useState(false);
  const revealTimerRef = useRef<number | null>(null);

  const malformedCount = Array.isArray(peopleData) ? peopleData.length - people.length : 0;
  const currentHints = person ? (personHints[person.id] ?? fallbackHints) : fallbackHints;
  const revealedHintCount = Object.values(revealedHints).filter(Boolean).length;

  useEffect(
    () => () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
      }
    },
    [],
  );

  const revealResult = (nextResult: Exclude<GuessResult, null>, nextGuess: string) => {
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
    }

    setSubmittedGuess(nextGuess);
    setIsRevealLoading(true);
    revealTimerRef.current = window.setTimeout(() => {
      setResult(nextResult);
      setIsRevealLoading(false);
      revealTimerRef.current = null;
    }, revealDelayMs);
  };

  const handleRevealHint = (hint: HintKey) => {
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

    if (nextResult === 'correct') {
      setScore((currentScore) => currentScore + getPointsForHintCount(revealedHintCount));
    }
  };

  const handleSkip = () => {
    revealResult('incorrect', '__SKIPPED__');
  };

  const handleNextRound = () => {
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
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
    setGuess('');
    setSubmittedGuess('');
    setResult(null);
    setIsRevealLoading(false);
    setRevealedHints(initialRevealedHints);
  };

  if (!person && isSessionComplete) {
    return (
      <main className="app-shell empty-state">
        <section className="panel">
          <h1>Session complete</h1>
          <p className="score-line">Score: {score}</p>
          <p>
            You have seen every person in this seed set. Refresh the page to start a new session.
          </p>
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
      <div className="ui-stack">
        <div className="score-panel" aria-label="Current score">
          Score: {score}
        </div>
        {isRevealLoading ? (
          <section className="panel reveal-loading-panel" aria-live="polite" aria-label="Loading result">
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
          />
        ) : (
          <PersonInfo
            person={person}
            hints={currentHints}
            revealedHints={revealedHints}
            onRevealHint={handleRevealHint}
          />
        )}
        {!result && !isRevealLoading ? (
          <GuessPanel
            guess={guess}
            result={result}
            people={people}
            onGuessChange={setGuess}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            onNextRound={handleNextRound}
          />
        ) : null}
        {malformedCount > 0 ? (
          <p className="data-warning">
            {malformedCount} malformed seed {malformedCount === 1 ? 'record was' : 'records were'}{' '}
            skipped.
          </p>
        ) : null}
      </div>
    </main>
  );
}

export default App;

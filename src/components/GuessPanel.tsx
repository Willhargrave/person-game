import { useMemo } from 'react';
import type { FormEvent } from 'react';
import type { GuessResult, HistoricalPerson } from '../types';
import { normalizeGuess } from '../utils/people';

interface GuessPanelProps {
  guess: string;
  result: GuessResult;
  people: HistoricalPerson[];
  onGuessChange: (guess: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onNextRound: () => void;
}

export function GuessPanel({
  guess,
  result,
  people,
  onGuessChange,
  onSubmit,
  onSkip,
  onNextRound,
}: GuessPanelProps) {
  const isSubmitted = result !== null;
  const normalizedGuess = normalizeGuess(guess);
  const suggestions = useMemo(() => {
    if (normalizedGuess.length < 2 || isSubmitted) {
      return [];
    }

    return people
      .filter((person) => {
        const normalizedName = normalizeGuess(person.name);
        const nameParts = normalizedName.split(' ');

        return (
          normalizedName.startsWith(normalizedGuess) ||
          nameParts.some((part) => part.startsWith(normalizedGuess))
        );
      })
      .slice(0, 6);
  }, [isSubmitted, normalizedGuess, people]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSubmitted && guess.trim()) {
      onSubmit();
    }
  };

  return (
    <form className="panel guess-panel" onSubmit={handleSubmit}>
      <label htmlFor="guess">Who Am I?</label>
      <div className="guess-entry">
        <div className="guess-row">
          <input
            id="guess"
            type="text"
            value={guess}
            onChange={(event) => onGuessChange(event.target.value)}
            placeholder="Enter a full name"
            disabled={isSubmitted}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
            aria-controls="guess-suggestions"
          />
          <button type="submit" disabled={isSubmitted || !guess.trim()}>
            Submit
          </button>
        </div>
        {suggestions.length > 0 ? (
          <ul className="suggestions" id="guess-suggestions">
            {suggestions.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onGuessChange(person.name)}
                >
                  {person.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {!isSubmitted ? (
        <button className="secondary-button" type="button" onClick={onSkip}>
          Skip
        </button>
      ) : null}
      {isSubmitted ? (
        <button className="secondary-button" type="button" onClick={onNextRound}>
          Next round
        </button>
      ) : null}
    </form>
  );
}

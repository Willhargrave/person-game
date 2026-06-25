import { useMemo, useRef } from 'react';
import type { FormEvent } from 'react';
import type { GuessResult, HistoricalPerson } from '../types';
import { normalizeGuess } from '../utils/people';

interface GuessPanelProps {
  guess: string;
  result: GuessResult;
  people: HistoricalPerson[];
  labels: {
    title: string;
    placeholder: string;
    submit: string;
    skip: string;
    nextRound: string;
  };
  getPersonName: (person: HistoricalPerson) => string;
  onGuessChange: (guess: string) => void;
  onSubmit: () => void;
  onSkip?: () => void;
  onNextRound: () => void;
}

export function GuessPanel({
  guess,
  result,
  people,
  labels,
  getPersonName,
  onGuessChange,
  onSubmit,
  onSkip,
  onNextRound,
}: GuessPanelProps) {
  const isSubmitted = result !== null;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const normalizedGuess = normalizeGuess(guess);
  const suggestions = useMemo(() => {
    if (normalizedGuess.length < 2 || isSubmitted) {
      return [];
    }

    return people
      .filter((person) => {
        const normalizedName = normalizeGuess(getPersonName(person));
        const nameParts = normalizedName.split(' ');

        return (
          normalizedName.startsWith(normalizedGuess) ||
          nameParts.some((part) => part.startsWith(normalizedGuess))
        );
      })
      .slice(0, 6);
  }, [getPersonName, isSubmitted, normalizedGuess, people]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSubmitted && guess.trim()) {
      onSubmit();
    }
  };

  const handleSuggestionSelect = (person: HistoricalPerson) => {
    onGuessChange(getPersonName(person));
    inputRef.current?.blur();
  };

  return (
    <form className="panel guess-panel" onSubmit={handleSubmit}>
      <label htmlFor="guess">{labels.title}</label>
      <div className="guess-entry">
        <div className="guess-row">
          <input
            ref={inputRef}
            id="guess"
            type="text"
            value={guess}
            onChange={(event) => onGuessChange(event.target.value)}
            placeholder={labels.placeholder}
            disabled={isSubmitted}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
            aria-controls="guess-suggestions"
          />
          <button type="submit" disabled={isSubmitted || !guess.trim()}>
            {labels.submit}
          </button>
        </div>
        {suggestions.length > 0 ? (
          <ul className="suggestions" id="guess-suggestions">
            {suggestions.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionSelect(person)}
                >
                  {getPersonName(person)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {!isSubmitted && onSkip ? (
        <button className="secondary-button" type="button" onClick={onSkip}>
          {labels.skip}
        </button>
      ) : null}
      {isSubmitted ? (
        <button className="secondary-button" type="button" onClick={onNextRound}>
          {labels.nextRound}
        </button>
      ) : null}
    </form>
  );
}

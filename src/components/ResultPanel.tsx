import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import type { GuessResult, HistoricalPerson, PersonHints } from '../types';
import { getPlaceFlag } from '../utils/placeFlags';

interface ResultPanelProps {
  result: GuessResult;
  person: HistoricalPerson;
  guess: string;
  hints: PersonHints;
  onNextRound: () => void;
  onMinimize: () => void;
  nextRoundLabel?: string;
}

interface WikipediaSummary {
  extract?: string;
  thumbnail?: {
    source: string;
  };
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
}

interface PersonSummary {
  extract: string;
  imageUrl?: string;
  pageUrl?: string;
}

const getSummaryUrl = (name: string) =>
  `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;

export function ResultPanel({
  result,
  person,
  guess,
  hints,
  onNextRound,
  onMinimize,
  nextRoundLabel = 'Next round',
}: ResultPanelProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const [summary, setSummary] = useState<PersonSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (panelRef.current) {
      L.DomEvent.disableScrollPropagation(panelRef.current);
    }
  }, [result]);

  useEffect(() => {
    if (!result) {
      setSummary(null);
      setSummaryError(null);
      setIsLoadingSummary(false);
      return;
    }

    const controller = new AbortController();

    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      setSummaryError(null);
      setSummary(null);

      try {
        const response = await fetch(getSummaryUrl(person.name), {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Summary unavailable');
        }

        const data = (await response.json()) as WikipediaSummary;

        setSummary({
          extract: data.extract ?? 'No summary available.',
          imageUrl: data.thumbnail?.source,
          pageUrl: data.content_urls?.desktop?.page,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setSummaryError('Wikipedia summary unavailable.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSummary(false);
        }
      }
    };

    void fetchSummary();

    return () => controller.abort();
  }, [person.name, result]);

  if (!result) {
    return null;
  }

  const isCorrect = result === 'correct';
  const wasSkipped = guess === '__SKIPPED__';
  const birthFlag = getPlaceFlag(person.birthPlace);
  const deathFlag = getPlaceFlag(person.deathPlace);

  return (
    <aside ref={panelRef} className={`panel result-panel ${isCorrect ? 'correct' : 'incorrect'}`}>
      <button
        className="panel-minimize"
        type="button"
        onClick={onMinimize}
        aria-label="Minimize panel"
      >
        -
      </button>
      <p className="result-kicker">
        {isCorrect
          ? 'Correct'
          : wasSkipped
            ? 'Skipped!'
            : `Incorrect: you guessed "${guess || 'nothing'}"`}
      </p>
      <button className="secondary-button result-next-button" type="button" onClick={onNextRound}>
        {nextRoundLabel}
      </button>
      <div className="result-title-row">
        {summary?.imageUrl ? (
          <img className="person-image" src={summary.imageUrl} alt={person.name} />
        ) : null}
        <div className="result-title-copy">
          <h2>{person.name}</h2>
          <p>{hints.profession}</p>
          <dl className="result-facts">
            <div className="timeline-point born-point">
              <dt>Born</dt>
              <dd className="timeline-date">{person.birthDate}</dd>
              <dd className="timeline-place">
                <span className="place-flag" title={birthFlag.label} aria-label={birthFlag.label}>
                  {birthFlag.symbol}
                </span>
                {person.birthPlace}
              </dd>
            </div>
            <div className="timeline-point died-point">
              <dt>Died</dt>
              <dd className="timeline-date">{person.deathDate}</dd>
              <dd className="timeline-place">
                <span className="place-flag" title={deathFlag.label} aria-label={deathFlag.label}>
                  {deathFlag.symbol}
                </span>
                {person.deathPlace}
              </dd>
              <dd className="timeline-cause">{hints.methodOfDeath}</dd>
            </div>
            <div className="timeline-arrow" aria-hidden="true">
              <span />
            </div>
          </dl>
        </div>
      </div>
      <div className="person-summary">
        {isLoadingSummary ? <p className="summary-status">Loading Wikipedia summary...</p> : null}
        {summaryError ? <p className="summary-status">{summaryError}</p> : null}
        {summary ? (
          <>
            <p>{summary.extract}</p>
            {summary.pageUrl ? (
              <div className="summary-links">
                <a href={summary.pageUrl} target="_blank" rel="noreferrer">
                  <span className="wikipedia-icon" aria-hidden="true">
                    W
                  </span>
                  Full Profile
                </a>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </aside>
  );
}

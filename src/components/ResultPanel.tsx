import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import type { GuessResult, HistoricalPerson, PersonHints } from '../types';
import type { Language, LocalizedPerson, UiCopy } from '../i18n';
import { getPlaceFlag } from '../utils/placeFlags';

interface ResultPanelProps {
  result: GuessResult;
  person: HistoricalPerson;
  localizedPerson: LocalizedPerson;
  guess: string;
  hints: PersonHints;
  language: Language;
  labels: Pick<
    UiCopy,
    | 'minimizePanel'
    | 'correct'
    | 'skipped'
    | 'incorrectGuess'
    | 'nothing'
    | 'born'
    | 'died'
    | 'loadingSummary'
    | 'summaryUnavailable'
    | 'fullProfile'
    | 'viewSummary'
    | 'backToCard'
  >;
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

const getSummaryUrl = (title: string, language: Language) =>
  `https://${language === 'ja' ? 'ja' : 'en'}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

export function ResultPanel({
  result,
  person,
  localizedPerson,
  guess,
  hints,
  language,
  labels,
  onNextRound,
  onMinimize,
  nextRoundLabel = 'Next round',
}: ResultPanelProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const [summary, setSummary] = useState<PersonSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isMobileSummaryVisible, setIsMobileSummaryVisible] = useState(false);

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
      setIsMobileSummaryVisible(false);
      return;
    }

    const controller = new AbortController();

    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      setSummaryError(null);
      setSummary(null);

      try {
        const response = await fetch(getSummaryUrl(localizedPerson.wikipediaTitle, language), {
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
          extract: data.extract ?? labels.summaryUnavailable,
          imageUrl: data.thumbnail?.source,
          pageUrl: data.content_urls?.desktop?.page,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setSummaryError(labels.summaryUnavailable);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSummary(false);
        }
      }
    };

    void fetchSummary();

    return () => controller.abort();
  }, [labels.summaryUnavailable, language, localizedPerson.wikipediaTitle, result]);

  useEffect(() => {
    setIsMobileSummaryVisible(false);
  }, [result]);

  if (!result) {
    return null;
  }

  const isCorrect = result === 'correct';
  const wasSkipped = guess === '__SKIPPED__';
  const birthFlag = getPlaceFlag(person.birthPlace);
  const deathFlag = getPlaceFlag(person.deathPlace);
  const mobileCardClassName = `result-mobile-card${isMobileSummaryVisible ? ' is-flipped' : ''}`;

  return (
    <aside ref={panelRef} className={`panel result-panel ${isCorrect ? 'correct' : 'incorrect'}`}>
      <button
        className="panel-minimize"
        type="button"
        onClick={onMinimize}
        aria-label={labels.minimizePanel}
      >
        -
      </button>
      <p className="result-kicker">
        {isCorrect
          ? labels.correct
          : wasSkipped
            ? labels.skipped
            : labels.incorrectGuess(guess || labels.nothing)}
      </p>
      <button className="secondary-button result-next-button" type="button" onClick={onNextRound}>
        {nextRoundLabel}
      </button>
      <div className="result-title-row">
        {summary?.imageUrl ? (
          <img className="person-image" src={summary.imageUrl} alt={localizedPerson.name} />
        ) : null}
        <div className="result-title-copy">
          <h2>{localizedPerson.name}</h2>
          <p>{hints.profession}</p>
          <dl className="result-facts">
            <div className="timeline-point born-point">
              <dt>{labels.born}</dt>
              <dd className="timeline-date">{localizedPerson.birthDate}</dd>
              <dd className="timeline-place">
                <span className="place-flag" title={birthFlag.label} aria-label={birthFlag.label}>
                  {birthFlag.symbol}
                </span>
                {localizedPerson.birthPlace}
              </dd>
            </div>
            <div className="timeline-point died-point">
              <dt>{labels.died}</dt>
              <dd className="timeline-date">{localizedPerson.deathDate}</dd>
              <dd className="timeline-place">
                <span className="place-flag" title={deathFlag.label} aria-label={deathFlag.label}>
                  {deathFlag.symbol}
                </span>
                {localizedPerson.deathPlace}
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
        {isLoadingSummary ? <p className="summary-status">{labels.loadingSummary}</p> : null}
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
                  {labels.fullProfile}
                </a>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      <div className="result-mobile-shell">
        <div className={mobileCardClassName}>
          <section className="result-mobile-face result-mobile-front" aria-hidden={isMobileSummaryVisible}>
            {summary?.imageUrl ? (
              <img className="person-image result-mobile-image" src={summary.imageUrl} alt={localizedPerson.name} />
            ) : null}
            <div className="result-mobile-copy">
              <h2>{localizedPerson.name}</h2>
              <p>{hints.profession}</p>
              <dl className="result-facts result-mobile-facts">
                <div className="timeline-point born-point">
                  <dt>{labels.born}</dt>
                  <dd className="timeline-date">{localizedPerson.birthDate}</dd>
                  <dd className="timeline-place">
                    <span className="place-flag" title={birthFlag.label} aria-label={birthFlag.label}>
                      {birthFlag.symbol}
                    </span>
                    {localizedPerson.birthPlace}
                  </dd>
                </div>
                <div className="timeline-point died-point">
                  <dt>{labels.died}</dt>
                  <dd className="timeline-date">{localizedPerson.deathDate}</dd>
                  <dd className="timeline-place">
                    <span className="place-flag" title={deathFlag.label} aria-label={deathFlag.label}>
                      {deathFlag.symbol}
                    </span>
                    {localizedPerson.deathPlace}
                  </dd>
                  <dd className="timeline-cause">{hints.methodOfDeath}</dd>
                </div>
                <div className="timeline-arrow" aria-hidden="true">
                  <span />
                </div>
              </dl>
            </div>
            <button
              className="secondary-button result-mobile-flip-button"
              type="button"
              onClick={() => setIsMobileSummaryVisible(true)}
            >
              {labels.viewSummary}
            </button>
          </section>
          <section className="result-mobile-face result-mobile-back" aria-hidden={!isMobileSummaryVisible}>
            <div className="person-summary result-mobile-summary">
              {isLoadingSummary ? <p className="summary-status">{labels.loadingSummary}</p> : null}
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
                        {labels.fullProfile}
                      </a>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
            <button
              className="secondary-button result-mobile-flip-button"
              type="button"
              onClick={() => setIsMobileSummaryVisible(false)}
            >
              {labels.backToCard}
            </button>
          </section>
        </div>
      </div>
    </aside>
  );
}

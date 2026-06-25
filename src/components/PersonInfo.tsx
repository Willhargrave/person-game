import type { HintKey, HistoricalPerson, PersonHints, RevealedHints } from '../types';
import type { LocalizedPerson, UiCopy } from '../i18n';
import { getPlaceFlag } from '../utils/placeFlags';

interface PersonInfoProps {
  person: HistoricalPerson;
  localizedPerson: LocalizedPerson;
  hints: PersonHints;
  labels: Pick<
    UiCopy,
    | 'appTitle'
    | 'knownClues'
    | 'minimizePanel'
    | 'bornPrompt'
    | 'diedPrompt'
    | 'hintsLabel'
    | 'revealedDetails'
    | 'helperLabels'
  >;
  revealedHints: RevealedHints;
  disabledHints?: RevealedHints;
  displayMode?: 'interactive' | 'easy-daily';
  onRevealHint: (hint: HintKey) => void;
  onMinimize: () => void;
}

const hintIcons: Record<HintKey, string> = {
  methodOfDeath: '☠',
  gender: '⚧',
  profession: '⚒',
};

const hintKeys: HintKey[] = ['methodOfDeath', 'gender', 'profession'];

export function PersonInfo({
  person,
  localizedPerson,
  hints,
  labels,
  revealedHints,
  disabledHints,
  displayMode = 'interactive',
  onRevealHint,
  onMinimize,
}: PersonInfoProps) {
  const birthFlag = getPlaceFlag(person.birthPlace);
  const deathFlag = getPlaceFlag(person.deathPlace);
  const isEasyDailyDisplay = displayMode === 'easy-daily';

  return (
    <section className="panel person-info" aria-label={labels.knownClues}>
      <button
        className="panel-minimize"
        type="button"
        onClick={onMinimize}
        aria-label={labels.minimizePanel}
      >
        -
      </button>
      <div className="panel-heading person-info-reveal person-info-title">
        <h1>{labels.appTitle}</h1>
      </div>
      <dl className="clue-grid">
        <div className="person-info-reveal person-info-birth">
          <dt>{labels.bornPrompt}</dt>
          <dd className="person-info-reveal person-info-birth-date">
            {localizedPerson.birthDate}
          </dd>
          <dd className="place person-info-reveal person-info-birth-place">
            <span className="place-flag" title={birthFlag.label} aria-label={birthFlag.label}>
              {birthFlag.symbol}
            </span>
            {localizedPerson.birthPlace}
          </dd>
        </div>
        <div className="person-info-reveal person-info-death">
          <dt>{labels.diedPrompt}</dt>
          <dd className="person-info-reveal person-info-death-date">
            {localizedPerson.deathDate}
          </dd>
          <dd className="place person-info-reveal person-info-death-place">
            <span className="place-flag" title={deathFlag.label} aria-label={deathFlag.label}>
              {deathFlag.symbol}
            </span>
            {localizedPerson.deathPlace}
          </dd>
          {isEasyDailyDisplay ? (
            <dd className="person-info-reveal person-info-hints">
              <dl className="easy-daily-details" aria-label={labels.revealedDetails}>
                {hintKeys.map((hintKey) => (
                  <div
                    className={`easy-daily-detail person-info-reveal person-info-detail-${hintKey}`}
                    key={hintKey}
                  >
                    <dt>
                      <span className="detail-icon" aria-hidden="true">
                        {hintIcons[hintKey]}
                      </span>{' '}
                      {labels.helperLabels[hintKey]}
                    </dt>
                    <dd>{hints[hintKey]}</dd>
                  </div>
                ))}
              </dl>
            </dd>
          ) : (
            <dd className="person-info-reveal person-info-hints">
              <div className="hint-list" aria-label={labels.hintsLabel}>
                {hintKeys.map((hintKey) => {
                  const isRevealed = revealedHints[hintKey];
                  const isDisabled = isRevealed || Boolean(disabledHints?.[hintKey]);

                  return (
                    <button
                      className={`hint-button ${isRevealed ? 'revealed' : ''} ${
                        disabledHints?.[hintKey] ? 'blocked' : ''
                      }`}
                      type="button"
                      key={hintKey}
                      onClick={() => onRevealHint(hintKey)}
                      disabled={isDisabled}
                    >
                      {isRevealed ? (
                        <>
                          <span>
                            <span className="detail-icon" aria-hidden="true">
                              {hintIcons[hintKey]}
                            </span>{' '}
                            {labels.helperLabels[hintKey]}
                          </span>
                          <strong>{hints[hintKey]}</strong>
                        </>
                      ) : disabledHints?.[hintKey] ? (
                        <>
                          <span>
                            <span className="detail-icon" aria-hidden="true">
                              {hintIcons[hintKey]}
                            </span>{' '}
                            {labels.helperLabels[hintKey]}
                          </span>
                          <strong>Used</strong>
                        </>
                      ) : (
                        <span>
                          <span className="detail-icon" aria-hidden="true">
                            {hintIcons[hintKey]}
                          </span>{' '}
                          {labels.helperLabels[hintKey]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </dd>
          )}
        </div>
      </dl>
    </section>
  );
}

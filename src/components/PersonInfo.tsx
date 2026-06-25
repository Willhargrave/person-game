import type { HintKey, HistoricalPerson, PersonHints, RevealedHints } from '../types';
import { getPlaceFlag } from '../utils/placeFlags';

interface PersonInfoProps {
  person: HistoricalPerson;
  hints: PersonHints;
  revealedHints: RevealedHints;
  disabledHints?: RevealedHints;
  displayMode?: 'interactive' | 'easy-daily';
  onRevealHint: (hint: HintKey) => void;
  onMinimize: () => void;
}

const hintLabels: Record<HintKey, string> = {
  methodOfDeath: 'Cause of Death',
  gender: 'Gender',
  profession: 'Profession',
};

const hintIcons: Record<HintKey, string> = {
  methodOfDeath: '☠',
  gender: '⚧',
  profession: '⚒',
};

const hintKeys: HintKey[] = ['methodOfDeath', 'gender', 'profession'];

export function PersonInfo({
  person,
  hints,
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
    <section className="panel person-info" aria-label="Known clues">
      <button
        className="panel-minimize"
        type="button"
        onClick={onMinimize}
        aria-label="Minimize panel"
      >
        -
      </button>
      <div className="panel-heading person-info-reveal person-info-title">
        <h1>Trace My Life</h1>
      </div>
      <dl className="clue-grid">
        <div className="person-info-reveal person-info-birth">
          <dt>I was born in...</dt>
          <dd className="person-info-reveal person-info-birth-date">{person.birthDate}</dd>
          <dd className="place person-info-reveal person-info-birth-place">
            <span className="place-flag" title={birthFlag.label} aria-label={birthFlag.label}>
              {birthFlag.symbol}
            </span>
            {person.birthPlace}
          </dd>
        </div>
        <div className="person-info-reveal person-info-death">
          <dt>I died in...</dt>
          <dd className="person-info-reveal person-info-death-date">{person.deathDate}</dd>
          <dd className="place person-info-reveal person-info-death-place">
            <span className="place-flag" title={deathFlag.label} aria-label={deathFlag.label}>
              {deathFlag.symbol}
            </span>
            {person.deathPlace}
          </dd>
          {isEasyDailyDisplay ? (
            <dd className="person-info-reveal person-info-hints">
              <dl className="easy-daily-details" aria-label="Revealed details">
                {hintKeys.map((hintKey) => (
                  <div
                    className={`easy-daily-detail person-info-reveal person-info-detail-${hintKey}`}
                    key={hintKey}
                  >
                    <dt>
                      <span aria-hidden="true">{hintIcons[hintKey]}</span> {hintLabels[hintKey]}
                    </dt>
                    <dd>{hints[hintKey]}</dd>
                  </div>
                ))}
              </dl>
            </dd>
          ) : (
            <dd className="person-info-reveal person-info-hints">
              <div className="hint-list" aria-label="Hints">
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
                            <span aria-hidden="true">{hintIcons[hintKey]}</span>{' '}
                            {hintLabels[hintKey]}
                          </span>
                          <strong>{hints[hintKey]}</strong>
                        </>
                      ) : disabledHints?.[hintKey] ? (
                        <>
                          <span>
                            <span aria-hidden="true">{hintIcons[hintKey]}</span>{' '}
                            {hintLabels[hintKey]}
                          </span>
                          <strong>Used</strong>
                        </>
                      ) : (
                        <span>
                          <span aria-hidden="true">{hintIcons[hintKey]}</span> {hintLabels[hintKey]}
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

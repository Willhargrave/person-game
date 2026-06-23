import type { HintKey, HistoricalPerson, PersonHints, RevealedHints } from '../types';
import { getPlaceFlag } from '../utils/placeFlags';

interface PersonInfoProps {
  person: HistoricalPerson;
  hints: PersonHints;
  revealedHints: RevealedHints;
  disabledHints?: RevealedHints;
  onRevealHint: (hint: HintKey) => void;
  onMinimize: () => void;
}

const hintLabels: Record<HintKey, string> = {
  methodOfDeath: 'Cause of Death',
  gender: 'Gender',
  profession: 'Profession',
};

const hintKeys: HintKey[] = ['methodOfDeath', 'gender', 'profession'];

export function PersonInfo({
  person,
  hints,
  revealedHints,
  disabledHints,
  onRevealHint,
  onMinimize,
}: PersonInfoProps) {
  const birthFlag = getPlaceFlag(person.birthPlace);
  const deathFlag = getPlaceFlag(person.deathPlace);

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
      <div className="panel-heading">
        <h1>Trace My Life</h1>
      </div>
      <dl className="clue-grid">
        <div>
          <dt>I was born in...</dt>
          <dd>{person.birthDate}</dd>
          <dd className="place">
            <span className="place-flag" title={birthFlag.label} aria-label={birthFlag.label}>
              {birthFlag.symbol}
            </span>
            {person.birthPlace}
          </dd>
        </div>
        <div>
          <dt>I died in...</dt>
          <dd>{person.deathDate}</dd>
          <dd className="place">
            <span className="place-flag" title={deathFlag.label} aria-label={deathFlag.label}>
              {deathFlag.symbol}
            </span>
            {person.deathPlace}
          </dd>
          <dd>
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
                        <span>{hintLabels[hintKey]}</span>
                        <strong>{hints[hintKey]}</strong>
                      </>
                    ) : disabledHints?.[hintKey] ? (
                      <>
                        <span>{hintLabels[hintKey]}</span>
                        <strong>Used</strong>
                      </>
                    ) : (
                      <span>{hintLabels[hintKey]}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </dd>
        </div>
      </dl>
    </section>
  );
}

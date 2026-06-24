import type { DailyRulesItem } from '../utils/dailyRules';

interface DailyRulesCardProps {
  title: string;
  items: DailyRulesItem[];
  onDismiss: () => void;
}

export function DailyRulesCard({ title, items, onDismiss }: DailyRulesCardProps) {
  return (
    <div className="daily-rules-layer" role="presentation">
      <section
        className="panel daily-rules-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-rules-title"
        aria-describedby="daily-rules-list"
      >
        <h2 id="daily-rules-title">{title}</h2>
        <ul className="daily-rules-list" id="daily-rules-list">
          {items.map((item) => (
            <li key={item.text}>
              <span>{item.text}</span>
              {item.helperIcons ? (
                <span className="daily-rules-icons" aria-label="Available reveals">
                  {item.helperIcons.map((helper) => (
                    <span
                      key={helper.label}
                      className="daily-helper-icon"
                      title={helper.label}
                      aria-label={helper.label}
                    >
                      {helper.icon}
                    </span>
                  ))}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <button type="button" onClick={onDismiss} autoFocus>
          Start Daily
        </button>
      </section>
    </div>
  );
}

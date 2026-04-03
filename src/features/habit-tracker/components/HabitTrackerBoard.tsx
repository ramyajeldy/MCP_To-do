import type React from 'react'
import type { DailyEntry, HabitCard } from '../model'

type HabitTrackerBoardProps = {
  cards: HabitCard[]
  todayEntry: DailyEntry
  onWakeUpTimeChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onYogaMinutesChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onHydrationChange: (delta: number) => void
  onSleepHoursChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function HabitTrackerBoard({
  cards,
  todayEntry,
  onWakeUpTimeChange,
  onYogaMinutesChange,
  onHydrationChange,
  onSleepHoursChange,
}: HabitTrackerBoardProps) {
  return (
    <article className="main-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Today&apos;s Check-in</p>
          <h2>Daily rhythm</h2>
        </div>
        <p className="section-note">Your entries stay saved locally in this browser.</p>
      </div>

      <div className="habit-grid">
        {cards.map((card) => (
          <article
            key={card.id}
            className={[
              'habit-card',
              card.status === 'complete' ? 'is-complete' : '',
              card.id === 'sleep' && card.tone ? `sleep-tone-${card.tone}` : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="habit-header">
              <div>
                <p className="habit-title">{card.title}</p>
                <strong
                  className={card.id === 'sleep' && card.tone ? `sleep-value-${card.tone}` : ''}
                >
                  {card.label}
                </strong>
              </div>
              <span className={card.status === 'complete' ? 'status-pill is-complete' : 'status-pill'}>
                {card.status === 'complete' ? 'On track' : 'Pending'}
              </span>
            </div>

            {card.id === 'wake' ? (
              <label className="field-shell">
                <span>Wake-up time</span>
                <input type="time" value={todayEntry.wakeUpTime} onChange={onWakeUpTimeChange} />
              </label>
            ) : null}

            {card.id === 'yoga' ? (
              <label className="field-shell">
                <span>Yoga minutes</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={todayEntry.yogaMinutes}
                  onChange={onYogaMinutesChange}
                />
              </label>
            ) : null}

            {card.id === 'hydration' ? (
              <div className="hydration-shell">
                <div className="hydration-controls" aria-label="Hydration controls">
                  <button type="button" onClick={() => onHydrationChange(-1)}>
                    -
                  </button>
                  <strong>{todayEntry.hydrationGlasses}</strong>
                  <button type="button" onClick={() => onHydrationChange(1)}>
                    +
                  </button>
                </div>
                <p className="microcopy">Add glasses as you move through the day.</p>
              </div>
            ) : null}

            {card.id === 'sleep' ? (
              <label className="field-shell">
                <span>Sleep hours</span>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={todayEntry.sleepHours}
                  onChange={onSleepHoursChange}
                />
              </label>
            ) : null}

            <p className="habit-helper">{card.helper}</p>
          </article>
        ))}
      </div>
    </article>
  )
}

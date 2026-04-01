import { useEffect, useMemo, useState } from 'react'
import './App.css'

type DailyEntry = {
  wakeUpTime: string
  yogaMinutes: number
  hydrationGlasses: number
  sleepHours: number
}

type EntriesByDate = Record<string, DailyEntry>

type HabitCard = {
  id: 'wake' | 'yoga' | 'hydration' | 'sleep'
  title: string
  label: string
  value: string
  helper: string
  status: 'complete' | 'pending'
  tone?: 'green' | 'yellow' | 'red'
}

type HistoryItem = {
  dateKey: string
  label: string
  summary: string
  completionCount: number
}

const STORAGE_KEY = 'calm-wellness-tracker'

const DEFAULT_ENTRY: DailyEntry = {
  wakeUpTime: '',
  yogaMinutes: 0,
  hydrationGlasses: 0,
  sleepHours: 0,
}

const GOALS = {
  wakeUpBy: '07:00',
  yogaMinutes: 20,
  hydrationGlasses: 8,
  sleepHours: 8,
}

function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function readStoredEntries(): EntriesByDate {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as EntriesByDate

    return parsed ?? {}
  } catch {
    return {}
  }
}

function compareTimes(left: string, right: string): number {
  if (!left) {
    return 1
  }

  return left.localeCompare(right)
}

function isWakeGoalMet(entry: DailyEntry): boolean {
  return Boolean(entry.wakeUpTime) && compareTimes(entry.wakeUpTime, GOALS.wakeUpBy) <= 0
}

function isYogaGoalMet(entry: DailyEntry): boolean {
  return entry.yogaMinutes >= GOALS.yogaMinutes
}

function isHydrationGoalMet(entry: DailyEntry): boolean {
  return entry.hydrationGlasses >= GOALS.hydrationGlasses
}

function isSleepGoalMet(entry: DailyEntry): boolean {
  return entry.sleepHours >= GOALS.sleepHours
}

function getSleepTone(hours: number): 'green' | 'yellow' | 'red' {
  if (hours >= GOALS.sleepHours) {
    return 'green'
  }

  if (hours >= 6) {
    return 'yellow'
  }

  return 'red'
}

function getCompletionCount(entry: DailyEntry): number {
  return [
    isWakeGoalMet(entry),
    isYogaGoalMet(entry),
    isHydrationGoalMet(entry),
    isSleepGoalMet(entry),
  ].filter(Boolean).length
}

function formatToday(dateKey: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`))
}

function formatHistoryLabel(dateKey: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`))
}

function makeSummary(entry: DailyEntry): string {
  const wakeSummary = entry.wakeUpTime ? `Up ${entry.wakeUpTime}` : 'Wake time open'
  const yogaSummary =
    entry.yogaMinutes > 0 ? `Yoga ${entry.yogaMinutes} min` : 'Yoga not logged'
  const hydrationSummary = `${entry.hydrationGlasses}/${GOALS.hydrationGlasses} glasses`
  const sleepSummary = entry.sleepHours > 0 ? `Sleep ${entry.sleepHours}h` : 'Sleep not logged'

  return `${wakeSummary} · ${yogaSummary} · ${hydrationSummary} · ${sleepSummary}`
}

function buildHistory(entries: EntriesByDate, todayKey: string): HistoryItem[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${todayKey}T12:00:00`)
    date.setDate(date.getDate() - index)
    const dateKey = getTodayKey(date)
    const entry = entries[dateKey] ?? DEFAULT_ENTRY

    return {
      dateKey,
      label: index === 0 ? 'Today' : formatHistoryLabel(dateKey),
      summary: makeSummary(entry),
      completionCount: getCompletionCount(entry),
    }
  })
}

function App() {
  const [todayKey] = useState(() => getTodayKey())
  const [entries, setEntries] = useState<EntriesByDate>(() => readStoredEntries())

  const todayEntry = entries[todayKey] ?? DEFAULT_ENTRY

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const reminderMessages = useMemo(() => {
    const messages: string[] = []

    if (!todayEntry.wakeUpTime) {
      messages.push('Log your wake-up time to start the day with a clean baseline.')
    } else if (!isWakeGoalMet(todayEntry)) {
      messages.push(`Wake-up target is ${GOALS.wakeUpBy}. Tomorrow can start a little softer.`)
    }

    if (!isYogaGoalMet(todayEntry)) {
      const minutesLeft = Math.max(GOALS.yogaMinutes - todayEntry.yogaMinutes, 0)
      messages.push(`${minutesLeft} yoga minutes left. Even a short flow counts today.`)
    }

    if (!isHydrationGoalMet(todayEntry)) {
      const glassesLeft = Math.max(GOALS.hydrationGlasses - todayEntry.hydrationGlasses, 0)
      messages.push(`${glassesLeft} glasses left to reach your hydration goal.`)
    }

    if (!isSleepGoalMet(todayEntry)) {
      const hoursLeft = Math.max(GOALS.sleepHours - todayEntry.sleepHours, 0)
      messages.push(`${hoursLeft.toFixed(1)} hours short of your sleep goal. Protect tonight's wind-down.`)
    }

    if (messages.length === 0) {
      messages.push('Everything is on track today. Keep the rhythm gentle and steady.')
    }

    return messages
  }, [todayEntry])

  const completionCount = useMemo(() => getCompletionCount(todayEntry), [todayEntry])

  const cards = useMemo<HabitCard[]>(
    () => [
      {
        id: 'wake',
        title: 'Wake Up',
        label: todayEntry.wakeUpTime || '--:--',
        value: todayEntry.wakeUpTime,
        helper: `Goal: before ${GOALS.wakeUpBy}`,
        status: isWakeGoalMet(todayEntry) ? 'complete' : 'pending',
      },
      {
        id: 'yoga',
        title: 'Yoga',
        label: `${todayEntry.yogaMinutes} min`,
        value: String(todayEntry.yogaMinutes),
        helper: `Goal: ${GOALS.yogaMinutes} minutes`,
        status: isYogaGoalMet(todayEntry) ? 'complete' : 'pending',
      },
      {
        id: 'hydration',
        title: 'Hydration',
        label: `${todayEntry.hydrationGlasses} glasses`,
        value: String(todayEntry.hydrationGlasses),
        helper: `Goal: ${GOALS.hydrationGlasses} glasses`,
        status: isHydrationGoalMet(todayEntry) ? 'complete' : 'pending',
      },
      {
        id: 'sleep',
        title: 'Sleep',
        label: todayEntry.sleepHours > 0 ? `${todayEntry.sleepHours} h` : '0 h',
        value: String(todayEntry.sleepHours),
        helper: `Goal: ${GOALS.sleepHours} hours`,
        status: isSleepGoalMet(todayEntry) ? 'complete' : 'pending',
        tone: getSleepTone(todayEntry.sleepHours),
      },
    ],
    [todayEntry],
  )

  const history = useMemo(() => buildHistory(entries, todayKey), [entries, todayKey])

  function updateTodayEntry(patch: Partial<DailyEntry>) {
    setEntries((currentEntries) => ({
      ...currentEntries,
      [todayKey]: {
        ...(currentEntries[todayKey] ?? DEFAULT_ENTRY),
        ...patch,
      },
    }))
  }

  function handleTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    updateTodayEntry({ wakeUpTime: event.currentTarget.value })
  }

  function handleYogaChange(event: React.ChangeEvent<HTMLInputElement>) {
    updateTodayEntry({ yogaMinutes: Number(event.currentTarget.value) || 0 })
  }

  function handleHydrationChange(delta: number) {
    updateTodayEntry({
      hydrationGlasses: Math.max(todayEntry.hydrationGlasses + delta, 0),
    })
  }

  function handleSleepChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = Number(event.currentTarget.value)
    updateTodayEntry({ sleepHours: Number.isFinite(nextValue) ? nextValue : 0 })
  }

  function resetToday() {
    updateTodayEntry(DEFAULT_ENTRY)
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Calm Wellness Dashboard</p>
          <h1>Small rituals, steady energy.</h1>
          <p className="intro">
            Track today&apos;s wake-up, yoga, hydration, and sleep in one soft, focused check-in.
          </p>
        </div>
        <div className="hero-meta">
          <p className="date-chip">{formatToday(todayKey)}</p>
          <div className="progress-orb" aria-label={`${completionCount} of 4 goals completed`}>
            <strong>{completionCount}/4</strong>
            <span>goals met</span>
          </div>
          <button type="button" className="ghost-button" onClick={resetToday}>
            Reset today
          </button>
        </div>
      </section>

      <section className="dashboard-grid">
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
                    <input type="time" value={todayEntry.wakeUpTime} onChange={handleTimeChange} />
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
                      onChange={handleYogaChange}
                    />
                  </label>
                ) : null}

                {card.id === 'hydration' ? (
                  <div className="hydration-shell">
                    <div className="hydration-controls" aria-label="Hydration controls">
                      <button type="button" onClick={() => handleHydrationChange(-1)}>
                        -
                      </button>
                      <strong>{todayEntry.hydrationGlasses}</strong>
                      <button type="button" onClick={() => handleHydrationChange(1)}>
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
                      onChange={handleSleepChange}
                    />
                  </label>
                ) : null}

                <p className="habit-helper">{card.helper}</p>
              </article>
            ))}
          </div>
        </article>

        <aside className="sidebar-stack">
          <article className="side-card">
            <div className="section-heading compact">
              <div>
                <p className="section-kicker">Reminder Cues</p>
                <h2>Gentle nudges</h2>
              </div>
            </div>
            <ul className="reminder-list">
              {reminderMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </article>

          <article className="side-card">
            <div className="section-heading compact">
              <div>
                <p className="section-kicker">Past 7 Days</p>
                <h2>Recent rhythm</h2>
              </div>
            </div>
            <div className="history-list">
              {history.map((item) => (
                <article key={item.dateKey} className="history-card">
                  <div className="history-topline">
                    <strong>{item.label}</strong>
                    <span>{item.completionCount}/4</span>
                  </div>
                  <p>{item.summary}</p>
                </article>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  )
}

export default App

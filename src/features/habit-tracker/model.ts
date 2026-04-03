export type DailyEntry = {
  wakeUpTime: string
  yogaMinutes: number
  hydrationGlasses: number
  sleepHours: number
}

export type EntriesByDate = Record<string, DailyEntry>

export type HabitCard = {
  id: 'wake' | 'yoga' | 'hydration' | 'sleep'
  title: string
  label: string
  helper: string
  status: 'complete' | 'pending'
  tone?: 'green' | 'yellow' | 'red'
}

export type HistoryItem = {
  dateKey: string
  label: string
  summary: string
  completionCount: number
}

export const STORAGE_KEY = 'calm-wellness-tracker'

export const DEFAULT_ENTRY: DailyEntry = {
  wakeUpTime: '',
  yogaMinutes: 0,
  hydrationGlasses: 0,
  sleepHours: 0,
}

export const GOALS = {
  wakeUpBy: '07:00',
  yogaMinutes: 20,
  hydrationGlasses: 8,
  sleepHours: 8,
} as const

export function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function createEmptyEntries(): EntriesByDate {
  return {}
}

export function readStoredEntries(storage: Storage | undefined): EntriesByDate {
  if (!storage) {
    return createEmptyEntries()
  }

  try {
    const raw = storage.getItem(STORAGE_KEY)

    if (!raw) {
      return createEmptyEntries()
    }

    const parsed = JSON.parse(raw) as EntriesByDate
    return parsed ?? createEmptyEntries()
  } catch {
    return createEmptyEntries()
  }
}

export function writeStoredEntries(storage: Storage | undefined, entries: EntriesByDate): void {
  storage?.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function compareTimes(left: string, right: string): number {
  if (!left) {
    return 1
  }

  return left.localeCompare(right)
}

export function isWakeGoalMet(entry: DailyEntry): boolean {
  return Boolean(entry.wakeUpTime) && compareTimes(entry.wakeUpTime, GOALS.wakeUpBy) <= 0
}

export function isYogaGoalMet(entry: DailyEntry): boolean {
  return entry.yogaMinutes >= GOALS.yogaMinutes
}

export function isHydrationGoalMet(entry: DailyEntry): boolean {
  return entry.hydrationGlasses >= GOALS.hydrationGlasses
}

export function isSleepGoalMet(entry: DailyEntry): boolean {
  return entry.sleepHours >= GOALS.sleepHours
}

export function getSleepTone(hours: number): 'green' | 'yellow' | 'red' {
  if (hours >= GOALS.sleepHours) {
    return 'green'
  }

  if (hours >= 6) {
    return 'yellow'
  }

  return 'red'
}

export function getCompletionCount(entry: DailyEntry): number {
  return [
    isWakeGoalMet(entry),
    isYogaGoalMet(entry),
    isHydrationGoalMet(entry),
    isSleepGoalMet(entry),
  ].filter(Boolean).length
}

export function formatToday(dateKey: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`))
}

export function formatHistoryLabel(dateKey: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`))
}

export function makeSummary(entry: DailyEntry): string {
  const wakeSummary = entry.wakeUpTime ? `Up ${entry.wakeUpTime}` : 'Wake time open'
  const yogaSummary =
    entry.yogaMinutes > 0 ? `Yoga ${entry.yogaMinutes} min` : 'Yoga not logged'
  const hydrationSummary = `${entry.hydrationGlasses}/${GOALS.hydrationGlasses} glasses`
  const sleepSummary = entry.sleepHours > 0 ? `Sleep ${entry.sleepHours}h` : 'Sleep not logged'

  return [wakeSummary, yogaSummary, hydrationSummary, sleepSummary].join(' · ')
}

export function buildHistory(entries: EntriesByDate, todayKey: string): HistoryItem[] {
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

export function buildReminderMessages(entry: DailyEntry): string[] {
  const messages: string[] = []

  if (!entry.wakeUpTime) {
    messages.push('Log your wake-up time to start the day with a clean baseline.')
  } else if (!isWakeGoalMet(entry)) {
    messages.push(`Wake-up target is ${GOALS.wakeUpBy}. Tomorrow can start a little softer.`)
  }

  if (!isYogaGoalMet(entry)) {
    const minutesLeft = Math.max(GOALS.yogaMinutes - entry.yogaMinutes, 0)
    messages.push(`${minutesLeft} yoga minutes left. Even a short flow counts today.`)
  }

  if (!isHydrationGoalMet(entry)) {
    const glassesLeft = Math.max(GOALS.hydrationGlasses - entry.hydrationGlasses, 0)
    messages.push(`${glassesLeft} glasses left to reach your hydration goal.`)
  }

  if (!isSleepGoalMet(entry)) {
    const hoursLeft = Math.max(GOALS.sleepHours - entry.sleepHours, 0)
    messages.push(
      `${hoursLeft.toFixed(1)} hours short of your sleep goal. Protect tonight's wind-down.`,
    )
  }

  if (messages.length === 0) {
    messages.push('Everything is on track today. Keep the rhythm gentle and steady.')
  }

  return messages
}

export function buildHabitCards(entry: DailyEntry): HabitCard[] {
  return [
    {
      id: 'wake',
      title: 'Wake Up',
      label: entry.wakeUpTime || '--:--',
      helper: `Goal: before ${GOALS.wakeUpBy}`,
      status: isWakeGoalMet(entry) ? 'complete' : 'pending',
    },
    {
      id: 'yoga',
      title: 'Yoga',
      label: `${entry.yogaMinutes} min`,
      helper: `Goal: ${GOALS.yogaMinutes} minutes`,
      status: isYogaGoalMet(entry) ? 'complete' : 'pending',
    },
    {
      id: 'hydration',
      title: 'Hydration',
      label: `${entry.hydrationGlasses} glasses`,
      helper: `Goal: ${GOALS.hydrationGlasses} glasses`,
      status: isHydrationGoalMet(entry) ? 'complete' : 'pending',
    },
    {
      id: 'sleep',
      title: 'Sleep',
      label: entry.sleepHours > 0 ? `${entry.sleepHours} h` : '0 h',
      helper: `Goal: ${GOALS.sleepHours} hours`,
      status: isSleepGoalMet(entry) ? 'complete' : 'pending',
      tone: getSleepTone(entry.sleepHours),
    },
  ]
}

export function mergeEntry(current: DailyEntry | undefined, patch: Partial<DailyEntry>): DailyEntry {
  return {
    ...(current ?? DEFAULT_ENTRY),
    ...patch,
  }
}

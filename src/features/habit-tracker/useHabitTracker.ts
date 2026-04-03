import { useEffect, useMemo, useState } from 'react'
import {
  buildHabitCards,
  buildHistory,
  buildReminderMessages,
  DEFAULT_ENTRY,
  getCompletionCount,
  getTodayKey,
  mergeEntry,
  readStoredEntries,
  type DailyEntry,
  type EntriesByDate,
  writeStoredEntries,
} from './model'

export function useHabitTracker() {
  const [todayKey] = useState(() => getTodayKey())
  const [entries, setEntries] = useState<EntriesByDate>(() =>
    readStoredEntries(typeof window === 'undefined' ? undefined : window.localStorage),
  )

  const todayEntry = entries[todayKey] ?? DEFAULT_ENTRY

  useEffect(() => {
    writeStoredEntries(typeof window === 'undefined' ? undefined : window.localStorage, entries)
  }, [entries])

  const reminderMessages = useMemo(() => buildReminderMessages(todayEntry), [todayEntry])
  const completionCount = useMemo(() => getCompletionCount(todayEntry), [todayEntry])
  const cards = useMemo(() => buildHabitCards(todayEntry), [todayEntry])
  const history = useMemo(() => buildHistory(entries, todayKey), [entries, todayKey])

  function updateTodayEntry(patch: Partial<DailyEntry>) {
    setEntries((currentEntries) => ({
      ...currentEntries,
      [todayKey]: mergeEntry(currentEntries[todayKey], patch),
    }))
  }

  function resetToday() {
    updateTodayEntry(DEFAULT_ENTRY)
  }

  return {
    todayKey,
    todayEntry,
    reminderMessages,
    completionCount,
    cards,
    history,
    updateTodayEntry,
    resetToday,
  }
}

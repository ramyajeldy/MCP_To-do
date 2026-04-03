import type React from 'react'
import type { DailyEntry } from './model'

type UseHabitTrackerActionsArgs = {
  todayEntry: DailyEntry
  updateTodayEntry: (patch: Partial<DailyEntry>) => void
}

export function useHabitTrackerActions({
  todayEntry,
  updateTodayEntry,
}: UseHabitTrackerActionsArgs) {
  function handleWakeUpTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    updateTodayEntry({ wakeUpTime: event.currentTarget.value })
  }

  function handleYogaMinutesChange(event: React.ChangeEvent<HTMLInputElement>) {
    updateTodayEntry({ yogaMinutes: Number(event.currentTarget.value) || 0 })
  }

  function handleHydrationChange(delta: number) {
    updateTodayEntry({
      hydrationGlasses: Math.max(todayEntry.hydrationGlasses + delta, 0),
    })
  }

  function handleSleepHoursChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = Number(event.currentTarget.value)
    updateTodayEntry({ sleepHours: Number.isFinite(nextValue) ? nextValue : 0 })
  }

  return {
    handleWakeUpTimeChange,
    handleYogaMinutesChange,
    handleHydrationChange,
    handleSleepHoursChange,
  }
}

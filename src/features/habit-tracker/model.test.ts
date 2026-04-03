import { describe, expect, it } from 'vitest'
import {
  buildHabitCards,
  buildReminderMessages,
  buildHistory,
  DEFAULT_ENTRY,
  getSleepTone,
  mergeEntry,
  type EntriesByDate,
} from './model'

describe('habit tracker model', () => {
  it('classifies sleep tone using the PRD thresholds', () => {
    expect(getSleepTone(5)).toBe('red')
    expect(getSleepTone(6)).toBe('yellow')
    expect(getSleepTone(8)).toBe('green')
  })

  it('builds a complete reminder message when all goals are met', () => {
    const messages = buildReminderMessages({
      wakeUpTime: '06:45',
      yogaMinutes: 20,
      hydrationGlasses: 8,
      sleepHours: 8,
    })

    expect(messages).toEqual(['Everything is on track today. Keep the rhythm gentle and steady.'])
  })

  it('builds a seven-day history from date-keyed entries', () => {
    const entries: EntriesByDate = {
      '2026-04-01': {
        wakeUpTime: '06:50',
        yogaMinutes: 20,
        hydrationGlasses: 8,
        sleepHours: 8,
      },
    }

    const history = buildHistory(entries, '2026-04-01')

    expect(history).toHaveLength(7)
    expect(history[0]?.label).toBe('Today')
    expect(history[0]?.completionCount).toBe(4)
    expect(history[1]?.summary).toContain('Wake time open')
  })

  it('merges patches onto the default entry shape', () => {
    expect(mergeEntry(undefined, { hydrationGlasses: 3 })).toEqual({
      ...DEFAULT_ENTRY,
      hydrationGlasses: 3,
    })
  })

  it('builds the four dashboard cards from one entry', () => {
    const cards = buildHabitCards(DEFAULT_ENTRY)

    expect(cards.map((card) => card.id)).toEqual(['wake', 'yoga', 'hydration', 'sleep'])
  })
})

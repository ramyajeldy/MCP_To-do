import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const STORAGE_KEY = 'calm-wellness-tracker'
const TODAY_KEY = '2026-04-01'
const YESTERDAY_KEY = '2026-03-31'

function formatToday(dateKey: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`))
}

function formatHistoryLabel(dateKey: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`))
}

function setStoredEntries(entries: unknown) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

describe('habit tracker dashboard', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

it("opens on today's dashboard with the current date and default reminder cues", () => {
    render(<App />)

    expect(screen.getByText('Calm Wellness Dashboard')).toBeInTheDocument()
    expect(screen.getByText(formatToday(TODAY_KEY))).toBeInTheDocument()
    expect(screen.getByLabelText('0 of 4 goals completed')).toBeInTheDocument()
    expect(
      screen.getByText('Log your wake-up time to start the day with a clean baseline.'),
    ).toBeInTheDocument()
    expect(screen.getByText('20 yoga minutes left. Even a short flow counts today.')).toBeInTheDocument()
    expect(screen.getByText('8 glasses left to reach your hydration goal.')).toBeInTheDocument()
    expect(
      screen.getByText("8.0 hours short of your sleep goal. Protect tonight's wind-down."),
    ).toBeInTheDocument()
  })

  it('loads persisted values for today and shows the all-goals-met state', () => {
    setStoredEntries({
      [TODAY_KEY]: {
        wakeUpTime: '06:45',
        yogaMinutes: 20,
        hydrationGlasses: 8,
        sleepHours: 8,
      },
    })

    render(<App />)

    expect(screen.getByLabelText('Wake-up time')).toHaveValue('06:45')
    expect(screen.getByLabelText('Yoga minutes')).toHaveValue(20)
    expect(screen.getByLabelText('Sleep hours')).toHaveValue(8)
    expect(within(screen.getByLabelText('Hydration controls')).getByText('8')).toBeInTheDocument()
    expect(screen.getByLabelText('4 of 4 goals completed')).toBeInTheDocument()
    expect(
      screen.getByText('Everything is on track today. Keep the rhythm gentle and steady.'),
    ).toBeInTheDocument()
  })

  it('persists input changes through the visible dashboard controls', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Wake-up time'), { target: { value: '06:30' } })
    fireEvent.change(screen.getByLabelText('Yoga minutes'), { target: { value: '25' } })

    const hydrationControls = screen.getByLabelText('Hydration controls')
    const [, incrementButton] = within(hydrationControls).getAllByRole('button')

    for (let count = 0; count < 8; count += 1) {
      fireEvent.click(incrementButton)
    }

    fireEvent.change(screen.getByLabelText('Sleep hours'), { target: { value: '8' } })

    expect(screen.getAllByText('On track')).toHaveLength(4)
    expect(screen.getByLabelText('4 of 4 goals completed')).toBeInTheDocument()

    const storedEntries = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')

    expect(storedEntries[TODAY_KEY]).toEqual({
      wakeUpTime: '06:30',
      yogaMinutes: 25,
      hydrationGlasses: 8,
      sleepHours: 8,
    })
  })

  it('applies the PRD sleep thresholds to the sleep habit card', () => {
    render(<App />)

    const sleepInput = screen.getByLabelText('Sleep hours')
    const sleepCard = screen.getByText('Sleep').closest('article')

    expect(sleepCard).not.toBeNull()

    fireEvent.change(sleepInput, { target: { value: '5' } })
    expect(sleepCard).toHaveClass('sleep-tone-red')

    fireEvent.change(sleepInput, { target: { value: '6.5' } })
    expect(sleepCard).toHaveClass('sleep-tone-yellow')

    fireEvent.change(sleepInput, { target: { value: '8' } })
    expect(sleepCard).toHaveClass('sleep-tone-green')
  })

  it("resets only today's data and preserves earlier history", () => {
    setStoredEntries({
      [TODAY_KEY]: {
        wakeUpTime: '06:30',
        yogaMinutes: 25,
        hydrationGlasses: 8,
        sleepHours: 8,
      },
      [YESTERDAY_KEY]: {
        wakeUpTime: '06:50',
        yogaMinutes: 15,
        hydrationGlasses: 6,
        sleepHours: 7,
      },
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Reset today' }))

    expect(screen.getByLabelText('Wake-up time')).toHaveValue('')
    expect(screen.getByLabelText('Yoga minutes')).toHaveValue(0)
    expect(screen.getByLabelText('Sleep hours')).toHaveValue(0)
    expect(within(screen.getByLabelText('Hydration controls')).getByText('0')).toBeInTheDocument()
    expect(screen.getByLabelText('0 of 4 goals completed')).toBeInTheDocument()

    const storedEntries = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')

    expect(storedEntries[TODAY_KEY]).toEqual({
      wakeUpTime: '',
      yogaMinutes: 0,
      hydrationGlasses: 0,
      sleepHours: 0,
    })
    expect(storedEntries[YESTERDAY_KEY]).toEqual({
      wakeUpTime: '06:50',
      yogaMinutes: 15,
      hydrationGlasses: 6,
      sleepHours: 7,
    })
  })

  it('shows a read-only seven-day summary with recent day snapshots', () => {
    setStoredEntries({
      [YESTERDAY_KEY]: {
        wakeUpTime: '06:50',
        yogaMinutes: 25,
        hydrationGlasses: 8,
        sleepHours: 8,
      },
    })

    render(<App />)

    expect(screen.getByText('Past 7 Days')).toBeInTheDocument()
    expect(screen.getByText('Recent rhythm')).toBeInTheDocument()
    expect(screen.getByText(formatHistoryLabel(YESTERDAY_KEY))).toBeInTheDocument()
    expect(
      screen.getByText('Up 06:50 · Yoga 25 min · 8/8 glasses · Sleep 8h'),
    ).toBeInTheDocument()
    expect(document.querySelectorAll('.history-card')).toHaveLength(7)
  })
})

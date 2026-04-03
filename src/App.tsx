import './App.css'
import { HabitTrackerBoard } from './features/habit-tracker/components/HabitTrackerBoard'
import { HeroPanel } from './features/habit-tracker/components/HeroPanel'
import { HabitTrackerSidebar } from './features/habit-tracker/components/HabitTrackerSidebar'
import { formatToday } from './features/habit-tracker/model'
import { useHabitTrackerActions } from './features/habit-tracker/useHabitTrackerActions'
import { useHabitTracker } from './features/habit-tracker/useHabitTracker'

function App() {
  const {
    todayKey,
    todayEntry,
    reminderMessages,
    completionCount,
    cards,
    history,
    updateTodayEntry,
    resetToday,
  } = useHabitTracker()
  const {
    handleWakeUpTimeChange,
    handleYogaMinutesChange,
    handleHydrationChange,
    handleSleepHoursChange,
  } = useHabitTrackerActions({
    todayEntry,
    updateTodayEntry,
  })

  return (
    <main className="app-shell">
      <HeroPanel
        formattedToday={formatToday(todayKey)}
        completionCount={completionCount}
        onResetToday={resetToday}
      />

      <section className="dashboard-grid">
        <HabitTrackerBoard
          cards={cards}
          todayEntry={todayEntry}
          onWakeUpTimeChange={handleWakeUpTimeChange}
          onYogaMinutesChange={handleYogaMinutesChange}
          onHydrationChange={handleHydrationChange}
          onSleepHoursChange={handleSleepHoursChange}
        />
        <HabitTrackerSidebar reminderMessages={reminderMessages} history={history} />
      </section>
    </main>
  )
}

export default App

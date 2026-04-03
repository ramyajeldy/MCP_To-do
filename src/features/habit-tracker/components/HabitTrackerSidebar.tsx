import type { HistoryItem } from '../model'

type HabitTrackerSidebarProps = {
  reminderMessages: string[]
  history: HistoryItem[]
}

export function HabitTrackerSidebar({
  reminderMessages,
  history,
}: HabitTrackerSidebarProps) {
  return (
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
  )
}

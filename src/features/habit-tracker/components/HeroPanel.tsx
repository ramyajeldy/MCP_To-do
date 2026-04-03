type HeroPanelProps = {
  formattedToday: string
  completionCount: number
  onResetToday: () => void
}

export function HeroPanel({ formattedToday, completionCount, onResetToday }: HeroPanelProps) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">Calm Wellness Dashboard</p>
        <h1>Small rituals, steady energy.</h1>
        <p className="intro">
          Track today&apos;s wake-up, yoga, hydration, and sleep in one soft, focused check-in.
        </p>
      </div>
      <div className="hero-meta">
        <p className="date-chip">{formattedToday}</p>
        <div className="progress-orb" aria-label={`${completionCount} of 4 goals completed`}>
          <strong>{completionCount}/4</strong>
          <span>goals met</span>
        </div>
        <button type="button" className="ghost-button" onClick={onResetToday}>
          Reset today
        </button>
      </div>
    </section>
  )
}

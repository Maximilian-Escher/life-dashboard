import StreakGrid from '../StreakGrid.jsx'

// Gemeinsame Karte für manuelle Habit-Toggles (aktuell Kreatin + Training) –
// Titel, Beschriftungen und Datenquelle kommen als Props. Kurzer
// "Erfolgs-Glow" beim Abhaken (wiederkehrendes Motiv, siehe index.css) +
// Haptik-Feedback auf unterstützten Geräten.
export default function HabitToggleWidget({ title, doneLabel, notDoneLabel, dates, today, streak, error, onToggle }) {
  function handleToggle() {
    if (navigator.vibrate) navigator.vibrate(20)
    onToggle()
  }

  return (
    <section
      className="glass-panel h-full rounded-2xl p-5"
      style={today ? { '--glow-color': 'var(--color-accent)' } : undefined}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[12.5px] font-semibold text-zinc-400">{title}</h2>
        <span className="text-xs text-zinc-500">
          {streak > 0 ? `${streak} ${streak === 1 ? 'Tag' : 'Tage'} Streak` : 'Noch keine Streak'}
        </span>
      </div>
      <button
        onClick={handleToggle}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.06]"
      >
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
          style={{
            borderColor: today ? 'var(--color-accent)' : 'var(--glass-border)',
            background: today ? 'var(--color-accent)' : 'transparent',
          }}
        >
          {today && (
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={today ? 'text-zinc-200' : 'text-zinc-400'}>{today ? doneLabel : notDoneLabel}</span>
      </button>
      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
      <div className="mt-4">
        <StreakGrid doneDates={dates} weeks={12} />
      </div>
    </section>
  )
}

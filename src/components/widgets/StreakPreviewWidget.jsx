import StreakGrid from '../StreakGrid.jsx'

// Kompakte Vorschau des Haupt-Habits (Kreatin). Die volle, umschaltbare
// Ansicht aller Habits gibt's auf der Streaks-Seite.
export default function StreakPreviewWidget({ dates }) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="mb-3 text-sm font-medium text-zinc-300">Streak-Grid – Kreatin</h2>
      <StreakGrid doneDates={dates} weeks={12} />
    </section>
  )
}

import StreakGrid from '../StreakGrid.jsx'

// Kompakte Vorschau des Haupt-Habits (Kreatin). Die volle, umschaltbare
// Ansicht aller Habits gibt's auf der Streaks-Seite.
export default function StreakPreviewWidget({ dates }) {
  return (
    <section className="glass-panel h-full rounded-2xl p-5">
      <h2 className="mb-3 text-[12.5px] font-semibold text-zinc-400">Streak-Grid – Kreatin</h2>
      <StreakGrid doneDates={dates} weeks={12} />
    </section>
  )
}

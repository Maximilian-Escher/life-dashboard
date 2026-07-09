import { calculateLevel } from '../../lib/stats.js'

export default function StatsWidget({ statCards }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-zinc-300">Stats</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.key} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs text-zinc-500">{s.label}</p>
            {s.value == null ? (
              <p className="mt-1 text-sm text-zinc-500">Noch keine Daten</p>
            ) : (
              <>
                <p className="mt-1 text-xl font-semibold text-white">
                  {s.value} <span className="text-xs font-normal text-zinc-500">/ 100</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500">Level {calculateLevel(s.value).level}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

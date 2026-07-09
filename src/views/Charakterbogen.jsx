import { stats } from '../data/dummyData.js'

export default function Charakterbogen() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Charakterbogen</h1>
        <p className="text-sm text-zinc-500">Platzhalter-Daten – noch keine Live-Integration</p>
      </header>

      <div className="flex flex-col gap-4">
        {stats.map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-white">{s.label}</h2>
              <span className="text-xs text-zinc-500">Level {s.level}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: `${s.value}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>{s.value} / 100</span>
              <span>
                XP {s.xp} / {s.xpToNext}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-[var(--color-border)] p-5 text-sm text-zinc-500">
        Trendlinie (letzte 30/90 Tage) folgt, sobald echte Daten angebunden sind.
      </div>
    </div>
  )
}

import { finance } from '../data/dummyData.js'

export default function Finanzen() {
  const progress = Math.round((finance.currentValue / finance.goalValue) * 100)
  const maxHistory = Math.max(...finance.history.map((h) => h.value))

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Finanzen</h1>
        <p className="text-sm text-zinc-500">Platzhalter-Daten – noch keine Live-Integration</p>
      </header>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-xs text-zinc-500">Portfolio-Wert</p>
        <p className="mt-1 text-2xl font-semibold text-white">
          {finance.currentValue.toLocaleString('de-DE')} €
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Ziel: {finance.goalValue.toLocaleString('de-DE')} €
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">{progress}% zum Ziel</p>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">Verlauf</h2>
        <div className="flex h-32 gap-3">
          {finance.history.map((h) => (
            <div key={h.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-[var(--color-accent)]"
                  style={{ height: `${(h.value / maxHistory) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-zinc-500">{h.month}</span>
            </div>
          ))}
        </div>
      </section>

      <button className="self-start rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-zinc-300 hover:text-white">
        + Portfolio-Update eintragen
      </button>
    </div>
  )
}

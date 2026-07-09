import { stats, recovery, dailyQuests } from '../data/dummyData.js'

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Übersicht</h1>
        <p className="text-sm text-zinc-500">Platzhalter-Daten – noch keine Live-Integration</p>
      </header>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Recovery</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              recovery.status === 'buff'
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            {recovery.status === 'buff' ? 'Buff' : 'Debuff'}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)]"
            style={{ width: `${recovery.score}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">{recovery.note}</p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Stats</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.key}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <p className="text-xs text-zinc-500">{s.label}</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {s.value} <span className="text-xs font-normal text-zinc-500">/ 100</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">Level {s.level}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Daily Quests</h2>
        <ul className="flex flex-col gap-2">
          {dailyQuests.map((q) => (
            <li key={q.id} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  q.done
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                    : 'border-[var(--color-border)]'
                }`}
              >
                {q.done && (
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-white">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className={q.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}>
                {q.label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

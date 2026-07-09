import { useState } from 'react'
import { habits } from '../data/dummyData.js'

const WEEKS = 52
const DAYS = 7

function seedRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export default function Streaks() {
  const [activeHabit, setActiveHabit] = useState(habits[0].key)

  const cells = Array.from({ length: WEEKS * DAYS }, (_, i) =>
    seedRandom(i + activeHabit.length) > 0.4,
  )

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Streaks</h1>
        <p className="text-sm text-zinc-500">Platzhalter-Daten – noch keine Live-Integration</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {habits.map((h) => (
          <button
            key={h.key}
            onClick={() => setActiveHabit(h.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeHabit === h.key
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface)] text-zinc-400 hover:text-white'
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-4 flex gap-6 text-sm">
          <div>
            <p className="text-xs text-zinc-500">Aktuelle Streak</p>
            <p className="font-semibold text-white">6 Tage</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Längste Streak</p>
            <p className="font-semibold text-white">21 Tage</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ width: WEEKS * 14 }}>
            {cells.map((filled, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-sm ${
                  filled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

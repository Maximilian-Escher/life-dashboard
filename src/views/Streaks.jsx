import { useState } from 'react'
import { habits } from '../data/dummyData.js'
import { getLoggedDates, getCurrentStreak, getLongestStreak } from '../lib/habitLog.js'
import StreakGrid from '../components/StreakGrid.jsx'

export default function Streaks() {
  const [activeHabit, setActiveHabit] = useState(habits[0].key)

  const doneDates = getLoggedDates(activeHabit)
  const currentStreak = getCurrentStreak(doneDates)
  const longestStreak = getLongestStreak(doneDates)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Streaks</h1>
        <p className="text-sm text-zinc-500">
          {activeHabit === 'creatine'
            ? 'Lokal gespeicherte Daten'
            : 'Noch kein Tracking für dieses Habit – Grid ist leer.'}
        </p>
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
            <p className="font-semibold text-white">
              {currentStreak} {currentStreak === 1 ? 'Tag' : 'Tage'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Längste Streak</p>
            <p className="font-semibold text-white">
              {longestStreak} {longestStreak === 1 ? 'Tag' : 'Tage'}
            </p>
          </div>
        </div>

        <StreakGrid doneDates={doneDates} weeks={52} />
      </div>
    </div>
  )
}

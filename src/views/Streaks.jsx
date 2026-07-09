import { useEffect, useState } from 'react'
import { habits } from '../data/dummyData.js'
import { getLoggedDates, getCurrentStreak, getLongestStreak } from '../lib/habitLog.js'
import { getOuraHabitDates } from '../lib/stats.js'
import { isConnected } from '../lib/ouraAuth.js'
import { fetchOuraDays } from '../lib/ouraApi.js'
import StreakGrid from '../components/StreakGrid.jsx'

const GRID_WEEKS = 52
const FULL_YEAR_DAYS = GRID_WEEKS * 7

export default function Streaks() {
  const [activeHabit, setActiveHabit] = useState(habits[0].key)
  const [doneDates, setDoneDates] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const habit = habits.find((h) => h.key === activeHabit)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const load =
      habit.source === 'oura'
        ? isConnected()
          ? fetchOuraDays(FULL_YEAR_DAYS).then(({ days }) => getOuraHabitDates(days, habit.key))
          : Promise.resolve(new Set())
        : getLoggedDates(habit.key)

    load
      .then((dates) => {
        if (!cancelled) setDoneDates(dates)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeHabit])

  const currentStreak = getCurrentStreak(doneDates)
  const longestStreak = getLongestStreak(doneDates)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Streaks</h1>
        <p className="text-sm text-zinc-500">
          {loading
            ? 'Lade Daten…'
            : habit.source === 'oura'
              ? isConnected()
                ? 'Automatisch aus Oura'
                : 'Noch nicht mit Oura verbunden (siehe Home)'
              : 'Live-Daten aus Supabase'}
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

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

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

        <StreakGrid doneDates={doneDates} weeks={GRID_WEEKS} />
      </div>
    </div>
  )
}

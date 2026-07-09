import { useEffect, useState } from 'react'
import { isConnected } from '../lib/ouraAuth.js'
import { fetchOuraDays } from '../lib/ouraApi.js'
import { getLoggedDates } from '../lib/habitLog.js'
import { getPortfolioSnapshots, getPortfolioGoal } from '../lib/portfolio.js'
import {
  TRACKED_HABIT_KEYS,
  calculateVitalitaet,
  calculateDisziplin,
  calculateWealth,
  buildVitalitaetTrend,
  buildDisziplinTrend,
  buildWealthTrend,
} from '../lib/stats.js'
import StatDetailCard from '../components/StatDetailCard.jsx'

export default function Charakterbogen() {
  const [trendDays, setTrendDays] = useState(30)
  const [ouraDays, setOuraDays] = useState(null)
  const [habitDates, setHabitDates] = useState({})
  const [snapshots, setSnapshots] = useState([])
  const [goal, setGoal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const habitsPromise = Promise.all(
      TRACKED_HABIT_KEYS.map((key) => getLoggedDates(key).then((dates) => [key, dates])),
    ).then((entries) => {
      if (!cancelled) setHabitDates(Object.fromEntries(entries))
    })

    const ouraPromise = isConnected()
      ? fetchOuraDays(trendDays).then(({ days }) => {
          if (!cancelled) setOuraDays(days)
        })
      : Promise.resolve().then(() => {
          if (!cancelled) setOuraDays(null)
        })

    const portfolioPromise = Promise.all([getPortfolioSnapshots(trendDays), getPortfolioGoal()]).then(
      ([snaps, g]) => {
        if (!cancelled) {
          setSnapshots(snaps)
          setGoal(g)
        }
      },
    )

    Promise.all([habitsPromise, ouraPromise, portfolioPromise])
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [trendDays])

  const vitalitaet = ouraDays ? calculateVitalitaet(ouraDays.slice(-7)) : null
  const vitalitaetTrend = ouraDays ? buildVitalitaetTrend(ouraDays) : []

  const disziplin = calculateDisziplin(habitDates, 30)
  const disziplinTrend = buildDisziplinTrend(habitDates, trendDays)

  const latestSnapshot = snapshots[snapshots.length - 1]
  const wealth = calculateWealth(latestSnapshot?.value, goal)
  const wealthTrend = buildWealthTrend(snapshots, goal)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Charakterbogen</h1>
          <p className="text-sm text-zinc-500">{loading ? 'Lade Daten…' : 'Live-Berechnung'}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {[30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setTrendDays(d)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                trendDays === d
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface)] text-zinc-400 hover:text-white'
              }`}
            >
              {d} Tage
            </button>
          ))}
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <StatDetailCard
          label="Vitalität"
          value={vitalitaet}
          trend={vitalitaetTrend}
          tooltipText="Gewichteter Durchschnitt der letzten 7 Tage aus Oura: 40% Readiness-Score, 30% Schlaf-Score, 30% Schritte (Ziel: 10.000/Tag)."
          emptyHint={!isConnected() ? 'Noch nicht mit Oura verbunden (siehe Home).' : 'Noch keine Oura-Daten.'}
        />
        <StatDetailCard
          label="Disziplin"
          value={disziplin}
          trend={disziplinTrend}
          tooltipText="Anteil erfüllter Tage der letzten 30 Tage über alle getrackten Habits (aktuell: Kreatin)."
        />
        <StatDetailCard
          label="Wealth"
          value={wealth}
          trend={wealthTrend}
          tooltipText={`Fortschritt des zuletzt eingetragenen Portfolio-Werts zur Zielsumme${
            goal ? ` von ${goal.toLocaleString('de-DE')} €` : ''
          }.`}
          emptyHint="Noch kein Portfolio-Wert eingetragen (siehe Finanzen)."
        />
      </div>
    </div>
  )
}

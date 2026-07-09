import { useEffect, useState } from 'react'
import { recovery as dummyRecovery, dailyQuests } from '../data/dummyData.js'
import { connectOura, isConnected, clearTokens } from '../lib/ouraAuth.js'
import { fetchOuraLast7Days } from '../lib/ouraApi.js'
import { getLoggedDates, toggleDay, todayIso, getCurrentStreak } from '../lib/habitLog.js'
import { getPortfolioSnapshots, getPortfolioGoal } from '../lib/portfolio.js'
import { calculateVitalitaet, calculateDisziplin, calculateWealth, calculateLevel } from '../lib/stats.js'
import StreakGrid from '../components/StreakGrid.jsx'

const weekdayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'short' })

function recoveryFromScore(score) {
  if (score >= 85) return { status: 'buff', note: 'Sehr gute Erholung letzte Nacht.' }
  if (score >= 70) return { status: 'buff', note: 'Gute Erholung letzte Nacht.' }
  if (score >= 50) return { status: 'neutral', note: 'Mittlere Erholung – heute moderat trainieren.' }
  return { status: 'debuff', note: 'Niedrige Erholung – intensives Training heute suboptimal.' }
}

export default function Home() {
  const [connected, setConnected] = useState(isConnected())
  const [connecting, setConnecting] = useState(false)
  const [ouraDays, setOuraDays] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [creatineDates, setCreatineDates] = useState(new Set())
  const [creatineError, setCreatineError] = useState(null)
  const [portfolio, setPortfolio] = useState({ value: null, goal: null })

  useEffect(() => {
    if (!connected) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchOuraLast7Days()
      .then(({ days }) => {
        if (!cancelled) setOuraDays(days)
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
  }, [connected])

  useEffect(() => {
    let cancelled = false
    getLoggedDates('creatine')
      .then((dates) => {
        if (!cancelled) setCreatineDates(dates)
      })
      .catch((err) => {
        if (!cancelled) setCreatineError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([getPortfolioSnapshots(3650), getPortfolioGoal()])
      .then(([snapshots, goal]) => {
        if (!cancelled) setPortfolio({ value: snapshots[snapshots.length - 1]?.value ?? null, goal })
      })
      .catch(() => {
        // Wealth zeigt dann einfach "Noch keine Daten" – kein eigener Fehlerbanner nötig
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleConnect() {
    setError(null)
    setConnecting(true)
    try {
      await connectOura()
      setConnected(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setConnecting(false)
    }
  }

  function handleDisconnect() {
    clearTokens()
    setConnected(false)
    setOuraDays(null)
  }

  async function handleToggleCreatine() {
    setCreatineError(null)
    try {
      const dates = await toggleDay('creatine', todayIso())
      setCreatineDates(dates)
    } catch (err) {
      setCreatineError(err.message)
    }
  }

  const creatineToday = creatineDates.has(todayIso())
  const creatineStreak = getCurrentStreak(creatineDates)

  // Disziplin nutzt hier direkt die schon geladenen Kreatin-Daten. Sobald
  // TRACKED_HABIT_KEYS (stats.js) mehr als 'creatine' enthält, hier die
  // zusätzlichen Habits ebenfalls laden und in dieses Objekt aufnehmen.
  const statCards = [
    { key: 'vitalitaet', label: 'Vitalität', value: ouraDays ? calculateVitalitaet(ouraDays) : null },
    { key: 'disziplin', label: 'Disziplin', value: calculateDisziplin({ creatine: creatineDates }, 30) },
    { key: 'wealth', label: 'Wealth', value: calculateWealth(portfolio.value, portfolio.goal) },
  ]

  const latestDay = ouraDays?.[ouraDays.length - 1]
  const recoveryScore = latestDay?.readinessScore
  const recoveryInfo = recoveryScore != null ? recoveryFromScore(recoveryScore) : null
  const recoveryBadge = recoveryInfo?.status ?? (dummyRecovery.status === 'buff' ? 'buff' : 'debuff')
  const recoveryBarValue = recoveryScore ?? dummyRecovery.score
  const recoveryNote = loading
    ? 'Lade Oura-Daten…'
    : (recoveryInfo?.note ?? dummyRecovery.note)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Übersicht</h1>
          <p className="text-sm text-zinc-500">
            {connected ? 'Live-Daten von Oura' : 'Platzhalter-Daten – noch keine Live-Integration'}
          </p>
        </div>
        {connected ? (
          <button
            onClick={handleDisconnect}
            className="shrink-0 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Oura trennen
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="shrink-0 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-soft)] disabled:opacity-60"
          >
            {connecting ? 'Verbinde…' : 'Mit Oura verbinden'}
          </button>
        )}
      </header>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Recovery</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              recoveryBadge === 'buff'
                ? 'bg-emerald-500/15 text-emerald-400'
                : recoveryBadge === 'neutral'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            {recoveryBadge === 'buff' ? 'Buff' : recoveryBadge === 'neutral' ? 'Neutral' : 'Debuff'}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)]"
            style={{ width: `${recoveryBarValue}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">{recoveryNote}</p>
      </section>

      {connected && ouraDays && ouraDays.length > 0 && (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Letzte 7 Tage (Oura)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500">
                  <th className="pb-2 font-normal">Tag</th>
                  <th className="pb-2 font-normal">Schlaf</th>
                  <th className="pb-2 font-normal">Readiness</th>
                  <th className="pb-2 font-normal">Schritte</th>
                </tr>
              </thead>
              <tbody>
                {ouraDays.map((d) => (
                  <tr key={d.day} className="border-t border-[var(--color-border)]">
                    <td className="py-2 text-zinc-400">{weekdayFormatter.format(new Date(d.day))}</td>
                    <td className="py-2 text-zinc-200">{d.sleepScore ?? '–'}</td>
                    <td className="py-2 text-zinc-200">{d.readinessScore ?? '–'}</td>
                    <td className="py-2 text-zinc-200">
                      {d.steps != null ? d.steps.toLocaleString('de-DE') : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Kreatin</h2>
          <span className="text-xs text-zinc-500">
            {creatineStreak > 0 ? `${creatineStreak} ${creatineStreak === 1 ? 'Tag' : 'Tage'} Streak` : 'Noch keine Streak'}
          </span>
        </div>
        <button
          onClick={handleToggleCreatine}
          className="flex w-full items-center gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-hover)]"
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
              creatineToday
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                : 'border-[var(--color-border)]'
            }`}
          >
            {creatineToday && (
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white">
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
          <span className={creatineToday ? 'text-zinc-200' : 'text-zinc-400'}>
            {creatineToday ? 'Heute genommen' : 'Heute noch nicht genommen'}
          </span>
        </button>
        {creatineError && <p className="mt-2 text-xs text-rose-400">{creatineError}</p>}
        <div className="mt-4">
          <StreakGrid doneDates={creatineDates} weeks={12} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Stats</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {statCards.map((s) => (
            <div
              key={s.key}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
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

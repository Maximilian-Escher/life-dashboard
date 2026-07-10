import { useEffect, useState } from 'react'
import {
  getPortfolioSnapshots,
  getPortfolioGoal,
  upsertPortfolioSnapshot,
  setPortfolioGoal,
  DEFAULT_GOAL,
} from '../lib/portfolio.js'
import { todayIso } from '../lib/habitLog.js'

export default function Finanzen() {
  const [snapshots, setSnapshots] = useState([])
  const [goal, setGoal] = useState(DEFAULT_GOAL)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [valueInput, setValueInput] = useState('')
  const [dateInput, setDateInput] = useState(todayIso())
  const [saving, setSaving] = useState(false)

  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [snaps, g] = await Promise.all([getPortfolioSnapshots(3650), getPortfolioGoal()])
      setSnapshots(snaps)
      setGoal(g)
      setGoalInput(String(g))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleAddSnapshot(e) {
    e.preventDefault()
    const value = Number(valueInput)
    if (!Number.isFinite(value) || value < 0) return

    setSaving(true)
    setError(null)
    try {
      await upsertPortfolioSnapshot(value, dateInput)
      setValueInput('')
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveGoal(e) {
    e.preventDefault()
    const value = Number(goalInput)
    if (!Number.isFinite(value) || value <= 0) return

    setSavingGoal(true)
    setError(null)
    try {
      await setPortfolioGoal(value)
      setGoal(value)
      setEditingGoal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingGoal(false)
    }
  }

  const latest = snapshots[snapshots.length - 1]
  const progress = latest ? Math.min(100, Math.round((latest.value / goal) * 100)) : 0
  const recentHistory = snapshots.slice(-12)
  const maxHistory = Math.max(1, ...recentHistory.map((s) => s.value))

  return (
    <div className="flex flex-col gap-7">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-white">Finanzen</h1>
        <p className="mt-1.5 text-sm text-zinc-500">{loading ? 'Lade Daten…' : 'Live-Daten aus Supabase'}</p>
      </header>

      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">{error}</p>
      )}

      <section className="glass-panel-strong rounded-2xl p-5">
        <p className="text-xs text-zinc-500">Portfolio-Wert</p>
        <p className="mt-1 text-2xl font-bold text-white">
          {latest ? `${latest.value.toLocaleString('de-DE')} €` : 'Noch kein Wert eingetragen'}
        </p>

        <div className="mt-2.5 flex items-center gap-2 text-xs text-zinc-500">
          <span>Ziel:</span>
          {editingGoal ? (
            <form onSubmit={handleSaveGoal} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="0.01"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-32 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-right text-zinc-200 focus:border-[var(--color-accent)] focus:outline-none"
              />
              <button type="submit" disabled={savingGoal} style={{ color: 'var(--color-accent)' }} className="hover:underline">
                Speichern
              </button>
            </form>
          ) : (
            <button onClick={() => setEditingGoal(true)} className="hover:text-zinc-300">
              {goal.toLocaleString('de-DE')} € · ändern
            </button>
          )}
        </div>

        <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--glass-track)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--color-wealth), var(--color-accent))' }}
          />
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">{progress}% zum Ziel</p>
      </section>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="mb-4 text-[12.5px] font-semibold text-zinc-400">Verlauf</h2>
        {recentHistory.length === 0 ? (
          <p className="text-sm text-zinc-500">Noch keine Einträge.</p>
        ) : (
          <div className="flex h-32 gap-3">
            {recentHistory.map((s) => (
              <div key={s.date} className="flex min-w-8 flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${(s.value / maxHistory) * 100}%`,
                      background: 'linear-gradient(180deg, var(--color-wealth), var(--color-accent))',
                    }}
                  />
                </div>
                <span className="text-[11px] text-zinc-500">
                  {new Date(s.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <form onSubmit={handleAddSnapshot} className="glass-panel flex flex-col gap-3 rounded-2xl p-5">
        <h2 className="text-[12.5px] font-semibold text-zinc-400">Portfolio-Update eintragen</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="Aktueller Wert in €"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[var(--color-accent)] focus:outline-none"
          />
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
          style={{ background: 'linear-gradient(140deg, var(--color-accent), var(--color-accent-soft))' }}
        >
          {saving ? 'Speichert…' : '+ Eintragen'}
        </button>
      </form>
    </div>
  )
}

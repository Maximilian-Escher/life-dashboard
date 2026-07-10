import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  getPortfolioSnapshots,
  getPortfolioGoal,
  upsertPortfolioSnapshot,
  setPortfolioGoal,
  DEFAULT_GOAL,
} from '../lib/portfolio.js'
import { todayIso } from '../lib/habitLog.js'
import CsvImportModal from '../components/CsvImportModal.jsx'

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

function PortfolioTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass-panel-strong rounded-xl px-3 py-2 text-xs">
      <p className="text-zinc-500">
        {new Date(point.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </p>
      <p className="portfolio-tooltip-value mt-0.5 font-semibold">{point.value.toLocaleString('de-DE')} €</p>
    </div>
  )
}

export default function Finanzen() {
  const [snapshots, setSnapshots] = useState([])
  const [goal, setGoal] = useState(DEFAULT_GOAL)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [valueInput, setValueInput] = useState('')
  const [dateInput, setDateInput] = useState(todayIso())
  const [saving, setSaving] = useState(false)

  const [csvModalOpen, setCsvModalOpen] = useState(false)

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
        {snapshots.length === 0 ? (
          <p className="text-sm text-zinc-500">Noch keine Einträge.</p>
        ) : snapshots.length === 1 ? (
          <p className="text-sm text-zinc-500">Noch nicht genug Daten für einen Verlauf – trag mindestens zwei Werte ein.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshots} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-wealth)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-wealth)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--glass-track)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={36}
                />
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Tooltip content={<PortfolioTooltip />} cursor={{ stroke: 'var(--glass-border)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-wealth)"
                  strokeWidth={2}
                  fill="url(#portfolioFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--color-wealth)', stroke: 'var(--color-bg)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <form onSubmit={handleAddSnapshot} className="glass-panel flex flex-col gap-3 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[12.5px] font-semibold text-zinc-400">Portfolio-Update eintragen</h2>
          <button
            type="button"
            onClick={() => setCsvModalOpen(true)}
            className="text-xs font-medium text-zinc-400 hover:text-white"
            style={{ color: 'var(--color-accent)' }}
          >
            CSV importieren
          </button>
        </div>
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

      <CsvImportModal open={csvModalOpen} onClose={() => setCsvModalOpen(false)} onImported={loadAll} />
    </div>
  )
}

import { useState } from 'react'
import { skillTreeBranches } from '../data/skillTree.js'

const STAT_OPTIONS = [
  { key: 'vitalitaet', label: 'Vitalität' },
  { key: 'disziplin', label: 'Disziplin' },
  { key: 'wealth', label: 'Wealth' },
]

const inputClass =
  'rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[var(--color-accent)] focus:outline-none'
const selectClass = 'rounded-xl border border-white/10 bg-[var(--color-surface)] px-3 py-2 text-sm text-white focus:border-[var(--color-accent)] focus:outline-none'

export default function ManageNodesModal({ open, nodes, completedIds, onClose, onAddNode, onDeleteNode }) {
  const [title, setTitle] = useState('')
  const [branch, setBranch] = useState(skillTreeBranches[0].key)
  const [statKey, setStatKey] = useState(STAT_OPTIONS[0].key)
  const [requires, setRequires] = useState('')
  const [bonusXp, setBonusXp] = useState(50)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [formError, setFormError] = useState(null)

  if (!open) return null

  const branchNodes = nodes.filter((n) => n.branch === branch)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setFormError(null)
    try {
      await onAddNode({ title: title.trim(), branch, statKey, bonusXp: Number(bonusXp) || 0, requires: requires || null })
      setTitle('')
      setRequires('')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(node) {
    setDeletingId(node.id)
    setFormError(null)
    try {
      await onDeleteNode(node)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="glass-panel-strong max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Knoten verwalten</h2>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white">
            ✕
          </button>
        </div>

        {formError && (
          <p className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {formError}
          </p>
        )}

        <div className="flex flex-col gap-4">
          {skillTreeBranches.map((b) => {
            const branchNodesFor = nodes.filter((n) => n.branch === b.key)
            return (
              <div key={b.key}>
                <p className="mb-2 text-xs font-semibold text-zinc-400">{b.label}</p>
                <div className="flex flex-col gap-1.5">
                  {branchNodesFor.map((node) => {
                    const isCompleted = completedIds.has(node.id)
                    const hasDependents = nodes.some((n) => n.requires === node.id)
                    const blocked = isCompleted || hasDependents
                    return (
                      <div
                        key={node.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"
                      >
                        <span className="truncate text-zinc-300">{node.title}</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(node)}
                          disabled={blocked || deletingId === node.id}
                          title={
                            isCompleted
                              ? 'Abgeschlossene Knoten können nicht gelöscht werden.'
                              : hasDependents
                                ? 'Andere Knoten setzen diesen voraus – erst diese löschen.'
                                : undefined
                          }
                          className="shrink-0 text-xs text-rose-400 hover:text-rose-300 disabled:cursor-not-allowed disabled:text-zinc-600"
                        >
                          {deletingId === node.id ? '…' : 'Löschen'}
                        </button>
                      </div>
                    )
                  })}
                  {branchNodesFor.length === 0 && <p className="text-xs text-zinc-600">Noch keine Knoten.</p>}
                </div>
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4">
          <p className="text-xs font-semibold text-zinc-400">Neuer Knoten</p>
          <input type="text" required placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value)
                setRequires('')
              }}
              className={selectClass}
            >
              {skillTreeBranches.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label}
                </option>
              ))}
            </select>

            <select value={statKey} onChange={(e) => setStatKey(e.target.value)} className={selectClass}>
              {STAT_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select value={requires} onChange={(e) => setRequires(e.target.value)} className={selectClass}>
              <option value="">Keine Voraussetzung</option>
              {branchNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              step="1"
              value={bonusXp}
              onChange={(e) => setBonusXp(e.target.value)}
              placeholder="Bonus-XP"
              className={inputClass}
            />
          </div>
          <p className="text-xs text-zinc-600">
            Bonus-XP ist nur eine Anzeige im Bestätigungs-Dialog beim Abschließen, wirkt sich nicht auf die
            Stat-Berechnung aus.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="self-start rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ background: 'linear-gradient(140deg, var(--color-accent), var(--color-accent-soft))' }}
          >
            {saving ? 'Speichert…' : '+ Knoten hinzufügen'}
          </button>
        </form>
      </div>
    </div>
  )
}

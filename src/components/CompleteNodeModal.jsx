import { STAT_LABELS } from '../lib/skillTree.js'

export default function CompleteNodeModal({ node, confirming, onCancel, onConfirm }) {
  if (!node) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onCancel}>
      <div className="glass-panel-strong w-full max-w-sm rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-white">Als abgeschlossen markieren?</h2>
        <p className="mt-2 text-sm text-zinc-300">{node.title}</p>
        <p className="mt-1 text-xs text-zinc-500">
          +{node.bonusXp} XP für {STAT_LABELS[node.statKey]}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-xl px-3 py-2 text-sm text-zinc-400 hover:text-white">
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="rounded-xl px-3.5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ background: 'linear-gradient(140deg, var(--color-accent), var(--color-accent-soft))' }}
          >
            {confirming ? 'Speichert…' : 'Bestätigen'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { STAT_LABELS } from '../lib/skillTree.js'

export default function CompleteNodeModal({ node, confirming, onCancel, onConfirm }) {
  if (!node) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-medium text-white">Als abgeschlossen markieren?</h2>
        <p className="mt-2 text-sm text-zinc-300">{node.title}</p>
        <p className="mt-1 text-xs text-zinc-500">
          +{node.bonusXp} XP für {STAT_LABELS[node.statKey]}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-soft)] disabled:opacity-60"
          >
            {confirming ? 'Speichert…' : 'Bestätigen'}
          </button>
        </div>
      </div>
    </div>
  )
}

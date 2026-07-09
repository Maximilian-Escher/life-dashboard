const STATUS_STYLES = {
  completed: 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white',
  'in-progress': 'border-[var(--color-border)] text-zinc-200 hover:bg-[var(--color-surface-hover)] cursor-pointer',
  locked: 'border-[var(--color-border)] text-zinc-600 cursor-not-allowed',
}

const STATUS_LABEL = {
  completed: 'Abgeschlossen',
  'in-progress': 'In Arbeit',
  locked: 'Gesperrt',
}

export default function SkillNodeRow({ node, status, celebrating, onClick }) {
  return (
    <button
      type="button"
      disabled={status !== 'in-progress'}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${STATUS_STYLES[status]} ${
        celebrating ? 'skill-node-celebrate' : ''
      }`}
    >
      <span className="flex items-center gap-2">
        {status === 'completed' && (
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-[var(--color-accent)]">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {status === 'locked' && (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-zinc-600">
            <path d="M12 2a4 4 0 0 0-4 4v2H7a1 1 0 0 0-1 1v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9a1 1 0 0 0-1-1h-1V6a4 4 0 0 0-4-4Zm-2 6V6a2 2 0 1 1 4 0v2Z" />
          </svg>
        )}
        {node.title}
      </span>
      <span className="shrink-0 text-xs opacity-70">{STATUS_LABEL[status]}</span>
    </button>
  )
}

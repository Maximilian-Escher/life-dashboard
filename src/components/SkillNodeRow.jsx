const STATUS_STYLE = {
  completed: { background: 'color-mix(in oklab, var(--color-accent) 18%, transparent)', color: 'white', cursor: 'default' },
  'in-progress': { background: 'rgba(255,255,255,0.04)', color: 'inherit', cursor: 'pointer' },
  locked: { background: 'transparent', color: 'inherit', opacity: 0.45, cursor: 'not-allowed' },
}

const STATUS_LABEL = { completed: 'Abgeschlossen', 'in-progress': 'In Arbeit', locked: 'Gesperrt' }

export default function SkillNodeRow({ node, status, celebrating, onClick }) {
  return (
    <button
      type="button"
      disabled={status !== 'in-progress'}
      onClick={onClick}
      style={{
        ...STATUS_STYLE[status],
        border: status === 'in-progress' ? '1px dashed var(--glass-border)' : '1px solid transparent',
        '--glow-color': 'var(--color-accent)',
      }}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
        celebrating ? 'glow-celebrate' : ''
      }`}
    >
      <span className="flex items-center gap-2">
        {status === 'completed' && (
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" style={{ color: 'var(--color-accent)' }}>
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
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

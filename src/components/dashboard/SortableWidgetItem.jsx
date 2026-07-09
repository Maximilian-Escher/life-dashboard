import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function SortableWidgetItem({ id, label, visible, editing, onToggleVisible, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  if (!editing) {
    return visible ? <>{children}</> : null
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border-2 border-dashed p-3 ${isDragging ? 'z-10 opacity-70 shadow-lg' : ''} ${
        visible ? 'border-[var(--color-accent)]/40' : 'border-[var(--color-border)]'
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Ziehen zum Umsortieren"
          className="cursor-grab touch-none text-zinc-500 hover:text-zinc-300 active:cursor-grabbing"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <circle cx="8" cy="6" r="1.5" />
            <circle cx="8" cy="12" r="1.5" />
            <circle cx="8" cy="18" r="1.5" />
            <circle cx="16" cy="6" r="1.5" />
            <circle cx="16" cy="12" r="1.5" />
            <circle cx="16" cy="18" r="1.5" />
          </svg>
        </button>
        <label className="flex flex-1 items-center gap-2 text-xs font-medium text-zinc-400">
          <input
            type="checkbox"
            checked={visible}
            onChange={onToggleVisible}
            className="h-3.5 w-3.5 accent-[var(--color-accent)]"
          />
          {label}
        </label>
      </div>
      <div className={visible ? '' : 'pointer-events-none opacity-40'}>{children}</div>
    </div>
  )
}

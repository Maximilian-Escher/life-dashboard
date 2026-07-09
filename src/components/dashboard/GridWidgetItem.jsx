import { forwardRef } from 'react'

// Wird von react-grid-layout per cloneElement mit ref/style/className und
// (im Resize-Fall) zusätzlichen Kind-Elementen (den Resize-Handles) versorgt
// – die müssen als direkte, unverschachtelte Nachfahren des Wurzel-Elements
// bleiben, sonst positionieren sie sich falsch bzw. werden abgeschnitten.
// Deshalb sitzt "overflow-hidden" bewusst nur auf dem Wurzel-Element selbst
// und keine der inneren Wrapper-Divs setzt eigenes overflow.
const GridWidgetItem = forwardRef(function GridWidgetItem(
  { label, visible, editing, onToggleVisible, children, className = '', style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      style={style}
      className={`${className} h-full overflow-hidden rounded-xl ${
        editing
          ? `border-2 border-dashed p-1.5 ${visible ? 'border-[var(--color-accent)]/40' : 'border-[var(--color-border)]'}`
          : ''
      }`}
      {...rest}
    >
      <div className="flex h-full flex-col">
        {editing && (
          <div className="mb-2 flex shrink-0 items-center gap-2 px-0.5">
            <span
              className="widget-drag-handle flex cursor-grab items-center text-zinc-500 hover:text-zinc-300 active:cursor-grabbing"
              aria-label="Ziehen zum Umsortieren"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <circle cx="8" cy="6" r="1.5" />
                <circle cx="8" cy="12" r="1.5" />
                <circle cx="8" cy="18" r="1.5" />
                <circle cx="16" cy="6" r="1.5" />
                <circle cx="16" cy="12" r="1.5" />
                <circle cx="16" cy="18" r="1.5" />
              </svg>
            </span>
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
        )}
        <div className={`min-h-0 flex-1 ${editing && !visible ? 'pointer-events-none opacity-40' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  )
})

export default GridWidgetItem

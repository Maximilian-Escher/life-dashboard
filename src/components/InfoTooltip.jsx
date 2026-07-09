import { useEffect, useRef, useState } from 'react'

export default function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Wie wird das berechnet?"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--color-border)] text-[10px] text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-300"
      >
        i
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-10 w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-3 text-xs leading-relaxed text-zinc-300 shadow-lg">
          {text}
        </div>
      )}
    </div>
  )
}

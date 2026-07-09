export default function RecoveryWidget({ badge, barValue, note }) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">Recovery</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            badge === 'buff'
              ? 'bg-emerald-500/15 text-emerald-400'
              : badge === 'neutral'
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-rose-500/15 text-rose-400'
          }`}
        >
          {badge === 'buff' ? 'Buff' : badge === 'neutral' ? 'Neutral' : 'Debuff'}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${barValue}%` }} />
      </div>
      <p className="mt-2 text-xs text-zinc-500">{note}</p>
    </section>
  )
}

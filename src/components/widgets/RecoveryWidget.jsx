export default function RecoveryWidget({ badge, barValue, note }) {
  const badgeColor = badge === 'buff' ? 'var(--color-vitality)' : badge === 'neutral' ? 'var(--color-wealth)' : '#fb7185'

  return (
    <section className="glass-panel-strong h-full rounded-2xl p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[12.5px] font-semibold text-zinc-400">Recovery</h2>
        <span
          className="rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
          style={{ color: badgeColor, background: `color-mix(in oklab, ${badgeColor} 18%, transparent)` }}
        >
          {badge === 'buff' ? 'Buff' : badge === 'neutral' ? 'Neutral' : 'Debuff'}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--glass-track)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${barValue}%`, background: 'linear-gradient(90deg, var(--color-vitality), var(--color-accent))' }}
        />
      </div>
      <p className="mt-2.5 text-xs text-zinc-500">{note}</p>
    </section>
  )
}

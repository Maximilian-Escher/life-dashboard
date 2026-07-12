import ActivityRing from '../ActivityRing.jsx'
import { calculateLevel } from '../../lib/stats.js'

const RING_COLORS = { vitalitaet: 'var(--color-vitality)', disziplin: 'var(--color-disziplin)', wealth: 'var(--color-wealth)' }

export default function StatsWidget({ statCards }) {
  return (
    <section>
      <h2 className="mb-3 text-[12.5px] font-semibold text-zinc-400">Stats</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.key} className="flex items-center gap-3.5">
            <div className="relative h-14 w-14 shrink-0">
              <ActivityRing value={s.value} size={56} strokeWidth={6} color={RING_COLORS[s.key]} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{s.label}</p>
              {s.value == null ? (
                <p className="mt-0.5 text-xs text-zinc-500">Noch keine Daten</p>
              ) : (
                <>
                  <p className="text-[19px] font-bold text-white">
                    {s.value} <span className="text-[11px] font-medium text-zinc-500">/ 100</span>
                  </p>
                  <p className="text-[11px] text-zinc-500">Level {calculateLevel(s.value).level}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

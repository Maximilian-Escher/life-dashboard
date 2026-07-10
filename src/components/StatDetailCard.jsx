import ActivityRing from './ActivityRing.jsx'
import { calculateLevel } from '../lib/stats.js'
import InfoTooltip from './InfoTooltip.jsx'

const RING_COLORS = { Vitalität: 'var(--color-vitality)', Disziplin: 'var(--color-disziplin)', Wealth: 'var(--color-wealth)' }

export default function StatDetailCard({ label, value, trend = [], tooltipText, emptyHint }) {
  const hasValue = value != null
  const { level } = hasValue ? calculateLevel(value) : { level: null }
  const ringColor = RING_COLORS[label] ?? 'var(--color-accent)'

  // Sparkline aus dem Trend, per SVG statt recharts — kein zusätzliches
  // Container-Sizing-Gedöns nötig für die schlanke Glass-Karte.
  const sparkPoints =
    trend.length > 1
      ? trend
          .map((p, i) => {
            const x = (i / (trend.length - 1)) * 100
            const y = 100 - p.value
            return `${x},${y}`
          })
          .join(' ')
      : null

  return (
    <div className="glass-panel-strong rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="relative h-24 w-24 shrink-0">
            <ActivityRing value={value} size={96} strokeWidth={9} color={ringColor} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[22px] font-bold text-white">{hasValue ? value : '–'}</div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-semibold text-white">{label}</h2>
              {tooltipText && <InfoTooltip text={tooltipText} />}
              {hasValue && <span className="text-xs text-zinc-500">Level {level}</span>}
            </div>
            {hasValue ? (
              <p className="mt-1 text-xs text-zinc-500">{value} / 100</p>
            ) : (
              <p className="mt-1 text-xs text-zinc-500">{emptyHint ?? 'Noch keine Daten'}</p>
            )}
            {sparkPoints && (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-2.5 h-10 w-40">
                <polyline points={sparkPoints} fill="none" stroke={ringColor} strokeWidth="3" vectorEffect="non-scaling-stroke" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

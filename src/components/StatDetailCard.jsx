import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { calculateLevel } from '../lib/stats.js'
import InfoTooltip from './InfoTooltip.jsx'

export default function StatDetailCard({ label, value, trend = [], tooltipText, emptyHint }) {
  const hasValue = value != null
  const { level, progressPercent } = hasValue ? calculateLevel(value) : { level: null, progressPercent: 0 }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-white">{label}</h2>
          {tooltipText && <InfoTooltip text={tooltipText} />}
        </div>
        {hasValue && <span className="text-xs text-zinc-500">Level {level}</span>}
      </div>

      {!hasValue ? (
        <p className="text-sm text-zinc-500">{emptyHint ?? 'Noch keine Daten'}</p>
      ) : (
        <>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">{value} / 100</p>
        </>
      )}

      {trend.length > 1 && (
        <div className="mt-4 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <YAxis domain={[0, 100]} hide />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

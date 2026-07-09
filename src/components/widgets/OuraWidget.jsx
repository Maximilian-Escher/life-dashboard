import { LineChart, Line, ResponsiveContainer } from 'recharts'

const OURA_METRICS = [
  { key: 'sleepScore', label: 'Schlaf', format: (v) => `${v}` },
  { key: 'readinessScore', label: 'Readiness', format: (v) => `${v}` },
  { key: 'steps', label: 'Schritte', format: (v) => v.toLocaleString('de-DE') },
]

export default function OuraWidget({ connected, ouraDays }) {
  if (!connected || !ouraDays || ouraDays.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-zinc-300">Letzte 7 Tage (Oura)</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {OURA_METRICS.map((metric) => {
          const last7 = ouraDays.slice(-7)
          const trend = last7.filter((d) => d[metric.key] != null).map((d) => ({ date: d.day, value: d[metric.key] }))
          const latest = trend[trend.length - 1]

          return (
            <div
              key={metric.key}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <p className="text-xs text-zinc-500">{metric.label}</p>
              <p className="mt-1 text-xl font-semibold text-white">{latest ? metric.format(latest.value) : '–'}</p>
              {trend.length > 1 && (
                <div className="mt-2 h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

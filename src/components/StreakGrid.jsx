import { toIsoDate } from '../lib/habitLog.js'

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Montag = 0 ... Sonntag = 6
function mondayIndex(date) {
  return (date.getDay() + 6) % 7
}

function buildWeeks(weeks, endDate) {
  const end = startOfDay(endDate)
  const gridEnd = new Date(end)
  gridEnd.setDate(gridEnd.getDate() + (6 - mondayIndex(end)))

  const gridStart = new Date(gridEnd)
  gridStart.setDate(gridStart.getDate() - weeks * 7 + 1)

  const columns = []
  for (let w = 0; w < weeks; w++) {
    const column = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(gridStart)
      day.setDate(day.getDate() + w * 7 + d)
      column.push(day)
    }
    columns.push(column)
  }
  return columns
}

export default function StreakGrid({ doneDates, weeks = 52, endDate = new Date(), cellClassName = 'h-2.5 w-2.5' }) {
  const today = startOfDay(endDate)
  const columns = buildWeeks(weeks, today)

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid grid-flow-col gap-1">
        {columns.map((week, wi) => (
          <div key={wi} className="grid grid-rows-7 gap-1">
            {week.map((day) => {
              const iso = toIsoDate(day)
              const isFuture = day > today
              const done = !isFuture && doneDates.has(iso)
              return (
                <div
                  key={iso}
                  title={`${day.toLocaleDateString('de-DE')}${isFuture ? '' : done ? ' – erledigt' : ' – offen'}`}
                  className={`${cellClassName} rounded-sm ${
                    isFuture
                      ? 'bg-transparent'
                      : done
                        ? 'bg-[var(--color-accent)]'
                        : 'bg-[var(--color-border)]'
                  }`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

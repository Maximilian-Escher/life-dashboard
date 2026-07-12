import { useEffect, useState } from 'react'
import ActivityRing from './ActivityRing.jsx'
import { useUIPrefs } from '../lib/uiPrefs.jsx'

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

// Full-screen "wall display" mode: big clock + weather + recovery ring.
// Only dismissed by an explicit click/tap (never by mouse movement), so it
// works as an actual ambient/wall display without flickering away.
export default function AmbientOverlay({ recoveryScore = 72, weatherLabel = '14° · Kulmbach' }) {
  const { dismissAmbient } = useUIPrefs()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  const dateLabel = `${WEEKDAYS[now.getDay()]}, ${now.getDate()}. ${MONTHS[now.getMonth()]}`

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-[var(--color-bg)] px-10 text-center"
      onClick={dismissAmbient}
      onTouchStart={dismissAmbient}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dismissAmbient()}
    >
      <div className="text-[15px] font-semibold uppercase tracking-[0.08em] text-white/40">{dateLabel}</div>
      <div
        className="font-bold leading-none tracking-tight text-white/95"
        style={{ fontSize: 'clamp(72px, 16vw, 180px)', animation: 'ambient-breathe 6s ease-in-out infinite' }}
      >
        {timeLabel}
      </div>

      <div className="flex items-center gap-3 text-xl font-medium text-white/55">
        <span>⛅</span>
        <span>{weatherLabel}</span>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2.5">
        <div
          className="relative"
          style={{
            width: 150,
            height: 150,
            filter: 'drop-shadow(0 0 24px color-mix(in oklab, var(--color-vitality) 45%, transparent))',
          }}
        >
          <ActivityRing value={recoveryScore} size={150} strokeWidth={10} color="var(--color-vitality)" trackColor="rgba(255,255,255,0.08)" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-white">{recoveryScore}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-white/40">Recovery</div>
          </div>
        </div>
        <div className="text-xs text-white/35">Berühren, tippen oder klicken zum Verlassen</div>
      </div>
    </div>
  )
}

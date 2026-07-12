// Apple-Watch-style activity ring, used for the three core stats
// (Vitalität/Disziplin/Wealth) both as a compact widget ring and a larger
// detail ring on the Charakterbogen. Pure presentational SVG component.
export default function ActivityRing({ value, size = 56, strokeWidth = 6, color = 'var(--color-accent)', trackColor }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = value == null ? 0 : Math.max(0, Math.min(100, value))
  const dash = `${(clamped / 100) * circumference} ${circumference}`

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor ?? 'var(--glass-track)'}
        strokeWidth={strokeWidth}
      />
      {value != null && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dash}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 500ms ease' }}
        />
      )}
    </svg>
  )
}

import { describeWeatherCode } from '../lib/weather.js'

// Ein Icon pro Wetterkategorie statt pro WMO-Code – reicht für einen
// dezenten Überblick und bleibt konsistent mit den restlichen Linien-Icons
// der App (kein Emoji-Set).
function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M12 2.5v2M12 19.5v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2.5 12h2M19.5 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </svg>
  )
}

function CloudIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        d="M6.5 18a4 4 0 0 1-.5-7.97 5 5 0 0 1 9.68-1.94A4.5 4.5 0 0 1 17.5 18h-11Z"
      />
    </svg>
  )
}

function PartlyCloudyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="8.5" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        d="M9.5 19a4 4 0 0 1-.4-7.98 5 5 0 0 1 9.58 1.6A4.25 4.25 0 0 1 18.25 19H9.5Z"
      />
    </svg>
  )
}

function FogIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        d="M6.5 13a4 4 0 0 1-.3-7.98 5 5 0 0 1 9.58 1.44A4.25 4.25 0 0 1 17.25 14"
      />
      <path stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" d="M4 17h16M6 20h12" />
    </svg>
  )
}

function RainIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        d="M6.5 14.5a4 4 0 0 1-.4-7.97 5 5 0 0 1 9.58 1.6A4.25 4.25 0 0 1 17.25 15.5H6.5Z"
      />
      <path stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" d="M8.5 18v2.5M12 18v2.5M15.5 18v2.5" />
    </svg>
  )
}

function SnowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        d="M6.5 14.5a4 4 0 0 1-.4-7.97 5 5 0 0 1 9.58 1.6A4.25 4.25 0 0 1 17.25 15.5H6.5Z"
      />
      <path stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" d="M8.5 18.5v3M12 18.5v3M15.5 18.5v3" />
      <circle cx="8.5" cy="21.5" r="0.4" fill="currentColor" />
      <circle cx="12" cy="21.5" r="0.4" fill="currentColor" />
      <circle cx="15.5" cy="21.5" r="0.4" fill="currentColor" />
    </svg>
  )
}

function StormIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        d="M6.5 13.5a4 4 0 0 1-.4-7.97 5 5 0 0 1 9.58 1.6A4.25 4.25 0 0 1 17.25 14.5H6.5Z"
      />
      <path stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" d="M13 15.5 10 20h3l-2 4" />
    </svg>
  )
}

const ICONS_BY_CATEGORY = {
  clear: SunIcon,
  'partly-cloudy': PartlyCloudyIcon,
  cloudy: CloudIcon,
  fog: FogIcon,
  rain: RainIcon,
  snow: SnowIcon,
  storm: StormIcon,
}

export default function WeatherIcon({ code, className }) {
  const { category } = describeWeatherCode(code)
  const Icon = ICONS_BY_CATEGORY[category] ?? CloudIcon
  return <Icon className={className} />
}

// Open-Meteo (https://open-meteo.com) – kostenlos, kein API-Key, CORS-freundlich
// für direkte Frontend-Aufrufe (kein Netlify-Function-Proxy nötig).

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export async function fetchWeather(latitude, longitude) {
  const url = new URL(FORECAST_URL)
  url.searchParams.set('latitude', latitude)
  url.searchParams.set('longitude', longitude)
  url.searchParams.set('current', 'temperature_2m,weather_code')
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url)
  if (!res.ok) throw new Error('Wetterdaten konnten nicht geladen werden.')
  const data = await res.json()

  return {
    temperature: Math.round(data.current.temperature_2m),
    weatherCode: data.current.weather_code,
    todayMin: Math.round(data.daily.temperature_2m_min[0]),
    todayMax: Math.round(data.daily.temperature_2m_max[0]),
  }
}

export async function geocodeLocation(query) {
  const url = new URL(GEOCODING_URL)
  url.searchParams.set('name', query)
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'de')
  url.searchParams.set('format', 'json')

  const res = await fetch(url)
  if (!res.ok) throw new Error('Ort konnte nicht gesucht werden.')
  const data = await res.json()
  const first = data.results?.[0]
  if (!first) throw new Error(`Kein Ort gefunden für "${query}".`)

  return {
    label: [first.name, first.admin1, first.country].filter(Boolean).join(', '),
    latitude: first.latitude,
    longitude: first.longitude,
  }
}

// WMO Weather Codes (https://open-meteo.com/en/docs) gruppiert auf ein paar
// Icon-Kategorien, damit wir kein eigenes Icon pro Code brauchen.
const WEATHER_CODE_INFO = {
  0: { label: 'Klar', category: 'clear' },
  1: { label: 'Überwiegend klar', category: 'partly-cloudy' },
  2: { label: 'Teilweise bewölkt', category: 'partly-cloudy' },
  3: { label: 'Bedeckt', category: 'cloudy' },
  45: { label: 'Nebel', category: 'fog' },
  48: { label: 'Nebel mit Reif', category: 'fog' },
  51: { label: 'Leichter Nieselregen', category: 'rain' },
  53: { label: 'Nieselregen', category: 'rain' },
  55: { label: 'Starker Nieselregen', category: 'rain' },
  61: { label: 'Leichter Regen', category: 'rain' },
  63: { label: 'Regen', category: 'rain' },
  65: { label: 'Starker Regen', category: 'rain' },
  71: { label: 'Leichter Schneefall', category: 'snow' },
  73: { label: 'Schneefall', category: 'snow' },
  75: { label: 'Starker Schneefall', category: 'snow' },
  80: { label: 'Regenschauer', category: 'rain' },
  81: { label: 'Regenschauer', category: 'rain' },
  82: { label: 'Heftiger Regenschauer', category: 'rain' },
  95: { label: 'Gewitter', category: 'storm' },
  96: { label: 'Gewitter mit Hagel', category: 'storm' },
  99: { label: 'Gewitter mit Hagel', category: 'storm' },
}

export function describeWeatherCode(code) {
  return WEATHER_CODE_INFO[code] ?? { label: 'Unbekannt', category: 'cloudy' }
}

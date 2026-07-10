import { useEffect, useState } from 'react'
import { fetchWeather, geocodeLocation, describeWeatherCode } from '../../lib/weather.js'
import { getWeatherSettings, setWeatherLocation } from '../../lib/weatherSettings.js'
import WeatherIcon from '../WeatherIcon.jsx'

// status: 'loading' | 'prompt' | 'requesting' | 'ready' | 'manual' | 'error'
// Glass-Redesign: volle Zeilenbreite (siehe dashboardWidgets.js), Layout
// dadurch horizontal statt vertikal gestapelt.
export default function WeatherWidget() {
  const [status, setStatus] = useState('loading')
  const [weather, setWeather] = useState(null)
  const [locationLabel, setLocationLabel] = useState(null)
  const [error, setError] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [savingManual, setSavingManual] = useState(false)

  async function loadFromCoords(latitude, longitude, label) {
    setStatus('loading')
    setError(null)
    try {
      const data = await fetchWeather(latitude, longitude)
      setWeather(data)
      setLocationLabel(label)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  function requestGeolocation() {
    setStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => loadFromCoords(pos.coords.latitude, pos.coords.longitude, 'Aktueller Standort'),
      () => setStatus('manual'),
      { timeout: 10000 },
    )
  }

  useEffect(() => {
    let cancelled = false

    async function init() {
      const saved = await getWeatherSettings().catch(() => null)
      if (cancelled) return
      if (saved) {
        await loadFromCoords(saved.latitude, saved.longitude, saved.locationLabel)
        return
      }

      if (!navigator.geolocation) {
        setStatus('manual')
        return
      }

      if (navigator.permissions?.query) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' })
          if (cancelled) return
          if (result.state === 'granted') {
            requestGeolocation()
            return
          }
          if (result.state === 'denied') {
            setStatus('manual')
            return
          }
        } catch {
          // Permissions API nicht unterstützt – normal weiter zum Prompt
        }
      }

      setStatus('prompt')
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualInput.trim()) return
    setSavingManual(true)
    setError(null)
    try {
      const geo = await geocodeLocation(manualInput.trim())
      await setWeatherLocation(geo)
      setManualInput('')
      await loadFromCoords(geo.latitude, geo.longitude, geo.label)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingManual(false)
    }
  }

  return (
    <section className="glass-panel h-full rounded-2xl p-5">
      <h2 className="mb-3 text-[12.5px] font-semibold text-zinc-400">Wetter</h2>

      {status === 'ready' && weather && (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-4">
            <WeatherIcon code={weather.weatherCode} className="h-10 w-10 shrink-0 text-[var(--color-accent)]" />
            <div>
              <p className="text-2xl font-bold text-white">{weather.temperature}°</p>
              <p className="text-xs text-zinc-500">
                {describeWeatherCode(weather.weatherCode).label}
                {locationLabel ? ` · ${locationLabel}` : ''}
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Heute: {weather.todayMin}° / {weather.todayMax}°
          </p>
        </div>
      )}

      {(status === 'loading' || status === 'requesting') && <p className="text-sm text-zinc-500">Lade Wetterdaten…</p>}

      {status === 'prompt' && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Für das Wetter an deinem Standort brauchen wir kurz deine Standortfreigabe.
          </p>
          <button
            type="button"
            onClick={requestGeolocation}
            className="self-start rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
            style={{ background: 'linear-gradient(140deg, var(--color-accent), var(--color-accent-soft))' }}
          >
            Standort freigeben
          </button>
        </div>
      )}

      {(status === 'manual' || status === 'error') && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <p className="shrink-0 text-xs text-zinc-500">
            {status === 'error' ? 'Wetterdaten konnten nicht geladen werden.' : 'Kein Standortzugriff – Ort eintragen:'}
          </p>
          <form onSubmit={handleManualSubmit} className="flex flex-1 gap-2">
            <input
              type="text"
              placeholder="Stadt (z.B. Kulmbach)"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[var(--color-accent)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={savingManual}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(140deg, var(--color-accent), var(--color-accent-soft))' }}
            >
              {savingManual ? '…' : 'Suchen'}
            </button>
          </form>
        </div>
      )}

      {error && status !== 'error' && status !== 'manual' && <p className="mt-2 text-xs text-rose-400">{error}</p>}
    </section>
  )
}

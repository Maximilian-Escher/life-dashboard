import { createContext, useContext, useEffect, useRef, useState } from 'react'

// Persisted (localStorage) display prefs: theme, performance mode, ambient
// display mode. Pure client-side UI state — no Supabase table needed since
// nothing here is user *data*, just device display preference.
const UIPrefsContext = createContext(null)

const STORAGE_KEY = 'ui_prefs_v1'
const AMBIENT_TIMEOUT_MS = 2 * 60 * 1000

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function UIPrefsProvider({ children }) {
  const stored = loadStored()
  const [theme, setTheme] = useState(stored.theme ?? 'dark')
  const [performanceMode, setPerformanceMode] = useState(stored.performanceMode ?? false)
  const [ambientEnabled, setAmbientEnabled] = useState(stored.ambientEnabled ?? true)
  const [ambientActive, setAmbientActive] = useState(false)

  const lastInteraction = useRef(Date.now())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, performanceMode, ambientEnabled }))
  }, [theme, performanceMode, ambientEnabled])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('perf-mode', performanceMode)
  }, [performanceMode])

  // Idle timer: only touch/click count as "interaction that keeps ambient
  // away" — a stationary mouse cursor should NOT reset the timer (wall
  // display use case: no mouse is normally attached, but the timer should
  // still behave correctly when developing/testing with one attached).
  useEffect(() => {
    if (!ambientEnabled) return
    const interval = setInterval(() => {
      if (ambientActive) return
      if (Date.now() - lastInteraction.current > AMBIENT_TIMEOUT_MS) setAmbientActive(true)
    }, 5000)
    return () => clearInterval(interval)
  }, [ambientEnabled, ambientActive])

  function registerInteraction() {
    lastInteraction.current = Date.now()
  }

  function dismissAmbient() {
    registerInteraction()
    setAmbientActive(false)
  }

  function previewAmbient() {
    registerInteraction()
    setAmbientActive(true)
  }

  const value = {
    theme,
    toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    performanceMode,
    togglePerformanceMode: () => setPerformanceMode((p) => !p),
    ambientEnabled,
    toggleAmbientEnabled: () => setAmbientEnabled((v) => !v),
    ambientActive,
    previewAmbient,
    dismissAmbient,
    registerInteraction,
  }

  return <UIPrefsContext.Provider value={value}>{children}</UIPrefsContext.Provider>
}

export function useUIPrefs() {
  const ctx = useContext(UIPrefsContext)
  if (!ctx) throw new Error('useUIPrefs muss innerhalb von UIPrefsProvider verwendet werden.')
  return ctx
}

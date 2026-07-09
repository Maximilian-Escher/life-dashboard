// Zentrale Stat-Berechnung (Vitalität, Disziplin, Wealth). Reine Funktionen,
// die fertig geladene Daten entgegennehmen – Laden/Fehlerbehandlung passiert
// in den Views.

import { toIsoDate, getLoggedDates } from './habitLog.js'

// Habits, die in die Disziplin-Berechnung einfließen. Erweitern, sobald ein
// weiteres Habit eine echte Tracking-UI hat. Schlafenszeit bleibt bewusst
// draußen – die steckt schon in Vitalität, sonst würde sie doppelt zählen.
export const TRACKED_HABIT_KEYS = ['creatine', 'training', 'steps']

export const VITALITAET_WEIGHTS = { readiness: 0.4, sleep: 0.3, steps: 0.3 }
export const STEPS_TARGET = 10000 // Schritte/Tag, die als 100%-Marke zählen

// Sleep Score statt Rohdauer/Bettzeit, weil wir den Wert für Vitalität
// ohnehin schon von Oura holen (kein zusätzlicher API-Call/Endpoint nötig)
// und der Score selbst schon Dauer, Effizienz und Regelmäßigkeit einrechnet.
// 70 entspricht in Ouras eigener Einordnung der Grenze zu "Good".
export const SLEEP_SCORE_THRESHOLD = 70

export function calculateLevel(statValue) {
  const clamped = Math.max(0, Math.min(100, statValue))
  const level = Math.floor(clamped / 10) + 1
  const progressPercent = Math.min(100, (clamped - (level - 1) * 10) * 10)
  return { level, progressPercent }
}

function normalizeSteps(steps) {
  if (steps == null) return null
  return Math.min(100, (steps / STEPS_TARGET) * 100)
}

// Gewichteter Score für einen einzelnen Tag. Fehlende Komponenten (z.B. kein
// Schritte-Wert an dem Tag) werden aus der Gewichtung rausgerechnet statt als
// 0 gezählt zu werden, damit ein Ausreißer nicht die ganze Tageswertung killt.
function dailyVitalitaetScore(day) {
  const components = [
    [day?.readinessScore, VITALITAET_WEIGHTS.readiness],
    [day?.sleepScore, VITALITAET_WEIGHTS.sleep],
    [normalizeSteps(day?.steps), VITALITAET_WEIGHTS.steps],
  ].filter(([value]) => value != null)

  if (components.length === 0) return null

  const totalWeight = components.reduce((sum, [, w]) => sum + w, 0)
  const weightedSum = components.reduce((sum, [value, w]) => sum + value * w, 0)
  return weightedSum / totalWeight
}

// Erwartet die letzten 7 Tage Oura-Daten ({ day, readinessScore, sleepScore, steps }).
export function calculateVitalitaet(ouraDays) {
  if (!ouraDays || ouraDays.length === 0) return null
  const scores = ouraDays.map(dailyVitalitaetScore).filter((s) => s != null)
  if (scores.length === 0) return null
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

export function buildVitalitaetTrend(ouraDays) {
  return (ouraDays ?? [])
    .map((day) => ({ date: day.day, value: dailyVitalitaetScore(day) }))
    .filter((point) => point.value != null)
    .map((point) => ({ ...point, value: Math.round(point.value) }))
}

// Leitet aus Oura-Tagesdaten ab, an welchen Tagen ein Oura-basiertes Habit
// als "erfüllt" gilt (Schritte-Ziel bzw. Sleep-Score-Schwelle).
export function getOuraHabitDates(ouraDays, habitKey) {
  const dates = new Set()
  for (const day of ouraDays ?? []) {
    if (habitKey === 'steps' && day.steps != null && day.steps >= STEPS_TARGET) {
      dates.add(day.day)
    }
    if (habitKey === 'sleep' && day.sleepScore != null && day.sleepScore >= SLEEP_SCORE_THRESHOLD) {
      dates.add(day.day)
    }
  }
  return dates
}

// Baut die { [habitKey]: Set<isoDate> }-Map für calculateDisziplin/
// buildDisziplinTrend zusammen: manuelle Habits kommen aus habit_logs,
// 'steps' wird aus schon geladenen Oura-Tagesdaten abgeleitet. Ist Oura
// nicht verbunden (ouraDays == null), fällt 'steps' einfach raus, statt
// als "nie erfüllt" reinzuzählen.
export async function loadDisziplinHabitDates(ouraDays) {
  const manualKeys = TRACKED_HABIT_KEYS.filter((key) => key !== 'steps')
  const entries = await Promise.all(manualKeys.map((key) => getLoggedDates(key).then((dates) => [key, dates])))
  const result = Object.fromEntries(entries)

  if (ouraDays && TRACKED_HABIT_KEYS.includes('steps')) {
    result.steps = getOuraHabitDates(ouraDays, 'steps')
  }

  return result
}

// habitDatesByKey: { [habitKey]: Set<isoDate> }
export function calculateDisziplin(habitDatesByKey, days = 30, today = new Date()) {
  const keys = Object.keys(habitDatesByKey)
  if (keys.length === 0) return null

  let possible = 0
  let done = 0
  const cursor = new Date(today)
  cursor.setHours(0, 0, 0, 0)

  for (let i = 0; i < days; i++) {
    const iso = toIsoDate(cursor)
    for (const key of keys) {
      possible += 1
      if (habitDatesByKey[key].has(iso)) done += 1
    }
    cursor.setDate(cursor.getDate() - 1)
  }

  return possible === 0 ? null : Math.round((done / possible) * 100)
}

// Rollierende 30-Tage-Disziplin für jeden Tag im angefragten Zeitraum.
export function buildDisziplinTrend(habitDatesByKey, days = 30, today = new Date()) {
  if (Object.keys(habitDatesByKey).length === 0) return []

  const points = []
  const cursor = new Date(today)
  cursor.setHours(0, 0, 0, 0)
  cursor.setDate(cursor.getDate() - days + 1)

  for (let i = 0; i < days; i++) {
    const value = calculateDisziplin(habitDatesByKey, 30, cursor)
    if (value != null) points.push({ date: toIsoDate(cursor), value })
    cursor.setDate(cursor.getDate() + 1)
  }
  return points
}

export function calculateWealth(currentValue, goalValue) {
  if (currentValue == null || !goalValue) return null
  return Math.min(100, Math.round((currentValue / goalValue) * 100))
}

// snapshots: [{ date, value }] aus portfolio_snapshots
export function buildWealthTrend(snapshots, goalValue) {
  if (!goalValue) return []
  return (snapshots ?? [])
    .map((s) => ({ date: s.date, value: calculateWealth(s.value, goalValue) }))
    .filter((p) => p.value != null)
}

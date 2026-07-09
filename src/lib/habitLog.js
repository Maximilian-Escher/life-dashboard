// LocalStorage-Persistenz für Habit-Logs. Pro erledigtem Tag ein Eintrag
// (kein Eintrag = nicht erledigt) – bildet sich später 1:1 auf eine
// Supabase-Tabelle "habit_logs(habit_key, date)" ab.

const STORAGE_PREFIX = 'habit-log:'

function storageKey(habitKey) {
  return `${STORAGE_PREFIX}${habitKey}`
}

// Bewusst über lokale Datumskomponenten statt toISOString() (das auf UTC
// normalisiert und z.B. um Mitternacht MESZ auf den Vortag springen würde).
export function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayIso() {
  return toIsoDate(new Date())
}

export function getLoggedDates(habitKey) {
  const raw = localStorage.getItem(storageKey(habitKey))
  if (!raw) return new Set()
  try {
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

export function isDoneOn(habitKey, dateIso) {
  return getLoggedDates(habitKey).has(dateIso)
}

export function toggleDay(habitKey, dateIso) {
  const dates = getLoggedDates(habitKey)
  if (dates.has(dateIso)) {
    dates.delete(dateIso)
  } else {
    dates.add(dateIso)
  }
  localStorage.setItem(storageKey(habitKey), JSON.stringify([...dates]))
  return dates
}

// Zählt rückwärts ab heute (bzw. ab gestern, falls heute noch offen ist,
// damit der Streak nicht schon vor dem Abhaken am Tag auf 0 fällt).
export function getCurrentStreak(datesSet, today = new Date()) {
  const cursor = new Date(today)
  cursor.setHours(0, 0, 0, 0)
  if (!datesSet.has(toIsoDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (datesSet.has(toIsoDate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function getLongestStreak(datesSet) {
  if (datesSet.size === 0) return 0

  const sorted = [...datesSet].sort()
  let longest = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.round((new Date(sorted[i]) - new Date(sorted[i - 1])) / 86_400_000)
    current = diffDays === 1 ? current + 1 : 1
    longest = Math.max(longest, current)
  }
  return longest
}

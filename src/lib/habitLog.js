// Habit-Logs in Supabase (Tabelle "habit_logs", RLS auf auth.uid()).
// Pro erledigtem Tag eine Zeile (keine Zeile = nicht erledigt).

import { supabase } from './supabaseClient.js'

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

export async function getLoggedDates(habitKey) {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('date')
    .eq('habit_key', habitKey)

  if (error) throw error
  return new Set(data.map((row) => row.date))
}

export async function toggleDay(habitKey, dateIso) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt.')

  const { data: existing, error: selectError } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_key', habitKey)
    .eq('date', dateIso)
    .maybeSingle()

  if (selectError) throw selectError

  if (existing) {
    const { error } = await supabase.from('habit_logs').delete().eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('habit_logs')
      .insert({ user_id: user.id, habit_key: habitKey, date: dateIso })
    if (error) throw error
  }

  return getLoggedDates(habitKey)
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

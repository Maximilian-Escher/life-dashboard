// Portfolio-Snapshots + Zielsumme in Supabase (Tabellen "portfolio_snapshots"
// und "portfolio_settings", RLS auf auth.uid()).

import { supabase } from './supabaseClient.js'
import { toIsoDate } from './habitLog.js'

export const DEFAULT_GOAL = 1_020_000

export async function getPortfolioSnapshots(days = 90) {
  const since = new Date()
  since.setDate(since.getDate() - days + 1)

  const { data, error } = await supabase
    .from('portfolio_snapshots')
    .select('date, value')
    .gte('date', toIsoDate(since))
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

export async function upsertPortfolioSnapshot(value, dateIso) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt.')

  const { error } = await supabase
    .from('portfolio_snapshots')
    .upsert({ user_id: user.id, date: dateIso, value }, { onConflict: 'user_id,date' })

  if (error) throw error
}

export async function getPortfolioGoal() {
  const { data, error } = await supabase.from('portfolio_settings').select('goal_value').maybeSingle()

  if (error) throw error
  return data?.goal_value ?? DEFAULT_GOAL
}

export async function setPortfolioGoal(goalValue) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt.')

  const { error } = await supabase
    .from('portfolio_settings')
    .upsert(
      { user_id: user.id, goal_value: goalValue, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )

  if (error) throw error
}

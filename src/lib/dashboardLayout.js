// Dashboard-Layout (Reihenfolge + Sichtbarkeit der Home-Widgets) in Supabase
// (Tabelle "dashboard_layout", RLS auf auth.uid()).

import { supabase } from './supabaseClient.js'
import { DEFAULT_WIDGET_ORDER } from '../data/dashboardWidgets.js'

export async function getLayout() {
  const { data, error } = await supabase
    .from('dashboard_layout')
    .select('widget_key, position, visible')
    .order('position', { ascending: true })

  if (error) throw error

  if (data.length === 0) {
    return DEFAULT_WIDGET_ORDER.map((key) => ({ key, visible: true }))
  }

  // Falls seit dem letzten Speichern neue Widgets dazugekommen sind (z.B.
  // Wetter beim Rollout dieser Funktion), hängen wir sie hinten an, statt
  // sie unsichtbar verschwinden zu lassen.
  const known = new Set(data.map((row) => row.widget_key))
  const missing = DEFAULT_WIDGET_ORDER.filter((key) => !known.has(key))

  return [
    ...data.map((row) => ({ key: row.widget_key, visible: row.visible })),
    ...missing.map((key) => ({ key, visible: true })),
  ]
}

export async function saveLayout(items) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt.')

  const rows = items.map((item, index) => ({
    user_id: user.id,
    widget_key: item.key,
    position: index,
    visible: item.visible,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('dashboard_layout').upsert(rows, { onConflict: 'user_id,widget_key' })
  if (error) throw error
}

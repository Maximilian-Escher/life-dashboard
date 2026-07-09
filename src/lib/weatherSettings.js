// Manuell hinterlegter Wetter-Ort in Supabase (Tabelle "weather_settings",
// RLS auf auth.uid()). Fallback für den Fall, dass Geolocation abgelehnt
// oder nicht verfügbar ist.

import { supabase } from './supabaseClient.js'

export async function getWeatherSettings() {
  const { data, error } = await supabase
    .from('weather_settings')
    .select('location_label, latitude, longitude')
    .maybeSingle()

  if (error) throw error
  if (!data || data.latitude == null) return null

  return { locationLabel: data.location_label, latitude: data.latitude, longitude: data.longitude }
}

export async function setWeatherLocation({ label, latitude, longitude }) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt.')

  const { error } = await supabase.from('weather_settings').upsert(
    {
      user_id: user.id,
      location_label: label,
      latitude,
      longitude,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) throw error
}

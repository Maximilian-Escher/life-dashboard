import { getValidAccessToken } from './ouraAuth.js'

export async function fetchOuraDays(days = 7) {
  const accessToken = await getValidAccessToken()
  if (!accessToken) throw new Error('Nicht mit Oura verbunden.')

  const res = await fetch(`/.netlify/functions/oura-data?days=${days}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Oura-Daten konnten nicht geladen werden.')
  }

  return res.json()
}

export function fetchOuraLast7Days() {
  return fetchOuraDays(7)
}

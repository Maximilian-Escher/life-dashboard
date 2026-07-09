const BASE_URL = 'https://api.ouraring.com/v2/usercollection'

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

async function fetchCollection(name, accessToken, startDate, endDate) {
  const url = new URL(`${BASE_URL}/${name}`)
  url.searchParams.set('start_date', startDate)
  url.searchParams.set('end_date', endDate)

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`${res.status}`)
  }

  const json = await res.json()
  return json.data ?? []
}

export default async (req) => {
  const authHeader = req.headers.get('authorization') || ''
  const accessToken = authHeader.replace(/^Bearer\s+/i, '')

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Kein Access Token übergeben.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const requestedDays = Number(new URL(req.url).searchParams.get('days')) || 7
  const days = Math.min(Math.max(requestedDays, 1), 90)

  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - (days - 1))

  const startDate = isoDate(start)
  const endDate = isoDate(today)

  try {
    const [sleep, readiness, activity] = await Promise.all([
      fetchCollection('daily_sleep', accessToken, startDate, endDate),
      fetchCollection('daily_readiness', accessToken, startDate, endDate),
      fetchCollection('daily_activity', accessToken, startDate, endDate),
    ])

    const byDay = {}
    for (const entry of sleep) {
      byDay[entry.day] ??= { day: entry.day }
      byDay[entry.day].sleepScore = entry.score
    }
    for (const entry of readiness) {
      byDay[entry.day] ??= { day: entry.day }
      byDay[entry.day].readinessScore = entry.score
    }
    for (const entry of activity) {
      byDay[entry.day] ??= { day: entry.day }
      byDay[entry.day].steps = entry.steps
    }

    const days = Object.values(byDay).sort((a, b) => a.day.localeCompare(b.day))

    return new Response(JSON.stringify({ days }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const status = err.message === '401' ? 401 : 502
    return new Response(JSON.stringify({ error: `Oura-API-Fehler (${err.message}).` }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

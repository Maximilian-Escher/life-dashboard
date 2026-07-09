const TOKEN_URL = 'https://api.ouraring.com/oauth/token'

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const clientId = process.env.OURA_CLIENT_ID
  const clientSecret = process.env.OURA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ error: 'OURA_CLIENT_ID/OURA_CLIENT_SECRET fehlen in den Umgebungsvariablen (.env).' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { refreshToken } = await req.json().catch(() => ({}))

  if (!refreshToken) {
    return new Response(JSON.stringify({ error: 'refreshToken fehlt im Request-Body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    return new Response(JSON.stringify({ error: text }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const tokens = await tokenRes.json()

  return new Response(
    JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}

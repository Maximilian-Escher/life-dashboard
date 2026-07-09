const TOKEN_URL = 'https://api.ouraring.com/oauth/token'
const DEFAULT_REDIRECT_URI = 'http://localhost:8888/api/auth/oura/callback'

function popupResponse(payload) {
  const html = `<!doctype html>
<html>
  <body>
    <script>
      window.opener && window.opener.postMessage(${JSON.stringify(payload)}, window.location.origin);
      window.close();
    </script>
    <p>Verbindung mit Oura abgeschlossen – dieses Fenster kann geschlossen werden.</p>
  </body>
</html>`
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export default async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const oauthError = url.searchParams.get('error')

  if (oauthError) {
    return popupResponse({ type: 'oura-auth-error', message: oauthError, state })
  }

  if (!code) {
    return popupResponse({ type: 'oura-auth-error', message: 'Kein Code von Oura erhalten.', state })
  }

  const clientId = process.env.OURA_CLIENT_ID
  const clientSecret = process.env.OURA_CLIENT_SECRET
  const redirectUri = process.env.OURA_REDIRECT_URI || DEFAULT_REDIRECT_URI

  if (!clientId || !clientSecret) {
    return popupResponse({
      type: 'oura-auth-error',
      message: 'OURA_CLIENT_ID/OURA_CLIENT_SECRET fehlen in den Umgebungsvariablen (.env).',
      state,
    })
  }

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    return popupResponse({ type: 'oura-auth-error', message: `Token-Austausch fehlgeschlagen: ${text}`, state })
  }

  const tokens = await tokenRes.json()

  return popupResponse({
    type: 'oura-auth-success',
    state,
    tokens: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    },
  })
}

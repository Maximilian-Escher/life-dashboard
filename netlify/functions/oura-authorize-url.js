const OURA_AUTHORIZE_URL = 'https://cloud.ouraring.com/oauth/authorize'
const DEFAULT_REDIRECT_URI = 'http://localhost:8888/api/auth/oura/callback'

export default async () => {
  const clientId = process.env.OURA_CLIENT_ID
  const redirectUri = process.env.OURA_REDIRECT_URI || DEFAULT_REDIRECT_URI

  if (!clientId) {
    return new Response(
      JSON.stringify({ error: 'OURA_CLIENT_ID fehlt in den Umgebungsvariablen (.env).' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const state = crypto.randomUUID()
  const url = new URL(OURA_AUTHORIZE_URL)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', 'personal daily')
  url.searchParams.set('state', state)

  return new Response(JSON.stringify({ url: url.toString(), state }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

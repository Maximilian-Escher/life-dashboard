const STORAGE_KEY = 'oura_tokens'
const STATE_KEY = 'oura_oauth_state'

export function getStoredTokens() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function storeTokens({ accessToken, refreshToken, expiresIn }) {
  const tokens = {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  return tokens
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isConnected() {
  return Boolean(getStoredTokens()?.refreshToken)
}

async function refreshTokens(refreshToken) {
  const res = await fetch('/.netlify/functions/oura-refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) {
    clearTokens()
    throw new Error('Oura-Verbindung abgelaufen, bitte erneut verbinden.')
  }
  return storeTokens(await res.json())
}

export async function getValidAccessToken() {
  const tokens = getStoredTokens()
  if (!tokens) return null

  const isExpiringSoon = tokens.expiresAt - Date.now() < 60_000
  if (!isExpiringSoon) return tokens.accessToken
  if (!tokens.refreshToken) return null

  const refreshed = await refreshTokens(tokens.refreshToken)
  return refreshed.accessToken
}

export function connectOura() {
  return new Promise((resolve, reject) => {
    fetch('/.netlify/functions/oura-authorize-url')
      .then((res) => res.json())
      .then(({ url, state, error }) => {
        if (error) throw new Error(error)

        sessionStorage.setItem(STATE_KEY, state)
        const popup = window.open(url, 'oura-oauth', 'width=480,height=720')

        if (!popup) {
          reject(new Error('Popup wurde blockiert. Bitte Popups für diese Seite erlauben.'))
          return
        }

        let settled = false

        function cleanup() {
          settled = true
          window.removeEventListener('message', handleMessage)
          clearInterval(closedCheck)
          sessionStorage.removeItem(STATE_KEY)
        }

        function handleMessage(event) {
          if (event.origin !== window.location.origin) return
          const data = event.data
          if (!data || (data.type !== 'oura-auth-success' && data.type !== 'oura-auth-error')) return

          if (data.state && data.state !== sessionStorage.getItem(STATE_KEY)) {
            cleanup()
            reject(new Error('State-Mismatch bei der Oura-Anmeldung (möglicher CSRF-Versuch).'))
            return
          }

          cleanup()

          if (data.type === 'oura-auth-error') {
            reject(new Error(data.message))
            return
          }

          resolve(storeTokens(data.tokens))
        }

        const closedCheck = setInterval(() => {
          if (popup.closed && !settled) {
            cleanup()
            reject(new Error('Anmeldung abgebrochen.'))
          }
        }, 500)

        window.addEventListener('message', handleMessage)
      })
      .catch(reject)
  })
}

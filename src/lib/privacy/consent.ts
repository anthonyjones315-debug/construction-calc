export const COOKIE_CONSENT_STORAGE_KEY = 'bcp-cookie-consent-v1'
export const COOKIE_CONSENT_COOKIE_NAME = 'bcp_cookie_consent'
export const COOKIE_PREFERENCES_OPEN_EVENT = 'bcp:open-cookie-preferences'
export const COOKIE_CONSENT_CHANGED_EVENT = 'bcp:cookie-consent-changed'

export type CookieConsentChoice = 'accepted' | 'rejected'

function parseCookieValue(cookieName: string): string | null {
  if (typeof document === 'undefined') return null

  const encodedName = `${cookieName}=`
  const match = document.cookie
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(encodedName))

  return match ? decodeURIComponent(match.slice(encodedName.length)) : null
}

export function readCookieConsent(): CookieConsentChoice | null {
  if (typeof window === 'undefined') return null

  const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
  if (stored === 'accepted' || stored === 'rejected') return stored

  const cookieValue = parseCookieValue(COOKIE_CONSENT_COOKIE_NAME)
  return cookieValue === 'accepted' || cookieValue === 'rejected'
    ? cookieValue
    : null
}

export function writeCookieConsent(choice: CookieConsentChoice) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice)

  if (typeof document !== 'undefined') {
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(choice)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
  }

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: choice }),
  )
}

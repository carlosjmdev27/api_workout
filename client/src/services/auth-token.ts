/**
 * Session token storage. localStorage keeps the session across reloads and phone
 * restarts (7-day token). It is readable by scripts on this origin, so the app must
 * never render untrusted HTML; nginx also sends a strict Content-Security-Policy.
 */
const TOKEN_KEY = 'gym_auth_token';

function read(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null; // Private mode / blocked storage: session lasts until reload.
  }
}

let current: string | null = read();

export function getToken(): string | null {
  return current;
}

export function setToken(token: string): void {
  current = token;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Keep it in memory only.
  }
}

export function clearToken(): void {
  current = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing stored.
  }
}

type Listener = () => void;
const expiredListeners = new Set<Listener>();

/** Called by the HTTP client when the API rejects our token (expired, revoked...). */
export function notifySessionExpired(): void {
  expiredListeners.forEach((listener) => listener());
}

export function onSessionExpired(listener: Listener): () => void {
  expiredListeners.add(listener);
  return () => {
    expiredListeners.delete(listener);
  };
}

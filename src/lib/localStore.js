// Small JSON localStorage helper. Used by the service layer as a stand-in
// persistence layer until the Supabase "watchwell" schema is defined —
// swapping a service's internals to real Supabase calls later won't change
// its exported function signatures, so callers (UI) won't need to change.

const PREFIX = 'watchwell:'

export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeStore(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

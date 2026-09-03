// Central place for reading required env vars. Each getter throws a clear,
// specific error the first time a feature that actually needs the value is
// used — we never fall back to a placeholder that would fail silently later.

function required(name) {
  const value = import.meta.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to ` +
        `.env.local and fill in real values (see README.md).`,
    )
  }
  return value
}

export function getSupabaseConfig() {
  return {
    url: required('VITE_SUPABASE_URL'),
    anonKey: required('VITE_SUPABASE_ANON_KEY'),
  }
}

export function getYoutubeApiKey() {
  return required('VITE_YOUTUBE_API_KEY')
}

export function getAdminPin() {
  return required('VITE_ADMIN_PIN')
}

// Cosmetic only (used in the home feed greeting and avatar initial) — not
// required, since the app should still work before this is configured.
export function getKidName() {
  return import.meta.env.VITE_KID_NAME || 'there'
}

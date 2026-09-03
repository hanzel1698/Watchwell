// Backed by Supabase (watchwell_settings, key 'daily_time_limit_minutes' —
// seeded to 60 by the migration). Cumulative watch time resets automatically
// at local midnight because "today" is computed from the local date string.

import { getSupabaseClient } from '../lib/supabaseClient'
import { getWatchHistory } from './watchHistoryService'

const LIMIT_SETTING_KEY = 'daily_time_limit_minutes'
const DEFAULT_LIMIT_MINUTES = 60

function todayLocalDateString() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export async function getDailyLimitMinutes() {
  const { data, error } = await getSupabaseClient()
    .from('watchwell_settings')
    .select('value')
    .eq('key', LIMIT_SETTING_KEY)
    .maybeSingle()
  if (error) throw error
  return data ? Number(data.value) : DEFAULT_LIMIT_MINUTES
}

export async function setDailyLimitMinutes(minutes) {
  const { error } = await getSupabaseClient()
    .from('watchwell_settings')
    .upsert({ key: LIMIT_SETTING_KEY, value: String(minutes) }, { onConflict: 'key' })
  if (error) throw error
}

export async function getWatchedSecondsToday() {
  const today = todayLocalDateString()
  const history = await getWatchHistory()
  return history
    .filter((entry) => entry.watchedAt.startsWith(today))
    .reduce((total, entry) => total + (entry.durationWatchedSeconds || 0), 0)
}

export async function getRemainingSecondsToday() {
  const [limitMinutes, watchedSeconds] = await Promise.all([
    getDailyLimitMinutes(),
    getWatchedSecondsToday(),
  ])
  return Math.max(0, limitMinutes * 60 - watchedSeconds)
}

export async function isDailyLimitReached() {
  return (await getRemainingSecondsToday()) <= 0
}

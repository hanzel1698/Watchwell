// TEMPORARY: backed by localStorage until Supabase is wired up (see
// whitelistService.js). Cumulative watch time resets automatically at local
// midnight because it's keyed by today's local date string.

import { readStore, writeStore } from '../lib/localStore'
import { getHistoryForDate } from './watchHistoryService'

const LIMIT_KEY = 'dailyLimitMinutes'
const DEFAULT_LIMIT_MINUTES = 60

function todayLocalDateString() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function getDailyLimitMinutes() {
  return readStore(LIMIT_KEY, DEFAULT_LIMIT_MINUTES)
}

export function setDailyLimitMinutes(minutes) {
  writeStore(LIMIT_KEY, minutes)
}

export function getWatchedSecondsToday() {
  return getHistoryForDate(todayLocalDateString()).reduce(
    (total, entry) => total + (entry.durationWatchedSeconds || 0),
    0,
  )
}

export function getRemainingSecondsToday() {
  const limitSeconds = getDailyLimitMinutes() * 60
  return Math.max(0, limitSeconds - getWatchedSecondsToday())
}

export function isDailyLimitReached() {
  return getRemainingSecondsToday() <= 0
}

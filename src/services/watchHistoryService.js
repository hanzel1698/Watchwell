// TEMPORARY: backed by localStorage until Supabase is wired up (see
// whitelistService.js). Admin-visible, never editable by the kid UI.

import { readStore, writeStore } from '../lib/localStore'

const HISTORY_KEY = 'watchHistory'

export function getWatchHistory() {
  return readStore(HISTORY_KEY, [])
}

// entry: { videoId, title, channelTitle, watchedAt, durationWatchedSeconds }
export function logWatch(entry) {
  const history = getWatchHistory()
  const next = [{ ...entry, watchedAt: entry.watchedAt ?? new Date().toISOString() }, ...history]
  writeStore(HISTORY_KEY, next)
  return next
}

export function getHistoryForDate(dateString) {
  return getWatchHistory().filter((entry) => entry.watchedAt.startsWith(dateString))
}

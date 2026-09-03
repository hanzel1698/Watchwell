// Caches whitelisted channels' latest uploads so the kid-facing feed never
// calls the YouTube API directly (quota-safe). Refreshed explicitly — on
// admin dashboard load, or by calling refreshFeedCache() from a scheduled
// job — never on every kid page view.
//
// TEMPORARY: backed by localStorage until Supabase is wired up (see
// whitelistService.js).

import { readStore, writeStore } from '../lib/localStore'
import { getWhitelistedChannels, getWhitelistedVideos } from './whitelistService'
import { getChannelUploads } from './youtubeApi'

const CACHE_KEY = 'feedCache'
const STALE_AFTER_MS = 4 * 60 * 60 * 1000 // 4 hours

export function getCachedFeed() {
  return readStore(CACHE_KEY, { videos: [], refreshedAt: null })
}

export function isFeedStale() {
  const { refreshedAt } = getCachedFeed()
  if (!refreshedAt) return true
  return Date.now() - new Date(refreshedAt).getTime() > STALE_AFTER_MS
}

// Pulls latest uploads for every whitelisted channel, merges in individually
// whitelisted videos, de-dupes, sorts newest first, and caches the result.
export async function refreshFeedCache() {
  const channels = getWhitelistedChannels()
  const individualVideos = getWhitelistedVideos()

  const uploadsByChannel = await Promise.all(
    channels
      .filter((c) => c.uploadsPlaylistId)
      .map((c) => getChannelUploads(c.uploadsPlaylistId).catch(() => [])),
  )

  const byVideoId = new Map()
  for (const video of individualVideos) byVideoId.set(video.videoId, video)
  for (const uploads of uploadsByChannel) {
    for (const video of uploads) {
      if (!byVideoId.has(video.videoId)) byVideoId.set(video.videoId, video)
    }
  }

  const videos = [...byVideoId.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )

  const cache = { videos, refreshedAt: new Date().toISOString() }
  writeStore(CACHE_KEY, cache)
  return cache
}

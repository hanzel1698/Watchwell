// Refreshes the kid feed's "cache" — which is just watchwell_videos itself.
// For each whitelisted channel, pulls its latest uploads from YouTube and
// upserts them into watchwell_videos (channel_id set). Meant to be called
// sparingly (admin dashboard visit / a scheduled job), never on kid page
// loads — kid pages just read watchwell_videos directly via
// whitelistService.getAllApprovedVideos(), which never touches the
// YouTube API.

import { getSupabaseClient } from '../lib/supabaseClient'
import { getWhitelistedChannels } from './whitelistService'
import { getChannelUploads, getVideoDurations, uploadsPlaylistIdFor } from './youtubeApi'

const STALE_AFTER_MS = 4 * 60 * 60 * 1000 // 4 hours
// No dedicated "last refreshed" column in the schema, so it's tracked as a
// synthetic row in watchwell_settings alongside the time limit.
const REFRESH_SETTING_KEY = 'feed_last_refreshed_at'

export async function getFeedRefreshedAt() {
  const { data, error } = await getSupabaseClient()
    .from('watchwell_settings')
    .select('value')
    .eq('key', REFRESH_SETTING_KEY)
    .maybeSingle()
  if (error) throw error
  return data?.value ?? null
}

export async function isFeedStale() {
  const refreshedAt = await getFeedRefreshedAt()
  if (!refreshedAt) return true
  return Date.now() - new Date(refreshedAt).getTime() > STALE_AFTER_MS
}

export async function refreshFeedCache() {
  const supabase = getSupabaseClient()
  const channels = await getWhitelistedChannels()

  for (const channel of channels) {
    const uploadsPlaylistId = uploadsPlaylistIdFor(channel.channelId)
    if (!uploadsPlaylistId) continue

    let uploads
    try {
      uploads = await getChannelUploads(uploadsPlaylistId)
    } catch {
      continue // one channel failing (deleted/private) shouldn't abort the whole refresh
    }
    if (uploads.length === 0) continue

    const durations = await getVideoDurations(uploads.map((v) => v.videoId)).catch(() => ({}))

    const rows = uploads.map((v) => ({
      youtube_video_id: v.videoId,
      title: v.title,
      thumbnail_url: v.thumbnailUrl,
      duration_seconds: durations[v.videoId] ?? null,
      published_at: v.publishedAt,
      channel_id: channel.dbId,
    }))

    const { error } = await supabase
      .from('watchwell_videos')
      .upsert(rows, { onConflict: 'youtube_video_id' })
    if (error) throw error
  }

  const refreshedAt = new Date().toISOString()
  const { error } = await supabase
    .from('watchwell_settings')
    .upsert({ key: REFRESH_SETTING_KEY, value: refreshedAt }, { onConflict: 'key' })
  if (error) throw error

  return { refreshedAt }
}

// Refreshes the kid feed's "cache" — which is just watchwell_videos itself.
// For each whitelisted channel, pulls its latest uploads from YouTube and
// upserts them into watchwell_videos (channel_id set). Uploads are stored
// regardless of length or live status; those rules (see contentFilterService)
// are applied when the kid pages read them back, so changing the minimum
// length takes effect immediately instead of needing another refresh — and
// another round of API quota.
//
// Meant to be called sparingly (admin dashboard visit / a scheduled job),
// never on kid page loads — kid pages just read watchwell_videos directly via
// whitelistService.getKidFeedVideos(), which never touches the YouTube API.

import { getSupabaseClient } from '../lib/supabaseClient'
import { getWhitelistedChannels } from './whitelistService'
import { getChannelUploads, getVideoDetails, uploadsPlaylistIdFor } from './youtubeApi'

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

// Pulls one channel's latest uploads and upserts them into watchwell_videos.
// Exported separately so adding a new channel can populate its videos
// immediately, instead of waiting for the next scheduled/manual refresh.
export async function refreshChannelUploads(channel) {
  const uploadsPlaylistId = uploadsPlaylistIdFor(channel.channelId)
  if (!uploadsPlaylistId) return

  let uploads
  try {
    uploads = await getChannelUploads(uploadsPlaylistId)
  } catch {
    return // deleted/private channel shouldn't block whatever called this
  }
  if (uploads.length === 0) return

  // Duration and live status now decide whether an upload is shown to the kid
  // at all, so a failed lookup can't be shrugged off: writing nulls would hide
  // the whole channel. Leave the previously-cached rows alone and retry on the
  // next refresh instead.
  let details
  try {
    details = await getVideoDetails(uploads.map((v) => v.videoId))
  } catch {
    return
  }

  // A stream that's live today is an ordinary archived video once it ends, so
  // is_live is rewritten on every refresh rather than latched on first sight.
  const rows = uploads.map((v) => ({
    youtube_video_id: v.videoId,
    title: v.title,
    thumbnail_url: v.thumbnailUrl,
    duration_seconds: details[v.videoId]?.durationSeconds ?? null,
    is_live: details[v.videoId]?.isLive ?? false,
    published_at: v.publishedAt,
    channel_id: channel.dbId,
  }))

  const { error } = await getSupabaseClient()
    .from('watchwell_videos')
    .upsert(rows, { onConflict: 'youtube_video_id' })
  if (error) throw error
}

export async function refreshFeedCache() {
  const channels = await getWhitelistedChannels()

  for (const channel of channels) {
    await refreshChannelUploads(channel)
  }

  const refreshedAt = new Date().toISOString()
  const { error } = await getSupabaseClient()
    .from('watchwell_settings')
    .upsert({ key: REFRESH_SETTING_KEY, value: refreshedAt }, { onConflict: 'key' })
  if (error) throw error

  return { refreshedAt }
}

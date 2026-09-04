// What the kid is allowed to see, beyond the whitelist itself: a minimum
// video length (backed by Supabase — watchwell_settings, key
// 'min_video_duration_minutes') and a blanket exclusion of live streams.
//
// Duration and live status are already fetched and stored by
// feedCache.refreshChannelUploads (one batched videos.list call per channel
// refresh, the same single quota unit whichever parts it asks for), so
// neither rule costs extra YouTube quota. Applying them at read time rather
// than at ingest also means changing the minimum takes effect immediately,
// without waiting for — or paying for — another feed refresh.

import { getSupabaseClient } from '../lib/supabaseClient'

const MIN_DURATION_SETTING_KEY = 'min_video_duration_minutes'
export const DEFAULT_MIN_DURATION_MINUTES = 20

export async function getMinDurationMinutes() {
  const { data, error } = await getSupabaseClient()
    .from('watchwell_settings')
    .select('value')
    .eq('key', MIN_DURATION_SETTING_KEY)
    .maybeSingle()
  if (error) throw error
  return data ? Number(data.value) : DEFAULT_MIN_DURATION_MINUTES
}

export async function setMinDurationMinutes(minutes) {
  const { error } = await getSupabaseClient()
    .from('watchwell_settings')
    .upsert({ key: MIN_DURATION_SETTING_KEY, value: String(minutes) }, { onConflict: 'key' })
  if (error) throw error
}

// Decides whether one video (as mapped by whitelistService) belongs in the
// kid's catalog.
//
// Live and scheduled broadcasts never do, however they were added: a stream
// that runs continuously has no end to reach and no length to measure, which
// is exactly the open-ended watching the app is built to avoid. (An archived
// recording of a finished broadcast isn't live — it's an ordinary video with
// a real duration — and is judged on length like any other.)
//
// On length, a video the admin whitelisted individually (channelId null)
// always passes: the minimum exists to tame the automatic firehose of channel
// uploads, not to veto a video a parent deliberately picked out.
//
// A channel upload with no resolved duration does *not* pass — we can't
// confirm it clears the bar, and the next feed refresh fills the duration in.
export function meetsKidFeedCriteria(video, minDurationMinutes) {
  if (video.isLive) return false
  if (!minDurationMinutes || minDurationMinutes <= 0) return true
  if (video.channelId === null) return true
  return (video.durationSeconds ?? 0) >= minDurationMinutes * 60
}

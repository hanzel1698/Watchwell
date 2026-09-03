// Backed by Supabase (watchwell_watch_history). Admin-visible, never
// editable by the kid UI. Note: the schema doesn't store a channel name on
// history rows, only the video's own title.

import { getSupabaseClient } from '../lib/supabaseClient'

function mapRow(row) {
  return {
    videoId: row.youtube_video_id,
    title: row.title,
    watchedAt: row.watched_at,
    durationWatchedSeconds: row.duration_seconds,
  }
}

export async function getWatchHistory() {
  const { data, error } = await getSupabaseClient()
    .from('watchwell_watch_history')
    .select('*')
    .order('watched_at', { ascending: false })
    .limit(500)
  if (error) throw error
  return data.map(mapRow)
}

// entry: { videoId, title, durationWatchedSeconds }
export async function logWatch(entry) {
  const { error } = await getSupabaseClient().from('watchwell_watch_history').insert({
    youtube_video_id: entry.videoId,
    title: entry.title,
    duration_seconds: entry.durationWatchedSeconds,
  })
  if (error) throw error
}

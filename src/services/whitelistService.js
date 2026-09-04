// Backed by Supabase (watchwell_channels / watchwell_videos — see
// supabase/migrations/0001_watchwell_schema.sql).
//
// watchwell_videos serves two roles at once, distinguished by channel_id:
//   - channel_id set   -> a cached upload from a whitelisted channel
//                          (written by feedCache.refreshFeedCache)
//   - channel_id null  -> a video the admin whitelisted individually
// getAllApprovedVideos() returns both (the admin's view of everything
// approved); getKidFeedVideos() narrows that to what the kid may actually
// see, dropping live streams and channel uploads under the admin's
// minimum-length setting (see contentFilterService); getWhitelistedVideos()
// returns only the individually-whitelisted ones, for the admin's
// "Manage Videos" list.
//
// Since migration 0003 the FK cascades on delete, so channel_id null means
// "the admin picked this video individually" and nothing else — removing a
// channel takes its cached uploads with it instead of orphaning them.
//
// Known schema limitation: watchwell_videos has no channel-name column of
// its own, only the nullable FK to watchwell_channels. So an individually
// whitelisted video (channel_id null) has no persisted channel name —
// channelTitle comes back null for those, and the UI falls back to a
// generic label rather than an extra YouTube API call per video.

import { getSupabaseClient } from '../lib/supabaseClient'
import { getMinDurationMinutes, meetsKidFeedCriteria } from './contentFilterService'

function mapChannelRow(row) {
  return {
    dbId: row.id,
    channelId: row.youtube_channel_id,
    title: row.channel_name,
    thumbnailUrl: row.thumbnail_url,
    addedAt: row.added_at,
  }
}

function mapVideoRow(row) {
  return {
    dbId: row.id,
    videoId: row.youtube_video_id,
    title: row.title,
    thumbnailUrl: row.thumbnail_url,
    durationSeconds: row.duration_seconds,
    isLive: row.is_live ?? false,
    channelId: row.watchwell_channels?.youtube_channel_id ?? null,
    channelTitle: row.watchwell_channels?.channel_name ?? null,
    publishedAt: row.published_at,
    addedAt: row.added_at,
  }
}

export async function getWhitelistedChannels() {
  const { data, error } = await getSupabaseClient()
    .from('watchwell_channels')
    .select('*')
    .order('added_at', { ascending: false })
  if (error) throw error
  return data.map(mapChannelRow)
}

// Every approved video (individually whitelisted + cached channel
// uploads), newest upload first — the admin's full view, unfiltered.
export async function getAllApprovedVideos() {
  const { data, error } = await getSupabaseClient()
    .from('watchwell_videos')
    .select('*, watchwell_channels(youtube_channel_id, channel_name)')
    .order('published_at', { ascending: false, nullsFirst: false })
  if (error) throw error
  return data.map(mapVideoRow)
}

// The kid's catalog: approved videos that also pass the content rules in
// contentFilterService (no live streams, and long enough). Every kid-facing
// surface (home feed, search, "up next", history, and the watch page's own
// is-this-allowed check) reads this instead of getAllApprovedVideos, so those
// rules are a real gate rather than just a tweak to what the home feed
// happens to list.
export async function getKidFeedVideos() {
  const [videos, minDurationMinutes] = await Promise.all([
    getAllApprovedVideos(),
    getMinDurationMinutes(),
  ])
  return videos.filter((video) => meetsKidFeedCriteria(video, minDurationMinutes))
}

// Individually-whitelisted videos only — for the admin "Manage Videos" list.
export async function getWhitelistedVideos() {
  const { data, error } = await getSupabaseClient()
    .from('watchwell_videos')
    .select('*, watchwell_channels(youtube_channel_id, channel_name)')
    .is('channel_id', null)
    .order('added_at', { ascending: false })
  if (error) throw error
  return data.map(mapVideoRow)
}

// channel: { channelId, title, thumbnailUrl } from youtubeApi.resolveChannel
// Returns the inserted row (mapped, with dbId) so the caller can immediately
// fetch this channel's uploads without waiting for the next scheduled refresh.
export async function addWhitelistedChannel(channel) {
  const { data, error } = await getSupabaseClient()
    .from('watchwell_channels')
    .insert({
      youtube_channel_id: channel.channelId,
      channel_name: channel.title,
      thumbnail_url: channel.thumbnailUrl,
    })
    .select()
    .single()
  if (error) {
    if (error.code === '23505') {
      throw new Error(`Channel "${channel.title}" is already whitelisted.`)
    }
    throw error
  }
  return mapChannelRow(data)
}

export async function removeWhitelistedChannel(channelId) {
  const supabase = getSupabaseClient()

  const { data: channel, error: lookupError } = await supabase
    .from('watchwell_channels')
    .select('id')
    .eq('youtube_channel_id', channelId)
    .maybeSingle()
  if (lookupError) throw lookupError
  if (!channel) return

  // Delete the channel's cached uploads first. Migration 0003 makes the FK
  // ON DELETE CASCADE, which handles this at the database level whatever
  // route the delete takes — but doing it here too means the app still
  // behaves correctly against a database that only has 0001/0002, where the
  // FK is still ON DELETE SET NULL and orphaned uploads would otherwise be
  // silently reclassified as individually-whitelisted videos: left in the
  // kid's feed and exempt from the minimum-length rule.
  const { error: videosError } = await supabase
    .from('watchwell_videos')
    .delete()
    .eq('channel_id', channel.id)
  if (videosError) throw videosError

  const { error } = await supabase
    .from('watchwell_channels')
    .delete()
    .eq('youtube_channel_id', channelId)
  if (error) throw error
}

// video: { videoId, title, thumbnailUrl, durationSeconds, publishedAt, isLive }
// from youtubeApi.resolveVideo
export async function addWhitelistedVideo(video) {
  // Live streams are refused outright rather than stored and hidden — unlike
  // a short video, there's no length an admin could dial down to make one
  // playable, so accepting it would just add a row that never shows up.
  if (video.isLive) {
    throw new Error(
      `"${video.title}" is a live stream. WatchWell doesn't play live video — ` +
        `add the recording once the broadcast has ended.`,
    )
  }

  const { error } = await getSupabaseClient().from('watchwell_videos').insert({
    youtube_video_id: video.videoId,
    title: video.title,
    thumbnail_url: video.thumbnailUrl,
    duration_seconds: video.durationSeconds,
    is_live: false,
    published_at: video.publishedAt,
    channel_id: null,
  })
  if (error) {
    if (error.code === '23505') {
      throw new Error(`Video "${video.title}" is already whitelisted.`)
    }
    throw error
  }
}

export async function removeWhitelistedVideo(videoId) {
  const { error } = await getSupabaseClient()
    .from('watchwell_videos')
    .delete()
    .eq('youtube_video_id', videoId)
  if (error) throw error
}

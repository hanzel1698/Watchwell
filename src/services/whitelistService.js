// Backed by Supabase (watchwell_channels / watchwell_videos — see
// supabase/migrations/0001_watchwell_schema.sql).
//
// watchwell_videos serves two roles at once, distinguished by channel_id:
//   - channel_id set   -> a cached upload from a whitelisted channel
//                          (written by feedCache.refreshFeedCache)
//   - channel_id null  -> a video the admin whitelisted individually
// getAllApprovedVideos() returns both (that's the kid's full catalog);
// getWhitelistedVideos() returns only the individually-whitelisted ones,
// for the admin's "Manage Videos" list.
//
// Known schema limitation: watchwell_videos has no channel-name column of
// its own, only the nullable FK to watchwell_channels. So an individually
// whitelisted video (channel_id null) has no persisted channel name —
// channelTitle comes back null for those, and the UI falls back to a
// generic label rather than an extra YouTube API call per video.

import { getSupabaseClient } from '../lib/supabaseClient'

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
// uploads), newest upload first — this is the kid's home feed / search catalog.
export async function getAllApprovedVideos() {
  const { data, error } = await getSupabaseClient()
    .from('watchwell_videos')
    .select('*, watchwell_channels(youtube_channel_id, channel_name)')
    .order('published_at', { ascending: false, nullsFirst: false })
  if (error) throw error
  return data.map(mapVideoRow)
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
  const { error } = await getSupabaseClient()
    .from('watchwell_channels')
    .delete()
    .eq('youtube_channel_id', channelId)
  if (error) throw error
}

// video: { videoId, title, thumbnailUrl, durationSeconds, publishedAt }
// from youtubeApi.resolveVideo
export async function addWhitelistedVideo(video) {
  const { error } = await getSupabaseClient().from('watchwell_videos').insert({
    youtube_video_id: video.videoId,
    title: video.title,
    thumbnail_url: video.thumbnailUrl,
    duration_seconds: video.durationSeconds,
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

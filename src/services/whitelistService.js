// TEMPORARY: backed by localStorage until the Supabase "watchwell" schema
// (coming in a follow-up migration script) is wired up. Function signatures
// are meant to stay stable when that swap happens — only the internals here
// should need to change.

import { readStore, writeStore } from '../lib/localStore'

const CHANNELS_KEY = 'whitelistedChannels'
const VIDEOS_KEY = 'whitelistedVideos'

export function getWhitelistedChannels() {
  return readStore(CHANNELS_KEY, [])
}

export function getWhitelistedVideos() {
  return readStore(VIDEOS_KEY, [])
}

// channel: { channelId, title, thumbnailUrl, uploadsPlaylistId } from youtubeApi.resolveChannel
export function addWhitelistedChannel(channel) {
  const channels = getWhitelistedChannels()
  if (channels.some((c) => c.channelId === channel.channelId)) {
    throw new Error(`Channel "${channel.title}" is already whitelisted.`)
  }
  const next = [...channels, { ...channel, addedAt: new Date().toISOString() }]
  writeStore(CHANNELS_KEY, next)
  return next
}

export function removeWhitelistedChannel(channelId) {
  const next = getWhitelistedChannels().filter((c) => c.channelId !== channelId)
  writeStore(CHANNELS_KEY, next)
  return next
}

// video: { videoId, title, channelId, channelTitle, thumbnailUrl, durationSeconds, publishedAt }
// from youtubeApi.resolveVideo
export function addWhitelistedVideo(video) {
  const videos = getWhitelistedVideos()
  if (videos.some((v) => v.videoId === video.videoId)) {
    throw new Error(`Video "${video.title}" is already whitelisted.`)
  }
  const next = [...videos, { ...video, addedAt: new Date().toISOString() }]
  writeStore(VIDEOS_KEY, next)
  return next
}

export function removeWhitelistedVideo(videoId) {
  const next = getWhitelistedVideos().filter((v) => v.videoId !== videoId)
  writeStore(VIDEOS_KEY, next)
  return next
}

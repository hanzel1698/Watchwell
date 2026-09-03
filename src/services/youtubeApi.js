// Thin wrapper around the YouTube Data API v3, used only by the admin
// dashboard (resolving channels/videos to whitelist, refreshing cached
// "latest uploads"). Never used for open-ended search — the kid-facing
// search filters cached whitelist data client-side instead.

import { getYoutubeApiKey } from '../lib/config'

const API_BASE = 'https://www.googleapis.com/youtube/v3'

async function apiGet(path, params) {
  const url = new URL(`${API_BASE}/${path}`)
  url.searchParams.set('key', getYoutubeApiKey())
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, value)
  }

  const res = await fetch(url.toString())
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = body?.error?.message || res.statusText
    throw new Error(`YouTube API error (${res.status}): ${message}`)
  }
  return res.json()
}

// Accepts a pasted channel/video URL or a bare ID/handle and figures out
// what kind of reference it is, so the admin doesn't have to think about it.
export function parseYouTubeInput(rawInput) {
  const input = rawInput.trim()

  try {
    const url = new URL(input)
    if (url.hostname.includes('youtu.be')) {
      const videoId = url.pathname.slice(1).split('/')[0]
      if (videoId) return { type: 'videoId', value: videoId }
    }
    if (url.hostname.includes('youtube.com')) {
      const videoId = url.searchParams.get('v')
      if (videoId) return { type: 'videoId', value: videoId }

      const segments = url.pathname.split('/').filter(Boolean)
      if (segments[0] === 'channel' && segments[1]) {
        return { type: 'channelId', value: segments[1] }
      }
      if (segments[0] === 'shorts' && segments[1]) {
        return { type: 'videoId', value: segments[1] }
      }
      if (segments[0]?.startsWith('@')) {
        return { type: 'handle', value: segments[0] }
      }
      if (segments[0] === 'c' && segments[1]) {
        return { type: 'customUrl', value: segments[1] }
      }
      if (segments[0] === 'user' && segments[1]) {
        return { type: 'username', value: segments[1] }
      }
    }
  } catch {
    // Not a URL — fall through to bare-value heuristics below.
  }

  if (input.startsWith('@')) return { type: 'handle', value: input }
  if (input.startsWith('UC') && input.length === 24) {
    return { type: 'channelId', value: input }
  }
  if (input.length === 11) return { type: 'videoId', value: input }

  return { type: 'unknown', value: input }
}

function toChannelSummary(channelResource) {
  return {
    channelId: channelResource.id,
    title: channelResource.snippet.title,
    thumbnailUrl:
      channelResource.snippet.thumbnails?.medium?.url ??
      channelResource.snippet.thumbnails?.default?.url,
    uploadsPlaylistId: channelResource.contentDetails?.relatedPlaylists?.uploads,
  }
}

// Resolves any pasted channel reference (URL, @handle, channel ID, legacy
// username) into { channelId, title, thumbnailUrl, uploadsPlaylistId }.
export async function resolveChannel(rawInput) {
  const parsed = parseYouTubeInput(rawInput)
  const part = 'snippet,contentDetails'
  let data

  if (parsed.type === 'channelId') {
    data = await apiGet('channels', { part, id: parsed.value })
  } else if (parsed.type === 'handle') {
    data = await apiGet('channels', { part, forHandle: parsed.value.replace(/^@/, '@') })
  } else if (parsed.type === 'username') {
    data = await apiGet('channels', { part, forUsername: parsed.value })
  } else if (parsed.type === 'customUrl') {
    // Legacy /c/CustomName URLs aren't resolvable via channels.list directly;
    // search.list is the only way and costs much more quota, so we only pay
    // that cost for this one uncommon case.
    const searchData = await apiGet('search', {
      part: 'snippet',
      q: parsed.value,
      type: 'channel',
      maxResults: 1,
    })
    const channelId = searchData.items?.[0]?.snippet?.channelId
    if (!channelId) throw new Error(`Could not resolve channel from "${rawInput}".`)
    data = await apiGet('channels', { part, id: channelId })
  } else {
    throw new Error(`"${rawInput}" doesn't look like a YouTube channel URL, handle, or ID.`)
  }

  const channel = data.items?.[0]
  if (!channel) throw new Error(`No YouTube channel found for "${rawInput}".`)
  return toChannelSummary(channel)
}

// Resolves any pasted video reference into
// { videoId, title, channelId, channelTitle, thumbnailUrl, durationSeconds, publishedAt }.
export async function resolveVideo(rawInput) {
  const parsed = parseYouTubeInput(rawInput)
  if (parsed.type !== 'videoId') {
    throw new Error(`"${rawInput}" doesn't look like a YouTube video URL or ID.`)
  }

  const data = await apiGet('videos', {
    part: 'snippet,contentDetails',
    id: parsed.value,
  })
  const video = data.items?.[0]
  if (!video) throw new Error(`No YouTube video found for "${rawInput}".`)

  return {
    videoId: video.id,
    title: video.snippet.title,
    channelId: video.snippet.channelId,
    channelTitle: video.snippet.channelTitle,
    thumbnailUrl:
      video.snippet.thumbnails?.medium?.url ?? video.snippet.thumbnails?.default?.url,
    durationSeconds: parseIso8601Duration(video.contentDetails.duration),
    publishedAt: video.snippet.publishedAt,
  }
}

// Fetches the most recent uploads from a channel's uploads playlist. Meant
// to be called sparingly (admin dashboard refresh / scheduled job), not on
// every kid page load — results should be cached by the caller.
export async function getChannelUploads(uploadsPlaylistId, maxResults = 15) {
  const data = await apiGet('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults,
  })

  return (data.items ?? [])
    .filter((item) => item.snippet.title !== 'Private video' && item.snippet.title !== 'Deleted video')
    .map((item) => ({
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl:
        item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url,
      publishedAt: item.contentDetails.videoPublishedAt ?? item.snippet.publishedAt,
    }))
}

// Video durations come back as ISO 8601 (e.g. "PT4M13S"); the UI wants seconds.
export function parseIso8601Duration(duration) {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if (!match) return 0
  const [, hours, minutes, seconds] = match
  return (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0)
}

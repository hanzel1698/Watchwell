import { useEffect, useState } from 'react'
import AddChannelForm from '../../components/admin/AddChannelForm'
import Avatar from '../../components/shared/Avatar'
import {
  getWhitelistedChannels,
  removeWhitelistedChannel,
  getAllApprovedVideos,
} from '../../services/whitelistService'
import {
  getMinDurationMinutes,
  meetsKidFeedCriteria,
} from '../../services/contentFilterService'

export default function AdminChannels() {
  const [channels, setChannels] = useState(null)
  const [videos, setVideos] = useState([])
  const [minDurationMinutes, setMinDurationMinutes] = useState(0)
  const [error, setError] = useState('')

  async function refresh() {
    try {
      const [nextChannels, nextVideos, nextMinDuration] = await Promise.all([
        getWhitelistedChannels(),
        getAllApprovedVideos(),
        getMinDurationMinutes(),
      ])
      setChannels(nextChannels)
      setVideos(nextVideos)
      setMinDurationMinutes(nextMinDuration)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleRemove(channelId) {
    await removeWhitelistedChannel(channelId)
    refresh()
  }

  return (
    <div>
      <AddChannelForm onAdded={refresh} />

      {error ? <p className="mb-3 text-sm text-brand">{error}</p> : null}

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {channels === null ? (
          <p className="p-5 text-sm text-text-faint">Loading…</p>
        ) : channels.length === 0 ? (
          <p className="p-5 text-sm text-text-faint">No channels whitelisted yet.</p>
        ) : (
          channels.map((channel) => {
            const channelVideos = videos.filter((v) => v.channelId === channel.channelId)
            // Cached uploads this channel contributes, and how many of them
            // clear the length/live rules — "3 of 25" is the honest number
            // when the kid's feed looks thinner than the whitelist.
            const videoCount = channelVideos.length
            const visibleCount = channelVideos.filter((v) =>
              meetsKidFeedCriteria(v, minDurationMinutes),
            ).length
            return (
              <div key={channel.channelId} className="flex items-center gap-3.5 px-4 py-3.5">
                <Avatar label={channel.title} variant="pastel" />
                <span className="flex-1 text-[15px] font-semibold text-text">
                  {channel.title}
                </span>
                <span className="text-sm text-text-muted">
                  {visibleCount === videoCount
                    ? `${videoCount} videos`
                    : `${visibleCount} of ${videoCount} videos`}
                </span>
                <button
                  onClick={() => handleRemove(channel.channelId)}
                  className="h-[34px] rounded-lg border border-brand px-3.5 text-[13px] font-semibold text-brand"
                >
                  Remove
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import AddChannelForm from '../../components/admin/AddChannelForm'
import Avatar from '../../components/shared/Avatar'
import {
  getWhitelistedChannels,
  removeWhitelistedChannel,
  getAllApprovedVideos,
} from '../../services/whitelistService'

export default function AdminChannels() {
  const [channels, setChannels] = useState(null)
  const [videos, setVideos] = useState([])
  const [error, setError] = useState('')

  async function refresh() {
    try {
      const [nextChannels, nextVideos] = await Promise.all([
        getWhitelistedChannels(),
        getAllApprovedVideos(),
      ])
      setChannels(nextChannels)
      setVideos(nextVideos)
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
            const videoCount = videos.filter((v) => v.channelId === channel.channelId).length
            return (
              <div key={channel.channelId} className="flex items-center gap-3.5 px-4 py-3.5">
                <Avatar label={channel.title} variant="pastel" />
                <span className="flex-1 text-[15px] font-semibold text-text">
                  {channel.title}
                </span>
                <span className="text-sm text-text-muted">{videoCount} videos</span>
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

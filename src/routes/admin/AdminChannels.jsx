import { useState } from 'react'
import AddChannelForm from '../../components/admin/AddChannelForm'
import Avatar from '../../components/shared/Avatar'
import {
  getWhitelistedChannels,
  removeWhitelistedChannel,
} from '../../services/whitelistService'
import { getCachedFeed } from '../../services/feedCache'

export default function AdminChannels() {
  const [channels, setChannels] = useState(getWhitelistedChannels)

  function refresh() {
    setChannels(getWhitelistedChannels())
  }

  function handleRemove(channelId) {
    removeWhitelistedChannel(channelId)
    refresh()
  }

  const { videos } = getCachedFeed()

  return (
    <div>
      <AddChannelForm onAdded={refresh} />

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {channels.length === 0 ? (
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

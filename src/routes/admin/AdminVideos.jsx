import { useState } from 'react'
import AddVideoForm from '../../components/admin/AddVideoForm'
import { getWhitelistedVideos, removeWhitelistedVideo } from '../../services/whitelistService'
import { formatDuration } from '../../lib/format'

export default function AdminVideos() {
  const [videos, setVideos] = useState(getWhitelistedVideos)

  function refresh() {
    setVideos(getWhitelistedVideos())
  }

  function handleRemove(videoId) {
    removeWhitelistedVideo(videoId)
    refresh()
  }

  return (
    <div>
      <AddVideoForm onAdded={refresh} />

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {videos.length === 0 ? (
          <p className="p-5 text-sm text-text-faint">No individual videos whitelisted yet.</p>
        ) : (
          videos.map((video) => (
            <div key={video.videoId} className="flex items-center gap-3.5 px-4 py-3">
              <img
                src={video.thumbnailUrl}
                alt=""
                className="h-9 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">{video.title}</p>
                <p className="truncate text-xs text-text-muted">{video.channelTitle}</p>
              </div>
              <span className="text-sm text-text-muted">
                {formatDuration(video.durationSeconds)}
              </span>
              <button
                onClick={() => handleRemove(video.videoId)}
                className="h-[34px] shrink-0 rounded-lg border border-brand px-3.5 text-[13px] font-semibold text-brand"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

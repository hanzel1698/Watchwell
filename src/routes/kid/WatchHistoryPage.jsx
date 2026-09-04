import { useEffect, useState } from 'react'
import VideoGrid from '../../components/kid/VideoGrid'
import { getWatchHistory } from '../../services/watchHistoryService'
import { getKidFeedVideos } from '../../services/whitelistService'

// Shows the videos the kid has watched, most-recently-watched first,
// deduplicated by video. Not editable here — that's the admin's job.
export default function WatchHistoryPage() {
  const [videos, setVideos] = useState(null)

  useEffect(() => {
    Promise.all([getWatchHistory(), getKidFeedVideos()])
      .then(([history, catalog]) => {
        const byId = new Map(catalog.map((v) => [v.videoId, v]))
        const seen = new Set()
        const result = []
        for (const entry of history) {
          if (seen.has(entry.videoId)) continue
          seen.add(entry.videoId)
          const video = byId.get(entry.videoId)
          if (video) result.push(video)
        }
        setVideos(result)
      })
      .catch(() => setVideos([]))
  }, [])

  return (
    <div className="p-7">
      <h1 className="mb-5 font-heading text-[26px] font-bold text-text">
        Videos you've watched
      </h1>
      {videos === null ? (
        <p className="p-10 text-center text-text-faint">Loading…</p>
      ) : (
        <VideoGrid
          videos={videos}
          emptyMessage="You haven't watched any videos yet."
          showDate={false}
        />
      )}
    </div>
  )
}

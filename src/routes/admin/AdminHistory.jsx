import { useEffect, useState } from 'react'
import { getWatchHistory } from '../../services/watchHistoryService'
import { getAllApprovedVideos } from '../../services/whitelistService'
import { formatDuration } from '../../lib/format'

export default function AdminHistory() {
  const [history, setHistory] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // watchwell_watch_history doesn't store a channel name, so it's looked
    // up from the video catalog (falls back to blank if the video was
    // since removed from the whitelist).
    Promise.all([getWatchHistory(), getAllApprovedVideos()])
      .then(([rows, catalog]) => {
        const channelById = new Map(catalog.map((v) => [v.videoId, v.channelTitle]))
        setHistory(
          rows.map((entry) => ({ ...entry, channelTitle: channelById.get(entry.videoId) ?? '—' })),
        )
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid grid-cols-[2fr_1.3fr_1fr_1fr] bg-bg-alt px-4 py-3 text-xs font-bold uppercase tracking-wide text-text-muted">
        <div>Video</div>
        <div>Channel</div>
        <div>Date</div>
        <div>Watched</div>
      </div>
      {error ? (
        <p className="p-5 text-sm text-brand">{error}</p>
      ) : history === null ? (
        <p className="p-5 text-sm text-text-faint">Loading…</p>
      ) : history.length === 0 ? (
        <p className="p-5 text-sm text-text-faint">No videos watched yet.</p>
      ) : (
        history.map((entry, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1.3fr_1fr_1fr] border-t border-border px-4 py-3.5 text-sm text-text"
          >
            <div className="truncate pr-2 font-semibold">{entry.title}</div>
            <div className="truncate pr-2 text-text-muted">{entry.channelTitle}</div>
            <div className="text-text-muted">{new Date(entry.watchedAt).toLocaleDateString()}</div>
            <div className="text-text-muted">{formatDuration(entry.durationWatchedSeconds)}</div>
          </div>
        ))
      )}
    </div>
  )
}

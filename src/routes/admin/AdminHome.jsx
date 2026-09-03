import { useEffect, useState } from 'react'
import { getWhitelistedChannels, getWhitelistedVideos } from '../../services/whitelistService'
import { getDailyLimitMinutes, getWatchedSecondsToday } from '../../services/timeLimitService'
import { refreshFeedCache, isFeedStale, getCachedFeed } from '../../services/feedCache'

function StatCard({ label, children }) {
  return (
    <div className="min-w-[180px] flex-1 rounded-2xl border border-border bg-surface p-5">
      <p className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      {children}
    </div>
  )
}

export default function AdminHome() {
  const [channelCount] = useState(() => getWhitelistedChannels().length)
  const [videoCount] = useState(() => getWhitelistedVideos().length)
  const [limitMinutes] = useState(getDailyLimitMinutes)
  const [watchedMinutes] = useState(() => Math.round(getWatchedSecondsToday() / 60))
  const progressPct = Math.min(100, Math.round((watchedMinutes / limitMinutes) * 100))

  const [refreshing, setRefreshing] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState(() => getCachedFeed().refreshedAt)

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const cache = await refreshFeedCache()
      setRefreshedAt(cache.refreshedAt)
    } finally {
      setRefreshing(false)
    }
  }

  // Keep the kid feed reasonably fresh without hammering the API: refresh
  // once per admin dashboard visit if the cache is stale, never on kid loads.
  useEffect(() => {
    if (isFeedStale() && channelCount + videoCount > 0) handleRefresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="flex flex-wrap gap-5">
        <StatCard label="Today's Watch Time">
          <p className="mb-3 font-heading text-[30px] font-bold text-text">
            {watchedMinutes} / {limitMinutes} min
          </p>
          <div className="h-2.5 overflow-hidden rounded-md bg-bg-alt">
            <div className="h-full rounded-md bg-brand" style={{ width: `${progressPct}%` }} />
          </div>
        </StatCard>
        <StatCard label="Approved Channels">
          <p className="font-heading text-[30px] font-bold text-text">{channelCount}</p>
        </StatCard>
        <StatCard label="Approved Videos">
          <p className="font-heading text-[30px] font-bold text-text">{videoCount}</p>
        </StatCard>
      </div>

      <div className="mt-5 flex items-center gap-3 text-sm text-text-muted">
        <span>
          {refreshing
            ? 'Refreshing feed…'
            : refreshedAt
              ? `Feed last refreshed ${new Date(refreshedAt).toLocaleString()}`
              : 'Feed never refreshed'}
        </span>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="font-semibold text-brand hover:underline disabled:opacity-50"
        >
          Refresh now
        </button>
      </div>
    </div>
  )
}

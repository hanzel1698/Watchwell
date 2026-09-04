import { useEffect, useState } from 'react'
import { getWhitelistedChannels, getAllApprovedVideos } from '../../services/whitelistService'
import { getDailyLimitMinutes, getWatchedSecondsToday } from '../../services/timeLimitService'
import { refreshFeedCache, isFeedStale, getFeedRefreshedAt } from '../../services/feedCache'
import {
  getMinDurationMinutes,
  meetsKidFeedCriteria,
} from '../../services/contentFilterService'

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
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState(null)

  async function loadStats() {
    const [channels, videos, limitMinutes, watchedSeconds, minDurationMinutes] =
      await Promise.all([
        getWhitelistedChannels(),
        getAllApprovedVideos(),
        getDailyLimitMinutes(),
        getWatchedSecondsToday(),
        getMinDurationMinutes(),
      ])
    // The count the kid actually sees, so a feed that looks emptier than the
    // whitelist suggests has a visible explanation here rather than being a
    // mystery.
    const visibleCount = videos.filter((v) =>
      meetsKidFeedCriteria(v, minDurationMinutes),
    ).length
    setStats({
      channelCount: channels.length,
      videoCount: videos.length,
      hiddenCount: videos.length - visibleCount,
      minDurationMinutes,
      limitMinutes,
      watchedMinutes: Math.round(watchedSeconds / 60),
    })
    return { channelCount: channels.length, videoCount: videos.length }
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const cache = await refreshFeedCache()
      setRefreshedAt(cache.refreshedAt)
      await loadStats()
    } finally {
      setRefreshing(false)
    }
  }

  // Keep the kid feed reasonably fresh without hammering the API: refresh
  // once per admin dashboard visit if the cache is stale, never on kid loads.
  useEffect(() => {
    Promise.all([loadStats(), getFeedRefreshedAt()])
      .then(async ([{ channelCount, videoCount }, currentRefreshedAt]) => {
        setRefreshedAt(currentRefreshedAt)
        if (channelCount + videoCount > 0 && (await isFeedStale())) {
          await handleRefresh()
        }
      })
      .catch((err) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) return <p className="text-brand">{error}</p>
  if (!stats) return <p className="text-text-faint">Loading…</p>

  const progressPct = Math.min(100, Math.round((stats.watchedMinutes / stats.limitMinutes) * 100))

  return (
    <div>
      <div className="flex flex-wrap gap-5">
        <StatCard label="Today's Watch Time">
          <p className="mb-3 font-heading text-[30px] font-bold text-text">
            {stats.watchedMinutes} / {stats.limitMinutes} min
          </p>
          <div className="h-2.5 overflow-hidden rounded-md bg-bg-alt">
            <div className="h-full rounded-md bg-brand" style={{ width: `${progressPct}%` }} />
          </div>
        </StatCard>
        <StatCard label="Approved Channels">
          <p className="font-heading text-[30px] font-bold text-text">{stats.channelCount}</p>
        </StatCard>
        <StatCard label="Approved Videos">
          <p className="font-heading text-[30px] font-bold text-text">{stats.videoCount}</p>
          {stats.hiddenCount > 0 ? (
            <p className="mt-1.5 text-[13px] text-text-muted">
              {stats.hiddenCount} hidden — live, or under{' '}
              {stats.minDurationMinutes} min
            </p>
          ) : null}
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

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AddChannelForm from '../../components/admin/AddChannelForm'
import AddVideoForm from '../../components/admin/AddVideoForm'
import WhitelistList from '../../components/admin/WhitelistList'
import WatchHistoryTable from '../../components/admin/WatchHistoryTable'
import TimeLimitSettings from '../../components/admin/TimeLimitSettings'
import {
  getWhitelistedChannels,
  getWhitelistedVideos,
  removeWhitelistedChannel,
  removeWhitelistedVideo,
} from '../../services/whitelistService'
import { getWatchHistory } from '../../services/watchHistoryService'
import { refreshFeedCache, isFeedStale, getCachedFeed } from '../../services/feedCache'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [channels, setChannels] = useState(getWhitelistedChannels)
  const [videos, setVideos] = useState(getWhitelistedVideos)
  const [history, setHistory] = useState(getWatchHistory)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState(() => getCachedFeed().refreshedAt)

  function refreshLists() {
    setChannels(getWhitelistedChannels())
    setVideos(getWhitelistedVideos())
    setHistory(getWatchHistory())
  }

  async function handleRefreshFeed() {
    setRefreshing(true)
    try {
      const cache = await refreshFeedCache()
      setRefreshedAt(cache.refreshedAt)
    } finally {
      setRefreshing(false)
    }
  }

  // Keep the kid feed reasonably fresh without hammering the API: refresh
  // once per admin dashboard visit if the cache is stale.
  useEffect(() => {
    if (isFeedStale() && (channels.length > 0 || videos.length > 0)) {
      handleRefreshFeed()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleLogout() {
    logout()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">WatchWell Admin</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-neutral-400 hover:text-white"
            >
              View kid feed
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-xl border border-neutral-800 bg-[#181818] p-4">
          <div>
            <p className="font-medium text-white">Feed cache</p>
            <p className="text-sm text-neutral-400">
              {refreshedAt ? `Last refreshed ${new Date(refreshedAt).toLocaleString()}` : 'Never refreshed'}
            </p>
          </div>
          <button
            onClick={handleRefreshFeed}
            disabled={refreshing}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : 'Refresh now'}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AddChannelForm onAdded={refreshLists} />
          <AddVideoForm onAdded={refreshLists} />
        </div>

        <div className="mt-6">
          <WhitelistList
            channels={channels}
            videos={videos}
            onRemoveChannel={(id) => {
              removeWhitelistedChannel(id)
              refreshLists()
            }}
            onRemoveVideo={(id) => {
              removeWhitelistedVideo(id)
              refreshLists()
            }}
          />
        </div>

        <div className="mt-6">
          <TimeLimitSettings />
        </div>

        <div className="mt-6">
          <WatchHistoryTable history={history} />
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { loadYouTubeIframeApi } from '../../lib/youtubeIframeApi'
import { getWhitelistedVideos } from '../../services/whitelistService'
import { getCachedFeed } from '../../services/feedCache'
import { logWatch } from '../../services/watchHistoryService'
import { isDailyLimitReached } from '../../services/timeLimitService'
import { formatRelativeTime } from '../../lib/format'

const LIMIT_CHECK_INTERVAL_MS = 15_000

// Finds a video's metadata among whitelisted content only. A video that
// isn't whitelisted (e.g. someone edits the URL by hand) simply isn't found
// here, so WatchPage refuses to play it.
function findWhitelistedVideo(videoId) {
  const individual = getWhitelistedVideos().find((v) => v.videoId === videoId)
  if (individual) return individual
  return getCachedFeed().videos.find((v) => v.videoId === videoId) ?? null
}

export default function WatchPage() {
  const { videoId } = useParams()
  const navigate = useNavigate()
  const playerRef = useRef(null)
  const playerInstanceRef = useRef(null)
  const watchedSecondsRef = useRef(0)
  const lastTickRef = useRef(null)

  const [video] = useState(() => findWhitelistedVideo(videoId))

  useEffect(() => {
    if (!video) return

    let intervalId
    let disposed = false

    function persistWatchedSeconds() {
      const seconds = Math.round(watchedSecondsRef.current)
      if (seconds <= 0) return
      logWatch({
        videoId: video.videoId,
        title: video.title,
        channelTitle: video.channelTitle,
        durationWatchedSeconds: seconds,
      })
      watchedSecondsRef.current = 0
    }

    loadYouTubeIframeApi().then((YT) => {
      if (disposed) return
      playerInstanceRef.current = new YT.Player(playerRef.current, {
        videoId: video.videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              lastTickRef.current = Date.now()
            } else {
              lastTickRef.current = null
            }
          },
        },
      })

      intervalId = setInterval(() => {
        if (lastTickRef.current) {
          watchedSecondsRef.current += (Date.now() - lastTickRef.current) / 1000
          lastTickRef.current = Date.now()
        }
        if (watchedSecondsRef.current >= 30) persistWatchedSeconds()

        if (isDailyLimitReached()) {
          persistWatchedSeconds()
          playerInstanceRef.current?.pauseVideo?.()
          navigate('/time-up', { replace: true })
        }
      }, LIMIT_CHECK_INTERVAL_MS)
    })

    return () => {
      disposed = true
      if (intervalId) clearInterval(intervalId)
      persistWatchedSeconds()
      playerInstanceRef.current?.destroy?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video])

  if (!video) {
    return (
      <div className="p-8 text-center text-white">
        <p className="text-lg font-medium">This video isn't available.</p>
        <Link to="/" className="mt-4 inline-block text-blue-400 hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <div ref={playerRef} className="h-full w-full" />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-white">{video.title}</h1>
      <p className="mt-1 text-neutral-400">
        {video.channelTitle}
        {video.publishedAt ? ` • ${formatRelativeTime(video.publishedAt)}` : ''}
      </p>
    </div>
  )
}

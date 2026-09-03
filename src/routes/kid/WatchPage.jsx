import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { loadYouTubeIframeApi } from '../../lib/youtubeIframeApi'
import { getWhitelistedVideos } from '../../services/whitelistService'
import { getCachedFeed } from '../../services/feedCache'
import { logWatch } from '../../services/watchHistoryService'
import { isDailyLimitReached } from '../../services/timeLimitService'
import { formatRelativeTime } from '../../lib/format'
import Avatar from '../../components/shared/Avatar'
import { BackIcon } from '../../components/kid/icons'

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
  const [upNext] = useState(() =>
    getCachedFeed().videos.filter((v) => v.videoId !== videoId).slice(0, 4),
  )

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
      <div className="p-10 text-center">
        <p className="text-lg font-medium text-text">This video isn't available.</p>
        <Link to="/" className="mt-4 inline-block text-brand hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-7">
      <button
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white"
      >
        <BackIcon className="h-6 w-6" />
      </button>

      <div className="aspect-video w-full overflow-hidden rounded-[20px] bg-[#1c1917]">
        <div ref={playerRef} className="h-full w-full" />
      </div>

      <h1 className="mt-5 font-heading text-2xl font-bold text-text">{video.title}</h1>
      <div className="mt-3 flex items-center gap-3">
        <Avatar label={video.channelTitle} />
        <p className="text-base text-text-muted">
          {video.channelTitle}
          {video.publishedAt ? ` · ${formatRelativeTime(video.publishedAt)}` : ''}
        </p>
      </div>

      {upNext.length > 0 ? (
        <>
          <div className="my-7 h-px bg-border" />
          <h2 className="mb-4 font-heading text-xl font-bold text-text">Up next</h2>
          <div className="flex flex-wrap gap-5">
            {upNext.map((v) => (
              <Link key={v.videoId} to={`/watch/${v.videoId}`} className="w-[220px]">
                <div className="aspect-video overflow-hidden rounded-[14px] bg-bg-alt">
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 line-clamp-2 text-[15px] font-semibold leading-tight text-text">
                  {v.title}
                </p>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

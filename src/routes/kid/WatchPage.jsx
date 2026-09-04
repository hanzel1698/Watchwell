import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { loadYouTubeIframeApi } from '../../lib/youtubeIframeApi'
import { getAllApprovedVideos } from '../../services/whitelistService'
import { logWatch } from '../../services/watchHistoryService'
import { isDailyLimitReached } from '../../services/timeLimitService'
import { formatDuration, formatRelativeTime } from '../../lib/format'
import Avatar from '../../components/shared/Avatar'

const LIMIT_CHECK_INTERVAL_MS = 15_000

export default function WatchPage() {
  const { videoId } = useParams()
  const navigate = useNavigate()
  const playerRef = useRef(null)
  const playerInstanceRef = useRef(null)
  const watchedSecondsRef = useRef(0)
  const lastTickRef = useRef(null)

  // 'loading' | 'ready' | 'not-found'
  const [status, setStatus] = useState('loading')
  const [video, setVideo] = useState(null)
  const [upNext, setUpNext] = useState([])

  // Loads the whitelist catalog and finds this video in it — a video that
  // isn't in the (whitelist-only) catalog simply isn't found, so this page
  // refuses to play it.
  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getAllApprovedVideos()
      .then((catalog) => {
        if (cancelled) return
        const found = catalog.find((v) => v.videoId === videoId)
        if (!found) {
          setStatus('not-found')
          return
        }
        setVideo(found)
        setUpNext(catalog.filter((v) => v.videoId !== videoId).slice(0, 15))
        setStatus('ready')
      })
      .catch(() => setStatus('not-found'))
    return () => {
      cancelled = true
    }
  }, [videoId])

  useEffect(() => {
    if (status !== 'ready' || !video) return

    let intervalId
    let disposed = false

    function persistWatchedSeconds() {
      const seconds = Math.round(watchedSecondsRef.current)
      if (seconds <= 0) return
      watchedSecondsRef.current = 0
      logWatch({
        videoId: video.videoId,
        title: video.title,
        durationWatchedSeconds: seconds,
      }).catch((err) => console.error('Failed to log watch history:', err))
    }

    loadYouTubeIframeApi().then((YT) => {
      if (disposed) return
      playerInstanceRef.current = new YT.Player(playerRef.current, {
        videoId: video.videoId,
        // rel:0 limits end-of-video suggestions to the same channel;
        // disablekb/iv_load_policy close off keyboard shortcuts and
        // clickable annotations as extra exit routes. The control bar's
        // YouTube logo (linking to youtube.com) can't be removed — it's
        // required by YouTube's embed terms, not something this API
        // exposes a toggle for. modestbranding is dropped since YouTube
        // deprecated it in 2018 and it no longer does anything.
        playerVars: { rel: 0, disablekb: 1, iv_load_policy: 3 },
        events: {
          onStateChange: (event) => {
            lastTickRef.current = event.data === YT.PlayerState.PLAYING ? Date.now() : null
          },
        },
      })

      intervalId = setInterval(async () => {
        if (lastTickRef.current) {
          watchedSecondsRef.current += (Date.now() - lastTickRef.current) / 1000
          lastTickRef.current = Date.now()
        }
        if (watchedSecondsRef.current >= 30) persistWatchedSeconds()

        const reached = await isDailyLimitReached().catch(() => false)
        if (reached) {
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
  }, [status, video, navigate])

  if (status === 'loading') return null

  if (status === 'not-found') {
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
    <div className="mx-auto max-w-[1400px] p-7 lg:flex lg:items-start lg:gap-8">
      <div className="lg:min-w-0 lg:flex-1">
        <div className="aspect-video w-full overflow-hidden rounded-[20px] bg-[#1c1917]">
          <div ref={playerRef} className="h-full w-full" />
        </div>

        <h1 className="mt-5 font-heading text-2xl font-bold text-text">{video.title}</h1>
        <div className="mt-3 flex items-center gap-3">
          <Avatar label={video.channelTitle ?? video.title} />
          <p className="text-base text-text-muted">
            {video.channelTitle ?? 'Added by a parent'}
            {video.publishedAt ? ` · ${formatRelativeTime(video.publishedAt)}` : ''}
          </p>
        </div>
      </div>

      {upNext.length > 0 ? (
        // Stacked below the player on phones/narrow tablets; from lg (tablet
        // landscape) up, it becomes a vertical sidebar to the right instead —
        // matching how a real video-watching app lays out related videos.
        // The heading stays put (sticky) while just the list beneath it
        // scrolls independently once it's taller than the viewport.
        <div className="mt-8 lg:sticky lg:top-7 lg:mt-0 lg:w-[360px] lg:shrink-0">
          <h2 className="mb-4 font-heading text-xl font-bold text-text">Up next</h2>
          <div className="flex flex-col gap-3 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1">
            {upNext.map((v) => (
              <Link key={v.videoId} to={`/watch/${v.videoId}`} className="flex gap-2.5">
                <div className="relative aspect-video w-[168px] shrink-0 overflow-hidden rounded-[10px] bg-bg-alt">
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {v.durationSeconds ? (
                    <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">
                      {formatDuration(v.durationSeconds)}
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-text">
                    {v.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-text-muted">
                    {v.channelTitle ?? 'Added by a parent'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

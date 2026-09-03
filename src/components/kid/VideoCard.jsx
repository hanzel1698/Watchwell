import { Link } from 'react-router-dom'
import { formatDuration, formatRelativeTime } from '../../lib/format'

export default function VideoCard({ video }) {
  return (
    <Link to={`/watch/${video.videoId}`} className="block w-full text-left">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-800">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {video.durationSeconds ? (
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-xs text-white">
            {formatDuration(video.durationSeconds)}
          </span>
        ) : null}
      </div>
      <div className="mt-2">
        <p className="line-clamp-2 font-medium text-white">{video.title}</p>
        <p className="mt-1 text-sm text-neutral-400">{video.channelTitle}</p>
        {video.publishedAt ? (
          <p className="text-sm text-neutral-400">{formatRelativeTime(video.publishedAt)}</p>
        ) : null}
      </div>
    </Link>
  )
}

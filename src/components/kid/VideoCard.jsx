import { Link } from 'react-router-dom'
import Avatar from '../shared/Avatar'
import { formatDuration, formatRelativeTime } from '../../lib/format'

export default function VideoCard({ video, showDate = true }) {
  return (
    <Link to={`/watch/${video.videoId}`} className="block w-full text-left">
      <div className="relative aspect-video w-full overflow-hidden rounded-[18px] bg-bg-alt">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {video.durationSeconds ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-0.5 text-[13px] font-semibold text-white">
            {formatDuration(video.durationSeconds)}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex gap-3">
        <Avatar label={video.channelTitle ?? video.title} />
        <div className="min-w-0">
          <p className="line-clamp-2 text-[17px] font-bold leading-tight text-text">
            {video.title}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {video.channelTitle ?? 'Added by a parent'}
            {showDate && video.publishedAt ? ` · ${formatRelativeTime(video.publishedAt)}` : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}

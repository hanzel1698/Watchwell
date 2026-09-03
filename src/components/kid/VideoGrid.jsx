import VideoCard from './VideoCard'

export default function VideoGrid({ videos, emptyMessage = 'No videos yet.' }) {
  if (videos.length === 0) {
    return <p className="p-8 text-center text-neutral-400">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.videoId} video={video} />
      ))}
    </div>
  )
}

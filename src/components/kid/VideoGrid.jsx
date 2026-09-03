import VideoCard from './VideoCard'

export default function VideoGrid({ videos, emptyMessage = 'No videos yet.', showDate = true }) {
  if (videos.length === 0) {
    return <p className="p-10 text-center text-lg text-text-faint">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.videoId} video={video} showDate={showDate} />
      ))}
    </div>
  )
}

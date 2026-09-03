export default function WhitelistList({ channels, videos, onRemoveChannel, onRemoveVideo }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#181818] p-4">
      <h3 className="mb-3 font-semibold text-white">Whitelisted content</h3>

      <p className="mb-2 text-sm font-medium text-neutral-400">
        Channels ({channels.length})
      </p>
      <ul className="mb-4 space-y-2">
        {channels.map((channel) => (
          <li
            key={channel.channelId}
            className="flex items-center gap-3 rounded-lg bg-[#0f0f0f] p-2"
          >
            <img src={channel.thumbnailUrl} alt="" className="h-8 w-8 rounded-full" />
            <span className="flex-1 text-white">{channel.title}</span>
            <button
              onClick={() => onRemoveChannel(channel.channelId)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </li>
        ))}
        {channels.length === 0 ? <li className="text-sm text-neutral-500">None yet.</li> : null}
      </ul>

      <p className="mb-2 text-sm font-medium text-neutral-400">Individual videos ({videos.length})</p>
      <ul className="space-y-2">
        {videos.map((video) => (
          <li key={video.videoId} className="flex items-center gap-3 rounded-lg bg-[#0f0f0f] p-2">
            <img src={video.thumbnailUrl} alt="" className="h-8 w-14 rounded object-cover" />
            <span className="flex-1 text-white">{video.title}</span>
            <button
              onClick={() => onRemoveVideo(video.videoId)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </li>
        ))}
        {videos.length === 0 ? <li className="text-sm text-neutral-500">None yet.</li> : null}
      </ul>
    </div>
  )
}

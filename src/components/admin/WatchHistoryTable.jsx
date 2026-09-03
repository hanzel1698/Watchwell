import { formatDuration } from '../../lib/format'

export default function WatchHistoryTable({ history }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#181818] p-4">
      <h3 className="mb-3 font-semibold text-white">Watch history</h3>
      {history.length === 0 ? (
        <p className="text-sm text-neutral-500">No videos watched yet.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-neutral-400">
              <tr>
                <th className="pb-2">Video</th>
                <th className="pb-2">Watched at</th>
                <th className="pb-2">Duration</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {history.map((entry, i) => (
                <tr key={i} className="border-t border-neutral-800">
                  <td className="py-2 pr-2">
                    <p className="line-clamp-1">{entry.title}</p>
                    <p className="text-xs text-neutral-500">{entry.channelTitle}</p>
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {new Date(entry.watchedAt).toLocaleString()}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    {formatDuration(entry.durationWatchedSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

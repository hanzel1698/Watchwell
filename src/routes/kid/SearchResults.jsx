import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import VideoGrid from '../../components/kid/VideoGrid'
import { getCachedFeed } from '../../services/feedCache'

// Filters the cached whitelist client-side only — never calls YouTube's
// public search endpoint, which would surface non-whitelisted content.
export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim().toLowerCase() ?? ''

  const results = useMemo(() => {
    if (!query) return []
    const { videos } = getCachedFeed()
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(query) ||
        video.channelTitle.toLowerCase().includes(query),
    )
  }, [query])

  return (
    <div>
      <p className="px-4 pt-4 text-neutral-400">
        {results.length} result{results.length === 1 ? '' : 's'} for "{query}"
      </p>
      <VideoGrid videos={results} emptyMessage="No matching videos found." />
    </div>
  )
}

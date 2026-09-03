import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import VideoGrid from '../../components/kid/VideoGrid'
import { getAllApprovedVideos } from '../../services/whitelistService'
import { SearchIcon } from '../../components/kid/icons'

// Filters the whitelist catalog client-side only — never calls YouTube's
// public search endpoint, which would surface non-whitelisted content.
export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [input, setInput] = useState(searchParams.get('q') ?? '')
  const [catalog, setCatalog] = useState(null)
  const query = input.trim().toLowerCase()

  useEffect(() => {
    getAllApprovedVideos()
      .then(setCatalog)
      .catch(() => setCatalog([]))
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    setSearchParams(input ? { q: input } : {})
  }

  const results = useMemo(() => {
    if (!query || !catalog) return []
    return catalog.filter(
      (video) =>
        video.title.toLowerCase().includes(query) ||
        (video.channelTitle ?? '').toLowerCase().includes(query),
    )
  }, [query, catalog])

  return (
    <div className="p-7">
      <form onSubmit={handleSubmit} className="mx-auto mb-8 flex max-w-[640px] gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="search"
          autoFocus
          placeholder="Search for videos..."
          className="h-[60px] flex-1 rounded-full border-2 border-border px-6 text-[19px] text-text outline-none focus:border-brand"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-brand text-white"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>

      {query.length === 0 ? (
        <p className="py-16 text-center text-lg text-text-faint">
          Type something to find a video!
        </p>
      ) : catalog === null ? (
        <p className="py-16 text-center text-lg text-text-faint">Loading…</p>
      ) : results.length === 0 ? (
        <div className="py-14 text-center">
          <div className="relative mx-auto mb-6 h-[100px] w-[100px] rounded-full bg-brand-tint">
            <span className="absolute left-7 top-9 h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="absolute right-7 top-9 h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="absolute bottom-7 left-8 h-1 w-9 rounded bg-brand" />
          </div>
          <p className="mb-2 font-heading text-2xl font-bold text-text">No videos found</p>
          <p className="text-base text-text-muted">Ask a parent to add more!</p>
        </div>
      ) : (
        <VideoGrid videos={results} />
      )}
    </div>
  )
}

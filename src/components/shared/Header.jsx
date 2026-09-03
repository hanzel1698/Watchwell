import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-neutral-800 bg-[#0f0f0f] px-4 py-2">
      <Link to="/" className="flex items-center gap-1 shrink-0">
        <span className="text-xl font-bold tracking-tight text-white">WatchWell</span>
      </Link>

      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Search"
          className="w-full rounded-l-full border border-neutral-700 bg-[#121212] px-4 py-1.5 text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="rounded-r-full border border-l-0 border-neutral-700 bg-[#222222] px-5 text-white hover:bg-neutral-700"
        >
          🔍
        </button>
      </form>

      <Link
        to="/admin"
        aria-label="Admin"
        className="shrink-0 text-neutral-500 hover:text-neutral-300"
        title="Admin"
      >
        ⚙️
      </Link>
    </header>
  )
}

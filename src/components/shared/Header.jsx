import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import Avatar from './Avatar'
import { getKidName } from '../../lib/config'
import { SearchIcon } from '../kid/icons'

export default function Header() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="flex h-20 shrink-0 items-center gap-4 border-b border-border bg-surface px-6">
      <Link to="/" className="flex shrink-0 items-center gap-2.5">
        <Logo size="md" />
        <span className="font-heading text-lg font-bold text-text">WatchWell</span>
      </Link>

      <form onSubmit={handleSubmit} className="flex w-full max-w-[520px] items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Search for videos..."
          className="h-12 w-full rounded-full bg-bg-alt px-5 text-[15px] text-text placeholder-text-muted outline-none"
        />
        <button type="submit" aria-label="Search" className="sr-only">
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>

      <Link
        to="/admin"
        aria-label="Admin"
        className="ml-auto shrink-0"
        title="Parent access"
      >
        <Avatar label={getKidName()} />
      </Link>
    </header>
  )
}

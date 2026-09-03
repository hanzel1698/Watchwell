import { NavLink } from 'react-router-dom'
import { HomeIcon, SearchIcon, HistoryIcon } from './icons'

const ITEMS = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/search', label: 'Search', Icon: SearchIcon },
  { to: '/history', label: 'History', Icon: HistoryIcon },
]

function itemClasses({ isActive }) {
  return `flex flex-col items-center gap-1 rounded-2xl px-5 py-2 text-[13px] font-semibold font-sans transition-colors ${
    isActive ? 'bg-brand-tint text-brand' : 'text-text-muted'
  }`
}

export default function BottomNav() {
  return (
    <nav className="flex h-[76px] shrink-0 items-center justify-around border-t border-border bg-surface px-3 sm:hidden">
      {ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={itemClasses}>
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

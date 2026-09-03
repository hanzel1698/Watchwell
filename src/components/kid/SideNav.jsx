import { NavLink } from 'react-router-dom'
import Logo from '../shared/Logo'
import { HomeIcon, SearchIcon, HistoryIcon } from './icons'

const ITEMS = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/search', label: 'Search', Icon: SearchIcon },
  { to: '/history', label: 'History', Icon: HistoryIcon },
]

function itemClasses({ isActive }) {
  return `flex w-full flex-col items-center justify-center gap-1 rounded-2xl py-3 text-xs font-semibold font-sans transition-colors ${
    isActive ? 'bg-brand-tint text-brand' : 'text-text-muted hover:bg-bg-alt'
  }`
}

export default function SideNav() {
  return (
    <nav className="hidden w-[100px] shrink-0 flex-col items-center gap-2.5 border-r border-border bg-surface py-5 sm:flex">
      <div className="mb-3.5">
        <Logo size="md" />
      </div>
      {ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={itemClasses}>
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

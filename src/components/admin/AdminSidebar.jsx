import { NavLink } from 'react-router-dom'
import Logo from '../shared/Logo'

const ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', end: true },
  { to: '/admin/dashboard/channels', label: 'Manage Channels' },
  { to: '/admin/dashboard/videos', label: 'Manage Videos' },
  { to: '/admin/dashboard/history', label: 'Watch History' },
  { to: '/admin/dashboard/settings', label: 'Settings' },
]

function itemClasses({ isActive }) {
  return `mb-0.5 h-11 rounded-[10px] px-3.5 text-left font-sans text-sm font-semibold transition-colors ${
    isActive ? 'bg-admin-active text-white' : 'text-admin-text-muted hover:text-white'
  }`
}

export default function AdminSidebar({ onLock }) {
  return (
    <nav className="hidden w-56 shrink-0 flex-col bg-admin-bg p-3.5 sm:flex">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <Logo size="sm" />
        <span className="font-heading text-base font-bold text-white">WatchWell</span>
      </div>
      {ITEMS.map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end} className={itemClasses}>
          {label}
        </NavLink>
      ))}
      <div className="flex-1" />
      <button
        onClick={onLock}
        className="h-10 rounded-[10px] border border-admin-border font-sans text-[13px] font-semibold text-admin-text-muted"
      >
        Lock Dashboard
      </button>
    </nav>
  )
}

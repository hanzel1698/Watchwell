import { NavLink } from 'react-router-dom'

const ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', end: true },
  { to: '/admin/dashboard/channels', label: 'Channels' },
  { to: '/admin/dashboard/videos', label: 'Videos' },
  { to: '/admin/dashboard/history', label: 'History' },
  { to: '/admin/dashboard/settings', label: 'Settings' },
]

function itemClasses({ isActive }) {
  return `h-[34px] shrink-0 whitespace-nowrap rounded-lg px-4 font-sans text-[13px] font-semibold transition-colors ${
    isActive ? 'bg-admin-active text-white' : 'text-admin-text-muted'
  }`
}

export default function AdminTopMenu({ onLock }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto bg-admin-bg px-4 py-2.5 sm:hidden">
      {ITEMS.map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end} className={itemClasses}>
          {label}
        </NavLink>
      ))}
      <button
        onClick={onLock}
        className="ml-auto h-[34px] shrink-0 rounded-lg border border-admin-border px-3.5 font-sans text-xs font-semibold text-admin-text-muted"
      >
        Lock
      </button>
    </div>
  )
}

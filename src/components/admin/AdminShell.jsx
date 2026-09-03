import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from './AdminSidebar'
import AdminTopMenu from './AdminTopMenu'

const TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/dashboard/channels': 'Manage Channels',
  '/admin/dashboard/videos': 'Manage Videos',
  '/admin/dashboard/history': 'Watch History',
  '/admin/dashboard/settings': 'Settings',
}

export default function AdminShell() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLock() {
    logout()
    navigate('/admin')
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar onLock={handleLock} />
      <div className="flex min-w-0 flex-1 flex-col bg-bg">
        <AdminTopMenu onLock={handleLock} />
        <div className="flex h-16 shrink-0 items-center border-b border-border bg-surface px-7">
          <h1 className="font-heading text-lg font-bold text-text">
            {TITLES[location.pathname] ?? 'Dashboard'}
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

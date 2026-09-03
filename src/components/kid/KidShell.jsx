import Header from '../shared/Header'
import SideNav from './SideNav'
import BottomNav from './BottomNav'

export default function KidShell({ children }) {
  return (
    <div className="flex h-screen flex-col bg-bg">
      <Header />
      <div className="flex min-h-0 flex-1">
        <SideNav />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}

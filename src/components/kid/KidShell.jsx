import { Outlet } from 'react-router-dom'
import Header from '../shared/Header'
import BottomNav from './BottomNav'
import TimeLimitGate from './TimeLimitGate'

// Layout route: wraps every kid-facing page. The time-limit check happens
// once here (per mount of this layout, not per page navigation) since
// react-router keeps this element mounted across child route changes.
export default function KidShell() {
  return (
    <TimeLimitGate>
      <div className="flex h-screen flex-col bg-bg">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </TimeLimitGate>
  )
}

import { Routes, Route } from 'react-router-dom'
import Header from './components/shared/Header'
import HomeFeed from './routes/kid/HomeFeed'
import WatchPage from './routes/kid/WatchPage'
import SearchResults from './routes/kid/SearchResults'
import TimeUpScreen from './routes/kid/TimeUpScreen'
import TimeLimitGate from './components/kid/TimeLimitGate'
import RequireAdmin from './components/admin/RequireAdmin'
import AdminLogin from './routes/admin/AdminLogin'
import AdminDashboard from './routes/admin/AdminDashboard'

function KidLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <KidLayout>
            <TimeLimitGate>
              <HomeFeed />
            </TimeLimitGate>
          </KidLayout>
        }
      />
      <Route
        path="/search"
        element={
          <KidLayout>
            <TimeLimitGate>
              <SearchResults />
            </TimeLimitGate>
          </KidLayout>
        }
      />
      <Route
        path="/watch/:videoId"
        element={
          <KidLayout>
            <TimeLimitGate>
              <WatchPage />
            </TimeLimitGate>
          </KidLayout>
        }
      />
      <Route
        path="/time-up"
        element={
          <KidLayout>
            <TimeUpScreen />
          </KidLayout>
        }
      />

      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
    </Routes>
  )
}

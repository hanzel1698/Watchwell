import { Routes, Route } from 'react-router-dom'
import KidShell from './components/kid/KidShell'
import HomeFeed from './routes/kid/HomeFeed'
import WatchPage from './routes/kid/WatchPage'
import SearchResults from './routes/kid/SearchResults'
import WatchHistoryPage from './routes/kid/WatchHistoryPage'
import TimeUpScreen from './routes/kid/TimeUpScreen'
import RequireAdmin from './components/admin/RequireAdmin'
import AdminLogin from './routes/admin/AdminLogin'
import AdminShell from './components/admin/AdminShell'
import AdminHome from './routes/admin/AdminHome'
import AdminChannels from './routes/admin/AdminChannels'
import AdminVideos from './routes/admin/AdminVideos'
import AdminHistory from './routes/admin/AdminHistory'
import AdminSettings from './routes/admin/AdminSettings'

export default function App() {
  return (
    <Routes>
      <Route element={<KidShell />}>
        <Route path="/" element={<HomeFeed />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/history" element={<WatchHistoryPage />} />
        <Route path="/watch/:videoId" element={<WatchPage />} />
      </Route>
      <Route path="/time-up" element={<TimeUpScreen />} />

      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <RequireAdmin>
            <AdminShell />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="channels" element={<AdminChannels />} />
        <Route path="videos" element={<AdminVideos />} />
        <Route path="history" element={<AdminHistory />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  )
}

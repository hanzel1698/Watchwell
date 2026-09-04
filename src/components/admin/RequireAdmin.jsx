import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Redirects to kid home, not the PIN screen. An unauthenticated visit to an
// admin URL (expired session, a manually-typed link) should quietly bounce
// back to the kid app rather than surface "there's an admin panel here" —
// the avatar icon in the kid header is the one discreet way in.
export default function RequireAdmin({ children }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

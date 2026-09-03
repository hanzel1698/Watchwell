import { Navigate } from 'react-router-dom'
import { isDailyLimitReached } from '../../services/timeLimitService'

export default function TimeLimitGate({ children }) {
  if (isDailyLimitReached()) return <Navigate to="/time-up" replace />
  return children
}

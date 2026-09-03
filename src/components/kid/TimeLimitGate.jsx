import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isDailyLimitReached } from '../../services/timeLimitService'

export default function TimeLimitGate({ children }) {
  const [status, setStatus] = useState('checking') // checking | ok | blocked

  useEffect(() => {
    let cancelled = false
    isDailyLimitReached()
      .then((reached) => {
        if (!cancelled) setStatus(reached ? 'blocked' : 'ok')
      })
      .catch((err) => {
        // Fail open rather than lock the kid out over a transient/config error.
        console.error('Time limit check failed:', err)
        if (!cancelled) setStatus('ok')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'checking') return null
  if (status === 'blocked') return <Navigate to="/time-up" replace />
  return children
}

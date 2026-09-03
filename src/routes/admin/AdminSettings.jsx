import { useEffect, useState } from 'react'
import { getDailyLimitMinutes, setDailyLimitMinutes } from '../../services/timeLimitService'

const STEP = 5
const MIN = 15
const MAX = 180

export default function AdminSettings() {
  const [minutes, setMinutes] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDailyLimitMinutes()
      .then(setMinutes)
      .catch((err) => setError(err.message))
  }, [])

  function update(next) {
    const clamped = Math.min(MAX, Math.max(MIN, next))
    setMinutes(clamped)
    setDailyLimitMinutes(clamped).catch((err) => setError(err.message))
  }

  if (error) return <p className="text-brand">{error}</p>
  if (minutes === null) return <p className="text-text-faint">Loading…</p>

  return (
    <div className="max-w-[420px]">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="mb-1.5 text-sm font-semibold text-text">Daily time limit</p>
        <p className="mb-5 text-[13px] text-text-muted">How many minutes of video per day.</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => update(minutes - STEP)}
            className="h-11 w-11 rounded-full border border-border bg-surface text-2xl font-bold text-text"
          >
            −
          </button>
          <p className="min-w-[110px] text-center font-heading text-[34px] font-bold text-text">
            {minutes} min
          </p>
          <button
            onClick={() => update(minutes + STEP)}
            className="h-11 w-11 rounded-full border border-border bg-surface text-2xl font-bold text-text"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

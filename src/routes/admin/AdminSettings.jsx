import { useEffect, useState } from 'react'
import { getDailyLimitMinutes, setDailyLimitMinutes } from '../../services/timeLimitService'
import {
  getMinDurationMinutes,
  setMinDurationMinutes,
} from '../../services/contentFilterService'

const TIME_LIMIT = { step: 5, min: 15, max: 180 }
// 0 turns the length rule off entirely; 90 minutes is past feature-length,
// which is as far as a "minimum" is any use.
const MIN_DURATION = { step: 5, min: 0, max: 90 }

function SettingCard({ label, hint, children }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <p className="mb-1.5 text-sm font-semibold text-text">{label}</p>
      <p className="mb-5 text-[13px] text-text-muted">{hint}</p>
      {children}
    </div>
  )
}

function Stepper({ value, display, bounds, onChange }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onChange(value - bounds.step)}
        disabled={value <= bounds.min}
        aria-label="Decrease"
        className="h-11 w-11 rounded-full border border-border bg-surface text-2xl font-bold text-text disabled:opacity-40"
      >
        −
      </button>
      <p className="min-w-[110px] text-center font-heading text-[34px] font-bold text-text">
        {display}
      </p>
      <button
        onClick={() => onChange(value + bounds.step)}
        disabled={value >= bounds.max}
        aria-label="Increase"
        className="h-11 w-11 rounded-full border border-border bg-surface text-2xl font-bold text-text disabled:opacity-40"
      >
        +
      </button>
    </div>
  )
}

export default function AdminSettings() {
  const [minutes, setMinutes] = useState(null)
  const [minDuration, setMinDuration] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getDailyLimitMinutes(), getMinDurationMinutes()])
      .then(([limit, duration]) => {
        setMinutes(limit)
        setMinDuration(duration)
      })
      .catch((err) => setError(err.message))
  }, [])

  function updateLimit(next) {
    const clamped = Math.min(TIME_LIMIT.max, Math.max(TIME_LIMIT.min, next))
    setMinutes(clamped)
    setDailyLimitMinutes(clamped).catch((err) => setError(err.message))
  }

  function updateMinDuration(next) {
    const clamped = Math.min(MIN_DURATION.max, Math.max(MIN_DURATION.min, next))
    setMinDuration(clamped)
    setMinDurationMinutes(clamped).catch((err) => setError(err.message))
  }

  if (error) return <p className="text-brand">{error}</p>
  if (minutes === null || minDuration === null) return <p className="text-text-faint">Loading…</p>

  return (
    <div className="flex max-w-[420px] flex-col gap-5">
      <SettingCard label="Daily time limit" hint="How many minutes of video per day.">
        <Stepper
          value={minutes}
          display={`${minutes} min`}
          bounds={TIME_LIMIT}
          onChange={updateLimit}
        />
      </SettingCard>

      <SettingCard
        label="Minimum video length"
        hint={
          'Hides shorter uploads from whitelisted channels — a nudge away from ' +
          'quick-hit videos. Takes effect straight away, and videos you add ' +
          'individually always show regardless. Live streams are never shown.'
        }
      >
        <Stepper
          value={minDuration}
          display={minDuration === 0 ? 'Off' : `${minDuration} min`}
          bounds={MIN_DURATION}
          onChange={updateMinDuration}
        />
      </SettingCard>
    </div>
  )
}

import { useState } from 'react'
import {
  getDailyLimitMinutes,
  setDailyLimitMinutes,
  getRemainingSecondsToday,
} from '../../services/timeLimitService'
import { formatDuration } from '../../lib/format'

export default function TimeLimitSettings() {
  const [limitMinutes, setLimitMinutes] = useState(getDailyLimitMinutes())
  const remainingSeconds = getRemainingSecondsToday()

  function handleSave() {
    setDailyLimitMinutes(Number(limitMinutes))
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-[#181818] p-4">
      <h3 className="mb-3 font-semibold text-white">Daily time limit</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={limitMinutes}
          onChange={(e) => setLimitMinutes(e.target.value)}
          className="w-24 rounded-lg border border-neutral-700 bg-[#0f0f0f] px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
        <span className="text-neutral-400">minutes / day</span>
        <button
          onClick={handleSave}
          className="ml-auto rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          Save
        </button>
      </div>
      <p className="mt-3 text-sm text-neutral-400">
        Remaining today: {formatDuration(remainingSeconds)}
      </p>
    </div>
  )
}

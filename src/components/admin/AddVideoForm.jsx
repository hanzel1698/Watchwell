import { useState } from 'react'
import { resolveVideo } from '../../services/youtubeApi'
import { addWhitelistedVideo } from '../../services/whitelistService'
import { formatDuration } from '../../lib/format'

export default function AddVideoForm({ onAdded }) {
  const [input, setInput] = useState('')
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleLookup(e) {
    e.preventDefault()
    if (!input.trim()) return
    setStatus('loading')
    setError('')
    try {
      const video = await resolveVideo(input)
      setPreview(video)
      setStatus('idle')
    } catch (err) {
      setError(err.message)
      setStatus('error')
      setPreview(null)
    }
  }

  async function handleConfirm() {
    try {
      await addWhitelistedVideo(preview)
      setPreview(null)
      setInput('')
      onAdded()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mb-5">
      <form onSubmit={handleLookup} className="flex gap-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste video URL or ID"
          className="h-11 flex-1 rounded-[10px] border border-border bg-surface px-4 text-sm text-text outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="h-11 shrink-0 rounded-[10px] bg-brand px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {status === 'loading' ? 'Looking up…' : 'Add Video'}
        </button>
      </form>

      {error ? <p className="mt-2 text-sm font-medium text-brand">{error}</p> : null}

      {preview ? (
        <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-border bg-surface p-3">
          <img src={preview.thumbnailUrl} alt="" className="h-12 w-20 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text">{preview.title}</p>
            <p className="text-sm text-text-muted">
              {preview.channelTitle}
              {preview.isLive
                ? ' · Live'
                : preview.durationSeconds
                  ? ` · ${formatDuration(preview.durationSeconds)}`
                  : ''}
            </p>
          </div>
          {/* Live streams can't be whitelisted at all, so say why up front
              rather than offering a button that only fails on click. */}
          {preview.isLive ? (
            <p className="max-w-[220px] text-sm font-medium text-brand">
              Live streams can't be added — add the recording once the broadcast
              has ended.
            </p>
          ) : (
            <button
              onClick={handleConfirm}
              className="shrink-0 rounded-[10px] bg-brand px-3.5 py-2 text-sm font-semibold text-white"
            >
              Confirm &amp; whitelist
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}

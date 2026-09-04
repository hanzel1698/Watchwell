import { useState } from 'react'
import { resolveChannel } from '../../services/youtubeApi'
import { addWhitelistedChannel } from '../../services/whitelistService'
import { refreshChannelUploads } from '../../services/feedCache'

export default function AddChannelForm({ onAdded }) {
  const [input, setInput] = useState('')
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | confirming | error
  const [error, setError] = useState('')

  async function handleLookup(e) {
    e.preventDefault()
    if (!input.trim()) return
    setStatus('loading')
    setError('')
    try {
      const channel = await resolveChannel(input)
      setPreview(channel)
      setStatus('idle')
    } catch (err) {
      setError(err.message)
      setStatus('error')
      setPreview(null)
    }
  }

  async function handleConfirm() {
    setStatus('confirming')
    try {
      const savedChannel = await addWhitelistedChannel(preview)
      setPreview(null)
      setInput('')
      setStatus('idle')
      onAdded() // show the channel right away, even before its videos load

      // Pull this channel's uploads in immediately rather than waiting for
      // the next scheduled/manual refresh — otherwise a freshly-added
      // channel sits at "0 videos" until that next refresh happens.
      await refreshChannelUploads(savedChannel)
      onAdded()
    } catch (err) {
      setStatus('idle')
      setError(err.message)
    }
  }

  return (
    <div className="mb-5">
      <form onSubmit={handleLookup} className="flex gap-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste channel URL or ID"
          className="h-11 flex-1 rounded-[10px] border border-border bg-surface px-4 text-sm text-text outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="h-11 shrink-0 rounded-[10px] bg-brand px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {status === 'loading' ? 'Looking up…' : 'Add Channel'}
        </button>
      </form>

      {error ? <p className="mt-2 text-sm font-medium text-brand">{error}</p> : null}

      {preview ? (
        <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-border bg-surface p-3">
          <img src={preview.thumbnailUrl} alt="" className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <p className="font-semibold text-text">{preview.title}</p>
            <p className="text-sm text-text-muted">{preview.channelId}</p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={status === 'confirming'}
            className="rounded-[10px] bg-brand px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {status === 'confirming' ? 'Adding…' : 'Confirm & whitelist'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

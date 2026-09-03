import { useState } from 'react'
import { resolveChannel } from '../../services/youtubeApi'
import { addWhitelistedChannel } from '../../services/whitelistService'

export default function AddChannelForm({ onAdded }) {
  const [input, setInput] = useState('')
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | error
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

  function handleConfirm() {
    try {
      addWhitelistedChannel(preview)
      setPreview(null)
      setInput('')
      onAdded()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-[#181818] p-4">
      <h3 className="mb-3 font-semibold text-white">Add a channel</h3>
      <form onSubmit={handleLookup} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Channel URL, @handle, or ID"
          className="flex-1 rounded-lg border border-neutral-700 bg-[#0f0f0f] px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-neutral-700 px-4 py-2 text-white hover:bg-neutral-600 disabled:opacity-50"
        >
          {status === 'loading' ? 'Looking up…' : 'Look up'}
        </button>
      </form>

      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}

      {preview ? (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#0f0f0f] p-3">
          <img src={preview.thumbnailUrl} alt="" className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <p className="font-medium text-white">{preview.title}</p>
            <p className="text-sm text-neutral-400">{preview.channelId}</p>
          </div>
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            Confirm & whitelist
          </button>
        </div>
      ) : null}
    </div>
  )
}

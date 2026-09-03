import { useState } from 'react'
import { resolveVideo } from '../../services/youtubeApi'
import { addWhitelistedVideo } from '../../services/whitelistService'

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

  function handleConfirm() {
    try {
      addWhitelistedVideo(preview)
      setPreview(null)
      setInput('')
      onAdded()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-[#181818] p-4">
      <h3 className="mb-3 font-semibold text-white">Add a single video</h3>
      <form onSubmit={handleLookup} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Video URL or ID"
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
          <img src={preview.thumbnailUrl} alt="" className="h-12 w-20 rounded object-cover" />
          <div className="flex-1">
            <p className="font-medium text-white">{preview.title}</p>
            <p className="text-sm text-neutral-400">{preview.channelTitle}</p>
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

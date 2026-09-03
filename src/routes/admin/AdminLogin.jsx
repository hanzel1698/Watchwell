import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { isAdmin, login } = useAuth()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />

  function handleSubmit(e) {
    e.preventDefault()
    if (login(pin)) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError('Incorrect PIN.')
      setPin('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs rounded-xl border border-neutral-800 bg-[#181818] p-6"
      >
        <h1 className="mb-4 text-center text-lg font-semibold text-white">Admin Access</h1>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="w-full rounded-lg border border-neutral-700 bg-[#0f0f0f] px-3 py-2 text-center text-white tracking-widest focus:border-blue-500 focus:outline-none"
        />
        {error ? <p className="mt-2 text-center text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-500"
        >
          Unlock
        </button>
      </form>
    </div>
  )
}

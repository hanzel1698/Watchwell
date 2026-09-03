import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/shared/Logo'

const PIN_LENGTH = 4
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', null, '0', 'del']

export default function AdminLogin() {
  const { isAdmin, login } = useAuth()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [configError, setConfigError] = useState('')

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />

  function pressDigit(digit) {
    if (pin.length >= PIN_LENGTH) return
    const next = pin + digit
    setPin(next)
    setError(false)
    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        try {
          if (login(next)) {
            navigate('/admin/dashboard', { replace: true })
          } else {
            setPin('')
            setError(true)
          }
        } catch (err) {
          setPin('')
          setConfigError(err.message)
        }
      }, 350)
    }
  }

  function pressDel() {
    setPin((p) => p.slice(0, -1))
    setError(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg">
      <Logo size="lg" />
      <h1 className="font-heading text-2xl font-bold text-text">Parent Access</h1>
      <p className="-mt-3.5 text-[15px] text-text-muted">Enter PIN to continue</p>

      <div className="my-1.5 flex gap-3.5">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`h-[18px] w-[18px] rounded-full border-2 border-brand ${
              i < pin.length ? 'bg-brand' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      {error ? (
        <p className="-mt-2 text-sm font-semibold text-brand">Incorrect PIN, try again</p>
      ) : null}
      {configError ? (
        <p className="-mt-2 max-w-xs text-center text-sm font-semibold text-brand">
          {configError}
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-3.5">
        {KEYS.map((key, i) =>
          key === null ? (
            <div key={i} />
          ) : key === 'del' ? (
            <button
              key={i}
              onClick={pressDel}
              className="h-16 w-16 rounded-full text-[13px] font-semibold text-text-muted"
            >
              Del
            </button>
          ) : (
            <button
              key={i}
              onClick={() => pressDigit(key)}
              className="h-16 w-16 rounded-full border border-border bg-surface text-xl font-bold text-text"
            >
              {key}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

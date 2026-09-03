import { createContext, useContext, useState } from 'react'
import { getAdminPin } from '../lib/config'

const AuthContext = createContext(null)
const SESSION_KEY = 'watchwell:adminAuthed'

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true')

  function login(pin) {
    if (pin === getAdminPin()) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setIsAdmin(true)
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAdmin(false)
  }

  return <AuthContext.Provider value={{ isAdmin, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

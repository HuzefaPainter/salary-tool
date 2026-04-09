import { createContext, useContext, useState } from 'react'
import { loginRequest, registerRequest, logoutRequest } from '@/api/services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, password) => {
    const response = await loginRequest(email, password)
    const token = response.headers['authorization']
    const user = response.data.user
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return response
  }

  const register = async (name, email, password, password_confirmation) => {
    const response = await registerRequest(name, email, password, password_confirmation)
    const token = response.headers['authorization']
    const user = response.data.user
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return response
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

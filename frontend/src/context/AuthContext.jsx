import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    const userData = data.data
    localStorage.setItem('accessToken', userData.accessToken)
    localStorage.setItem('refreshToken', userData.refreshToken)
    localStorage.setItem('user', JSON.stringify({
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      roles: userData.roles,
    }))
    setUser({
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      roles: userData.roles,
    })
    return userData
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData)
    const userData = data.data
    localStorage.setItem('accessToken', userData.accessToken)
    localStorage.setItem('refreshToken', userData.refreshToken)
    localStorage.setItem('user', JSON.stringify({
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      roles: userData.roles,
    }))
    setUser({
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      roles: userData.roles,
    })
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      localStorage.clear()
      setUser(null)
    }
  }, [])

  const isAdmin = user?.roles?.includes('ROLE_ADMIN')

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import { useState, type ReactNode } from 'react'
import { API_ENDPOINTS } from './endpoint'
import {
  AuthContext,
  SUPERADMIN_MENU,
  ADMIN_MENU,
  FASCILATOR_MENU,
  CONTRIBUTOR_MENU,
  CONTRIBUTOR_ADMIN_MENU,
  CLIENT_MENU,
  type AuthUser
} from './auth-context'

// Helper to map user types to their corresponding menus
const MENU_MAP: Record<string, any> = {
  superadmin: SUPERADMIN_MENU,
  admin: ADMIN_MENU,
  fascilator: FASCILATOR_MENU,
  contributor: CONTRIBUTOR_MENU,
  contributoruser: CONTRIBUTOR_MENU,
  'contributor user': CONTRIBUTOR_MENU,
  contributoradmin: CONTRIBUTOR_ADMIN_MENU,
  admin_contributor: CONTRIBUTOR_ADMIN_MENU,
  'contributor admin': CONTRIBUTOR_ADMIN_MENU,
  client: CLIENT_MENU
}

type LoginResponse = {
  message?: string
  loginStatus?: boolean
  token?: string
  user?: AuthUser
}

const USER_STORAGE_KEY = 'worktrail_user'
const TOKEN_STORAGE_KEY = 'worktrail_token'

function getMenuForUserType(usertype: string) {
  const ut = (usertype || '').toLowerCase().trim().replace(/[\s_-]+/g, '')
  if (ut === 'superadmin') return SUPERADMIN_MENU
  if (ut === 'admin') return ADMIN_MENU
  if (ut === 'contributoradmin' || ut === 'admincontributor') return CONTRIBUTOR_ADMIN_MENU
  if (ut === 'contributor' || ut === 'contributoruser') return CONTRIBUTOR_MENU
  if (ut === 'fascilator') return FASCILATOR_MENU
  if (ut === 'client') return CLIENT_MENU
  return []
}

function readStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)
  if (!storedUser) return null
  try {
    const user = JSON.parse(storedUser) as AuthUser
    return user.activestatus === '1' && Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)) ? user : null
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [menu, setMenu] = useState(() => {
    if (!user?.Usertype) return []
    return getMenuForUserType(user.Usertype)
  })
  const [isLoading, setIsLoading] = useState(false)
  const isMenuLoading = false
  const menuError = ''
  const [error, setError] = useState('')

  const login = async (emailId: string, password: string) => {
    setIsLoading(true)
    setError('')
    try {
      const loginPayload = { EmailID: emailId, password }
      if (import.meta.env.DEV) {
        console.log('[Login API] Request:', {
          endpoint: API_ENDPOINTS.auth.login,
          method: 'POST',
          body: loginPayload,
        })
      }
      const result = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { APIKEY: 'Securitas@#!1234', 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      })
      const responseText = await result.text()
      let responseData: unknown
      try {
        responseData = JSON.parse(responseText)
      } catch {
        throw new Error(`Login returned invalid JSON (${result.status})`)
      }
      if (import.meta.env.DEV) console.log('[Login API] Response:', responseData)
      const data = getLoginResponse(responseData)
      if (!result.ok || data.loginStatus !== true || !data.token || !data.user) throw new Error(data.message || `Login failed (${result.status})`)
      if (data.user.activestatus !== '1') throw new Error('Your account is inactive. Please contact an administrator.')

      // Update menu selection logic to pick correct menu for user type
      const availableMenu = data.user.Usertype ? getMenuForUserType(data.user.Usertype) : []
      setMenu(availableMenu)
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      return data.user
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to connect to the login service.'
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setMenu([])
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        menu,
        isAuthenticated: user?.activestatus === '1' && Boolean(token),
        isLoading,
        isMenuLoading,
        menuError,
        error,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function getLoginResponse(value: unknown): LoginResponse {
  if (typeof value !== 'object' || value === null) return {}
  const response = value as { message?: unknown; user?: unknown; data?: unknown; loginStatus?: unknown; token?: unknown }
  if (isAuthUser(response.user))
    return {
      message: typeof response.message === 'string' ? response.message : undefined,
      loginStatus: response.loginStatus === true,
      token: typeof response.token === 'string' ? response.token : undefined,
      user: response.user
    }
  if (typeof response.data === 'object' && response.data !== null) return getLoginResponse(response.data)
  return {
    message: typeof response.message === 'string' ? response.message : undefined,
    loginStatus: response.loginStatus === true,
    token: typeof response.token === 'string' ? response.token : undefined
  }
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<AuthUser>
  return typeof candidate.Usertype === 'string' && typeof candidate.activestatus === 'string'
}

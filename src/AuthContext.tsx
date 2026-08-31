import { useState, type ReactNode } from 'react'
import { API_ENDPOINTS } from './endpoint'
import { AuthContext, SUPERADMIN_MENU, CONTRIBUTOR_MENU, CLIENT_MENU, type AuthUser } from './auth-context'

type LoginResponse = {
  message?: string
  loginStatus?: boolean
  token?: string
  user?: AuthUser
}

const USER_STORAGE_KEY = 'worktrail_user'
const TOKEN_STORAGE_KEY = 'worktrail_token'

const MOCK_CREDENTIALS = [
  {
    EmailID: 'superadmin.worktrial@securitas-india.com',
    password: 'Sec@$#12@!123',
    user: {
      id: 1,
      username: 'Superadmin',
      created_at: '2026-08-24T15:28:01.360Z',
      activestatus: '1',
      Usertype: 'Superadmin'
    }
  },
  {
    EmailID: 'admin.worktrial@securitas-india.com',
    password: 'Secure@123',
    user: {
      id: 2,
      username: 'Admin',
      created_at: '2026-08-24T16:11:05.400Z',
      activestatus: '1',
      Usertype: 'Admin'
    }
  },
  {
    EmailID: 'fascilator.worktrial@securitas-india.com',
    password: 'Fascilator@123',
    user: {
      id: 3,
      username: 'Fascilator',
      created_at: '2026-08-24T17:34:24.537Z',
      activestatus: '1',
      Usertype: 'Fascilator'
    }
  },
  {
    EmailID: 'contributor.worktrial@securitas-india.com',
    password: 'Contributor@123',
    user: {
      id: 4,
      username: 'Contributor',
      created_at: '2026-08-24T17:35:14.853Z',
      activestatus: '1',
      Usertype: 'Contributor'
    }
  },
  {
    EmailID: 'client.worktrial@securitas-india.com',
    password: 'Client@123',
    user: {
      id: 5,
      username: 'Client',
      created_at: '2026-08-24T17:35:38.500Z',
      activestatus: '1',
      Usertype: 'Client'
    }
  }
]

function getMenuForUserType(usertype: string) {
  const ut = usertype.toLowerCase()
  if (ut === 'superadmin' || ut === 'admin') return SUPERADMIN_MENU
  if (ut === 'contributor' || ut === 'fascilator') return CONTRIBUTOR_MENU
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
      // 1. Check local mock credentials
      const match = MOCK_CREDENTIALS.find(
        (u) => u.EmailID.toLowerCase() === emailId.toLowerCase() && u.password === password
      )
      if (match) {
        setMenu(getMenuForUserType(match.user.Usertype))
        setUser(match.user)
        const mockToken = 'mock-token-' + match.user.Usertype.toLowerCase()
        setToken(mockToken)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(match.user))
        localStorage.setItem(TOKEN_STORAGE_KEY, mockToken)
        return
      }

      // 2. Fall back to calling API endpoint
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

      const availableMenu = getMenuForUserType(data.user.Usertype)
      setMenu(availableMenu)
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
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

  return <AuthContext.Provider value={{ user, token, menu, isAuthenticated: user?.activestatus === '1' && Boolean(token), isLoading, isMenuLoading, menuError, error, login, logout }}>{children}</AuthContext.Provider>
}

function getLoginResponse(value: unknown): LoginResponse {
  if (typeof value !== 'object' || value === null) return {}
  const response = value as { message?: unknown; user?: unknown; data?: unknown; loginStatus?: unknown; token?: unknown }
  if (isAuthUser(response.user)) return { message: typeof response.message === 'string' ? response.message : undefined, loginStatus: response.loginStatus === true, token: typeof response.token === 'string' ? response.token : undefined, user: response.user }
  if (typeof response.data === 'object' && response.data !== null) return getLoginResponse(response.data)
  return { message: typeof response.message === 'string' ? response.message : undefined, loginStatus: response.loginStatus === true, token: typeof response.token === 'string' ? response.token : undefined }
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<AuthUser>
  return typeof candidate.Usertype === 'string' && typeof candidate.activestatus === 'string'
}


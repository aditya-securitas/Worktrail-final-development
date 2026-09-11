import { useState, useEffect, useRef, type ReactNode } from 'react'
import { API_ENDPOINTS } from './endpoint'
import {
  AuthContext,
  SUPERADMIN_MENU,
  ADMIN_MENU,
  FASCILATOR_MENU,
  CONTRIBUTOR_MENU,
  CONTRIBUTOR_ADMIN_MENU,
  CLIENT_MENU,
  type AuthUser,
  type LoginResult
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
  if (ut.includes('superadmin')) return SUPERADMIN_MENU
  if (ut === 'admin') return ADMIN_MENU
  if (ut.includes('contributoradmin') || ut.includes('admincontributor')) return CONTRIBUTOR_ADMIN_MENU
  if (ut.includes('contributor')) return CONTRIBUTOR_MENU
  if (ut.includes('fascilator')) return FASCILATOR_MENU
  if (ut.includes('client') || ut.includes('customer')) return CLIENT_MENU
  return []
}

function readStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)
  if (!storedUser) return null
  try {
    const raw = JSON.parse(storedUser)
    const storedEmail = localStorage.getItem('worktrail_client_email') || ''
    const fallback =
      raw.EmailID ||
      raw.email ||
      raw.Email ||
      storedEmail ||
      (raw.username && raw.username.includes('@') ? raw.username : '') ||
      (raw.Usertype?.toLowerCase() === 'client' ? 'Client.worktrial@Securitas-india.com' : '')
    const user = normalizeAuthUser(raw, raw, fallback) || (raw as AuthUser)
    const isActive = String(user.activestatus ?? '1') === '1'
    return isActive && Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)) ? user : null
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  
  const rawUserType = user?.Usertype || (user as any)?.UserType || (user as any)?.role || (user as any)?.usertype || ''
  
  const [menu, setMenu] = useState(() => {
    return getMenuForUserType(rawUserType)
  })

  // Synchronize menu whenever user changes
  useEffect(() => {
    if (rawUserType) {
      setMenu(getMenuForUserType(rawUserType))
    }
  }, [rawUserType])
  const [isLoading, setIsLoading] = useState(false)
  const isMenuLoading = false
  const menuError = ''
  const [error, setError] = useState('')

  const loginInFlight = useRef(false)
  const verifyInFlight = useRef(false)

  const login = async (emailId: string, password: string) => {
    if (loginInFlight.current) {
      if (import.meta.env.DEV) console.warn('[Login API] Ignoring duplicate login call while in-flight')
      return
    }
    loginInFlight.current = true
    setIsLoading(true)
    setError('')
    try {
      const cleanIdentifier = emailId.trim()
      const loginPayload = {
        EmailID: cleanIdentifier,
        email: cleanIdentifier,
        username: cleanIdentifier,
        password,
      }
      if (import.meta.env.DEV) {
        console.log('[Login API] Request:', {
          endpoint: API_ENDPOINTS.auth.login,
          method: 'POST',
          body: loginPayload,
        })
      }
      let result = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { APIKEY: 'Securitas@#!1234', 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      })
      let responseText = await result.text()
      let responseData: unknown
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = { message: responseText }
      }

      if (import.meta.env.DEV) console.log('[Login API] Response:', responseData)
      const data = getLoginResponse(responseData, cleanIdentifier)

      // 1. Immediately check if an OTP was sent to user's email
      const rawMessage = (typeof (responseData as any)?.message === 'string' ? (responseData as any).message : data.message) || ''
      const isOtpDispatched =
        /otp/i.test(rawMessage) ||
        (responseData as any)?.otpRequired === true ||
        (responseData as any)?.isOtpRequired === true ||
        (!data.token && /sent to your email/i.test(rawMessage))

      if (isOtpDispatched) {
        const dispatchedEmail = (responseData as any)?.EmailID || (responseData as any)?.email || cleanIdentifier
        if (dispatchedEmail) {
          localStorage.setItem('worktrail_client_email', dispatchedEmail)
        }
        if ((responseData as any)?.user) {
          try {
            localStorage.setItem('worktrail_temp_user', JSON.stringify((responseData as any).user))
          } catch {}
        }
        return {
          otpRequired: true,
          message: rawMessage || 'A login OTP was sent to your email.',
          EmailID: dispatchedEmail
        }
      }

      // 2. Only if NOT an OTP dispatch and primary endpoint returned an internal server error / 404, try altEndpoint
      const isFailedOrServerError =
        !result.ok ||
        (typeof responseData === 'object' &&
          responseData !== null &&
          (responseData as any).loginStatus === false &&
          typeof (responseData as any).message === 'string' &&
          (responseData as any).message.toLowerCase().includes('internal server error'))

      const altEndpoint = (API_ENDPOINTS.auth as any).loginAlt
      if (isFailedOrServerError && altEndpoint && altEndpoint !== API_ENDPOINTS.auth.login) {
        try {
          if (import.meta.env.DEV) {
            console.log('[Login API] Attempting fallback endpoint:', altEndpoint)
          }
          const altResult = await fetch(altEndpoint, {
            method: 'POST',
            headers: { APIKEY: 'Securitas@#!1234', 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload),
          })
          const altText = await altResult.text()
          try {
            const altData = JSON.parse(altText)
            const altMsg = (typeof altData?.message === 'string' ? altData.message : '') || ''
            if (/otp/i.test(altMsg) || altData?.otpRequired) {
              return {
                otpRequired: true,
                message: altMsg || 'A login OTP was sent to your email.'
              }
            }
            if (altResult.ok && (altData.loginStatus === true || altData.token)) {
              result = altResult
              responseData = altData
            }
          } catch {
            // Keep primary response
          }
        } catch {
          // Keep primary response
        }
      }

      if (!result.ok || data.loginStatus !== true || !data.token || !data.user) {
        const rawMsg = data.message || `Login failed (${result.status})`
        if (rawMsg.toLowerCase().includes('internal server error')) {
          throw new Error('Invalid user credentials or account not found. Please check your User ID / Email and password.')
        }
        throw new Error(rawMsg)
      }

      if (String(data.user.activestatus) !== '1') {
        throw new Error('Your account is inactive. Please contact an administrator.')
      }

      // Update menu selection logic to pick correct menu for user type
      const availableMenu = data.user.Usertype ? getMenuForUserType(data.user.Usertype) : []
      setMenu(availableMenu)
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      return { user: data.user, otpRequired: false }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to connect to the login service.'
      setError(message)
      throw new Error(message)
    } finally {
      loginInFlight.current = false
      setIsLoading(false)
    }
  }

  const verifyOtp = async (emailId: string, otp: string, password?: string): Promise<AuthUser> => {
    if (verifyInFlight.current) {
      if (import.meta.env.DEV) console.warn('[Verify OTP API] Ignoring duplicate verify call while in-flight')
      throw new Error('Verification already in progress. Please wait a moment.')
    }
    verifyInFlight.current = true
    setIsLoading(true)
    setError('')
    try {
      const cleanIdentifier = emailId.trim()
      const cleanOtp = otp.trim()
      const otpPayload = {
        EmailID: cleanIdentifier,
        email: cleanIdentifier,
        username: cleanIdentifier,
        password: password || '',
        OTP: cleanOtp,
        otp: cleanOtp,
      }

      // Dedicated OTP verification endpoints ONLY (NEVER include /login to avoid re-generating OTPs):
      const baseApi = API_ENDPOINTS.auth.login.replace(/\/login$/i, '')
      const endpointsToTry = [
        API_ENDPOINTS.auth.verifyLoginOtp,             // https://worktrail.ai/api/VerifyLoginOtp
        `${baseApi}/VerifyOtp`,                        // https://worktrail.ai/api/VerifyOtp
        `${baseApi}/verifyLoginOtp`,                   // https://worktrail.ai/api/verifyLoginOtp
        `${baseApi}/verifyOtp`,                        // https://worktrail.ai/api/verifyOtp
        (API_ENDPOINTS.auth as any).verifyLoginOtpAlt, // https://worktrail.ai/api/Auth/VerifyLoginOtp
        `${baseApi}/Auth/VerifyOtp`,                   // https://worktrail.ai/api/Auth/VerifyOtp
      ].filter(Boolean)

      let lastError = 'OTP verification failed'
      let verifiedUser: AuthUser | null = null
      let receivedToken: string | null = null

      for (const endpoint of endpointsToTry) {
        try {
          if (import.meta.env.DEV) {
            console.log('[Verify Login OTP API] Trying endpoint:', endpoint)
          }
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { APIKEY: 'Securitas@#!1234', 'Content-Type': 'application/json' },
            body: JSON.stringify(otpPayload),
          })

          const text = await res.text()
          // Skip if endpoint does not exist (Express HTML "Cannot POST ...")
          if (res.status === 404 || text.includes('Cannot POST') || text.includes('<!DOCTYPE html>')) {
            continue
          }

          let json: any
          try {
            json = JSON.parse(text)
          } catch {
            json = { message: text }
          }

          if (import.meta.env.DEV) {
            console.log('[Verify Login OTP API] Response from', endpoint, ':', json)
          }

          const parsed = getLoginResponse(json, cleanIdentifier)

          if (parsed.loginStatus === true && parsed.token) {
            if (!parsed.user && localStorage.getItem('worktrail_temp_user')) {
              try {
                const temp = JSON.parse(localStorage.getItem('worktrail_temp_user') || '{}')
                parsed.user = normalizeAuthUser(temp, json, cleanIdentifier) || undefined
              } catch {}
            }
            if (parsed.user) {
              const finalEmail = (json as any)?.EmailID || (json as any)?.email || parsed.user.email || cleanIdentifier
              if (finalEmail) {
                parsed.user.email = finalEmail
                parsed.user.Email = finalEmail
                parsed.user.EmailID = finalEmail
                localStorage.setItem('worktrail_client_email', finalEmail)
              }
              verifiedUser = parsed.user
              receivedToken = parsed.token
              break
            }
          }

          if (json && typeof json.message === 'string') {
            const msg = json.message
            if (!/cannot post/i.test(msg) && !/a login otp was sent/i.test(msg)) {
              lastError = msg
              if (/invalid/i.test(msg) || /expired/i.test(msg) || /incorrect/i.test(msg) || /wrong/i.test(msg)) {
                throw new Error(msg)
              }
            }
          }
        } catch (candidateErr: any) {
          if (/invalid/i.test(candidateErr.message) || /expired/i.test(candidateErr.message) || /incorrect/i.test(candidateErr.message)) {
            throw candidateErr
          }
          // Try next verification endpoint
        }
      }

      if (!verifiedUser || !receivedToken) {
        throw new Error(lastError || 'Invalid or expired verification code.')
      }

      if (String(verifiedUser.activestatus) !== '1') {
        throw new Error('Your account is inactive. Please contact an administrator.')
      }

      const availableMenu = verifiedUser.Usertype ? getMenuForUserType(verifiedUser.Usertype) : []
      setMenu(availableMenu)
      setUser(verifiedUser)
      setToken(receivedToken)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(verifiedUser))
      localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken)
      return verifiedUser
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Invalid or expired verification code.'
      setError(message)
      throw new Error(message)
    } finally {
      verifyInFlight.current = false
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
        verifyOtp,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function normalizeAuthUser(candidate: any, rootPayload?: any, fallbackEmail?: string): AuthUser | null {
  if (typeof candidate !== 'object' || candidate === null) return null
  const usertype = candidate.Usertype || candidate.UserType || candidate.usertype || candidate.role || candidate.userType
  if (!usertype || typeof usertype !== 'string') return null

  const resolvedEmail = String(
    candidate.EmailID ||
    candidate.email ||
    candidate.Email ||
    candidate.emailId ||
    rootPayload?.EmailID ||
    rootPayload?.email ||
    rootPayload?.Email ||
    rootPayload?.emailId ||
    fallbackEmail ||
    (candidate.username && candidate.username.includes('@') ? candidate.username : '') ||
    ''
  ).trim()

  const activestatus = candidate.activestatus !== undefined ? String(candidate.activestatus) : '1'
  return {
    ...candidate,
    id: candidate.id || candidate.UserMasterID || candidate.userMasterId,
    UserMasterID: candidate.UserMasterID,
    OrgMasterID: candidate.OrgMasterID,
    CompanyCode: candidate.CompanyCode,
    username: candidate.username || resolvedEmail || '',
    email: resolvedEmail,
    Email: resolvedEmail,
    EmailID: resolvedEmail,
    FirstName: candidate.FirstName || candidate.firstName || '',
    LastName: candidate.LastName || candidate.lastName || '',
    CompanyName: candidate.CompanyName || candidate.companyName || '',
    created_at: candidate.created_at || new Date().toISOString(),
    activestatus,
    Usertype: usertype,
  }
}

function getLoginResponse(value: unknown, fallbackEmail?: string): LoginResponse {
  if (typeof value !== 'object' || value === null) return {}
  const response = value as {
    message?: unknown
    user?: unknown
    data?: unknown
    loginStatus?: unknown
    token?: unknown
    EmailID?: unknown
    email?: unknown
    Email?: unknown
  }

  const payloadEmail =
    (typeof response.EmailID === 'string' ? response.EmailID : '') ||
    (typeof response.email === 'string' ? response.email : '') ||
    (typeof response.Email === 'string' ? response.Email : '') ||
    fallbackEmail ||
    ''

  const user = normalizeAuthUser(response.user, response, payloadEmail)
  if (user) {
    return {
      message: typeof response.message === 'string' ? response.message : undefined,
      loginStatus: response.loginStatus === true || response.loginStatus === 'true',
      token: typeof response.token === 'string' ? response.token : (typeof (response as any).accessToken === 'string' ? (response as any).accessToken : undefined),
      user
    }
  }
  if (typeof response.data === 'object' && response.data !== null) return getLoginResponse(response.data, fallbackEmail || payloadEmail)
  return {
    message: typeof response.message === 'string' ? response.message : undefined,
    loginStatus: response.loginStatus === true || response.loginStatus === 'true',
    token: typeof response.token === 'string' ? response.token : undefined
  }
}

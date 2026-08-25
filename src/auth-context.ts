import { createContext } from 'react'
export type AuthUser = {
  id?: number
  username?: string
  password?: string
  created_at: string
  activestatus: string
  Usertype: string
}

export type MenuRoute = {
  Sno?: number
  Usertype?: string
  Route: string
  components: string
  children?: MenuRoute[]
  submenu?: MenuRoute[]
}

export const SUPERADMIN_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Superadmin', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Superadmin', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
]

export type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  menu: MenuRoute[]
  isAuthenticated: boolean
  isLoading: boolean
  isMenuLoading: boolean
  menuError: string
  error: string
  login: (emailId: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

import { createContext } from 'react'

export type AuthUser = {
  id?: number
  username?: string
  CompanyName?:string
  password?: string
  created_at: string
  activestatus: string
  Usertype: 'Superadmin' | 'Admin' | 'Fascilator' | 'Contributor' | 'Client' | string
}

export type MenuRoute = {
  Sno?: number
  Usertype?: 'Superadmin' | 'Admin' | 'Fascilator' | 'Contributor' | 'Client' | string
  Route: string
  components: string
  children?: MenuRoute[]
  submenu?: MenuRoute[]
}

// Superadmin menu
export const SUPERADMIN_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Superadmin', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Superadmin', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 3, Usertype: 'Superadmin', Route: '/AddEmployee', components: 'AddEmployee.tsx' },
  { Sno: 4, Usertype: 'Superadmin', Route: '/Client', components: 'Client.tsx' },
  { Sno: 5, Usertype: 'Superadmin', Route: '/Contributor', components: 'Contributor.tsx' },
  { Sno: 6, Usertype: 'Superadmin', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 7, Usertype: 'Superadmin', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 8, Usertype: 'Superadmin', Route: '/OtherServices', components: 'OtherServices.tsx' },
]

// Admin menu
export const ADMIN_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Admin', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Admin', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 3, Usertype: 'Admin', Route: '/AddEmployee', components: 'AddEmployee.tsx' },
  { Sno: 4, Usertype: 'Admin', Route: '/Client', components: 'Client.tsx' },
  { Sno: 5, Usertype: 'Admin', Route: '/Contributor', components: 'Contributor.tsx' },
  { Sno: 6, Usertype: 'Admin', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 7, Usertype: 'Admin', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 8, Usertype: 'Admin', Route: '/OtherServices', components: 'OtherServices.tsx' },
]

// Fascilator menu
export const FASCILATOR_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Fascilator', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Fascilator', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 3, Usertype: 'Fascilator', Route: '/AddEmployee', components: 'AddEmployee.tsx' },
  { Sno: 4, Usertype: 'Fascilator', Route: '/Client', components: 'Client.tsx' },
  { Sno: 5, Usertype: 'Fascilator', Route: '/Contributor', components: 'Contributor.tsx' },
  { Sno: 6, Usertype: 'Fascilator', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 7, Usertype: 'Fascilator', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 8, Usertype: 'Fascilator', Route: '/OtherServices', components: 'OtherServices.tsx' },
]

// Contributor menu
export const CONTRIBUTOR_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Contributor', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Contributor', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 3, Usertype: 'Contributor', Route: '/AddEmployee', components: 'AddEmployee.tsx' },
  { Sno: 6, Usertype: 'Contributor', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 7, Usertype: 'Contributor', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 8, Usertype: 'Contributor', Route: '/OtherServices', components: 'OtherServices.tsx' },
]

// Client menu
export const CLIENT_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Client', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Client', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 3, Usertype: 'Client', Route: '/AddEmployee', components: 'AddEmployee.tsx' },
  { Sno: 6, Usertype: 'Client', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 7, Usertype: 'Client', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 8, Usertype: 'Client', Route: '/OtherServices', components: 'OtherServices.tsx' },
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

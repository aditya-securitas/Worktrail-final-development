import { createContext } from 'react'

export type AuthUser = {
  id?: number
  username?: string
  FirstName?: string
  LastName?: string
  CompanyName?: string
  password?: string
  created_at: string
  activestatus: string
  Usertype: string
}

export type MenuRoute = {
  Sno?: number
  Usertype?: 'Superadmin' | 'Admin' | 'Fascilator' | 'Contributor' | 'Client' | string
  Route: string
  components: string
  children?: MenuRoute[]
  submenu?: MenuRoute[]
}

// Superadmin menu (Terms, Privacy Policy, and Other Services removed per request, Invoice added)
export const SUPERADMIN_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Superadmin', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Superadmin', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 3, Usertype: 'Superadmin', Route: '/AddEmployee', components: 'AddEmployee.tsx' },
  { Sno: 4, Usertype: 'Superadmin', Route: '/OrgMaster', components: 'OrgMaster.tsx' },
  { Sno: 5, Usertype: 'Superadmin', Route: '/UserMaster', components: 'Usermaster.tsx' },
  { Sno: 6, Usertype: 'Superadmin', Route: '/Recyclebin', components: 'Recyclebin.tsx' },
  { Sno: 7, Usertype: 'Superadmin', Route: '/Client', components: 'Client.tsx' },
  { Sno: 8, Usertype: 'Superadmin', Route: '/Contributor', components: 'Contributor.tsx' },
  { Sno: 9, Usertype: 'Superadmin', Route: '/Invoice', components: 'Invoice.tsx' },
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

// Contributor Admin menu (with ConAdminAddEmployee and ConAdminUsermaster)
export const CONTRIBUTOR_ADMIN_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'ContributorAdmin', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'ContributorAdmin', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 3, Usertype: 'ContributorAdmin', Route: '/ConAdminAddEmployee', components: 'ConUserAddEmployee.tsx' },
  { Sno: 4, Usertype: 'ContributorAdmin', Route: '/ConAdminUsermaster', components: 'ConAdminUsermaster.tsx' },
  { Sno: 5, Usertype: 'ContributorAdmin', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 6, Usertype: 'ContributorAdmin', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 7, Usertype: 'ContributorAdmin', Route: '/OtherServices', components: 'OtherServices.tsx' },
]

export const ADMIN_CONTRIBUTOR_MENU = CONTRIBUTOR_ADMIN_MENU


// Contributor menu
export const CONTRIBUTOR_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Contributor', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Contributor', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 3, Usertype: 'Contributor', Route: '/AddEmployee', components: 'ConUserAddEmployee.tsx' },
  { Sno: 6, Usertype: 'Contributor', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 7, Usertype: 'Contributor', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 8, Usertype: 'Contributor', Route: '/OtherServices', components: 'OtherServices.tsx' },
]

// Client menu
export const CLIENT_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Client', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Client', Route: '/CandidateVerification', components: 'CandidateVerificationForm.tsx' },
  { Sno: 3, Usertype: 'Client', Route: '/Client', components: 'Client.tsx' },
  { Sno: 4, Usertype: 'Client', Route: '/Invoice', components: 'Invoice.tsx' },
  { Sno: 5, Usertype: 'Client', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 6, Usertype: 'Client', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 7, Usertype: 'Client', Route: '/OtherServices', components: 'OtherServices.tsx' },
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
  login: (emailId: string, password: string) => Promise<AuthUser | void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

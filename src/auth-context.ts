import { createContext } from 'react'

export type AuthUser = {
  id?: number
  username?: string
  CompanyName?:string
  password?: string
  created_at: string
  activestatus: string
  EmailID : string
  Usertype: 'Superadmin' | 'Admin' | 'Fascilator' | 'Contributor' | 'Client' | 'ContributorAdmin'| 'ContributorUser'| string
}

export type MenuRoute = {
  Sno?: number
  Usertype?: 'Superadmin' | 'Admin' | 'Fascilator' | 'Contributor' | 'Client' | 'ContributorAdmin'| 'ContributorUser'| string
  Route: string
  components: string
  children?: MenuRoute[]
  submenu?: MenuRoute[]
}

// Superadmin menu
export const SUPERADMIN_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Superadmin', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Superadmin', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 2, Usertype: 'Superadmin', Route: '/ServiceRequestReview', components: 'ServiceRequestReview.tsx' },
  { Sno: 3, Usertype: 'Superadmin', Route: '/AddEmployee', components: 'AddEmployee.tsx' },
  { Sno: 4, Usertype: 'Superadmin', Route: '/UserMaster', components: 'Usermaster.tsx' },
  { Sno: 5, Usertype: 'Superadmin', Route: '/OrgMaster', components: 'OrgMaster.tsx' },
  { Sno: 5, Usertype: 'Superadmin', Route: '/Recyclebin', components: 'Recyclebin.tsx' },
  { Sno: 6, Usertype: 'Superadmin', Route: '/Client', components: 'Client.tsx' },
  { Sno: 7, Usertype: 'Superadmin', Route: '/Contributor', components: 'Contributor.tsx' },
  { Sno: 8, Usertype: 'Superadmin', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 9, Usertype: 'Superadmin', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 10, Usertype: 'Superadmin', Route: '/OtherServices', components: 'OtherServices.tsx' },
]

// Admin menu
export const ADMIN_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Admin', Route: '/dashboard', components: 'Dashboard.tsx' },
  { Sno: 2, Usertype: 'Admin', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 2, Usertype: 'Admin', Route: '/ServiceRequestReview', components: 'ServiceRequestReview.tsx' },
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

export const CONTRIBUTORADMIN_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'ContributorAdmin', Route: '/dashboard', components: 'ContributorDashboard.tsx' },
  { Sno: 2, Usertype: 'ContributorAdmin', Route: '/ServiceRequest', components: 'ContributorServicerequest.tsx' },
  { Sno: 3, Usertype: 'ContributorAdmin', Route: '/ConAdminAddEmployee', components: 'ConAdminAddEmployee.tsx' },
  { Sno: 3, Usertype: 'ContributorAdmin', Route: '/ConAdminUserMaster', components: 'ConAdminUsermaster.tsx' },
  { Sno: 6, Usertype: 'ContributorAdmin', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 7, Usertype: 'ContributorAdmin', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 8, Usertype: 'ContributorAdmin', Route: '/OtherServices', components: 'OtherServices.tsx' },
]

export const CONTRIBUTORUSER_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'ContributorUser', Route: '/dashboard', components: 'ContributorDashboard.tsx' },
  { Sno: 2, Usertype: 'ContributorUser', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 3, Usertype: 'ContributorUser', Route: '/ConUserAddEmployee', components: 'ConUserAddEmployee.tsx' },
  { Sno: 6, Usertype: 'ContributorUser', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 7, Usertype: 'ContributorUser', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 8, Usertype: 'ContributorUser', Route: '/OtherServices', components: 'OtherServices.tsx' },
]

// Client menu
export const CLIENT_MENU: MenuRoute[] = [
  { Sno: 1, Usertype: 'Client', Route: '/dashboard', components: 'ClientDashboard.tsx' },
  { Sno: 2, Usertype: 'Client', Route: '/CandidateVerification', components: 'CandidateVerificationForm.tsx' },
  { Sno: 2, Usertype: 'Client', Route: '/ClientRequest', components: 'ClientRequest.tsx' },
  { Sno: 3, Usertype: 'Client', Route: '/ServiceRequest', components: 'ServiceRequest.tsx' },
  { Sno: 4, Usertype: 'Client', Route: '/Termsandconditions', components: 'TermsandConditions.tsx' },
  { Sno: 5, Usertype: 'Client', Route: '/Privacypolicy', components: 'Privacypolicy.tsx' },
  { Sno: 6, Usertype: 'Client', Route: '/OtherServices', components: 'OtherServices.tsx' },
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
  verifyLoginOtp: (emailId: string, otp: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

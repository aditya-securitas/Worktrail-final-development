import type { AuthUser } from './auth-context'
import { STORAGE_KEY_VERIFICATION_RECORDS, type VerificationRecord } from './Components/CandidateVerificationForm'

/**
 * Verifies whether a client user already has submitted candidate verification requests.
 * If true  -> existing client with requests -> on login navigate to /dashboard
 * If false -> new client with 0 requests   -> on login open /CandidateVerification
 */
export function checkClientHasRequests(user?: AuthUser | null, emailId?: string): boolean {
  if (!user && !emailId) return false

  const userIdentifier = (user?.username || emailId || '').toLowerCase().trim()
  const userEmail = (emailId || '').toLowerCase().trim()
  const userId = user?.id ? String(user.id) : ''
  const company = (user?.CompanyName || '').toLowerCase().trim()

  // 1. Check direct client flag in localStorage
  if (userIdentifier) {
    const flag = localStorage.getItem(`worktrail_client_has_requests_${userIdentifier}`)
    if (flag === 'true') return true
  }
  if (userEmail && userEmail !== userIdentifier) {
    const emailFlag = localStorage.getItem(`worktrail_client_has_requests_${userEmail}`)
    if (emailFlag === 'true') return true
  }
  if (userId) {
    const idFlag = localStorage.getItem(`worktrail_client_has_requests_id_${userId}`)
    if (idFlag === 'true') return true
  }
  if (company) {
    const compFlag = localStorage.getItem(`worktrail_client_has_requests_${company}`)
    if (compFlag === 'true') return true
  }

  // 2. Inspect verification records in storage
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VERIFICATION_RECORDS)
    if (stored) {
      const rawRecords: VerificationRecord[] = JSON.parse(stored)
      if (Array.isArray(rawRecords) && rawRecords.length > 0) {
        const records = rawRecords.filter(
          (r) =>
            !r.id?.startsWith('rec-') &&
            !r.requestId?.startsWith('VR-849') &&
            !r.requestId?.startsWith('VR-732') &&
            !r.requestId?.startsWith('VR-619')
        )
        const found = records.some((r) => {
          const submittedBy = (r.submittedBy || '').toLowerCase().trim()
          
          // Check if this record was submitted by this client
          const matchesIdentifier = Boolean(
            userIdentifier && (submittedBy === userIdentifier || submittedBy.includes(userIdentifier) || userIdentifier.includes(submittedBy))
          )
          const matchesEmail = Boolean(
            userEmail && (submittedBy === userEmail || submittedBy.includes(userEmail))
          )
          const matchesCompany = Boolean(
            company && (submittedBy === company || (r.verifierName || '').toLowerCase().includes(company))
          )
          
          return matchesIdentifier || matchesEmail || matchesCompany
        })

        if (found) {
          // Cache flag for fast subsequent lookups
          if (userIdentifier) {
            localStorage.setItem(`worktrail_client_has_requests_${userIdentifier}`, 'true')
          }
          if (userEmail) {
            localStorage.setItem(`worktrail_client_has_requests_${userEmail}`, 'true')
          }
          if (userId) {
            localStorage.setItem(`worktrail_client_has_requests_id_${userId}`, 'true')
          }
          return true
        }
      }
    }
  } catch (err) {
    console.error('Error verifying client records:', err)
  }

  return false
}

/**
 * Marks that a client user has submitted a verification request.
 */
export function markClientHasRequests(user?: AuthUser | null, emailId?: string): void {
  const userIdentifier = (user?.username || emailId || '').toLowerCase().trim()
  const userEmail = (emailId || '').toLowerCase().trim()
  const userId = user?.id ? String(user.id) : ''
  const company = (user?.CompanyName || '').toLowerCase().trim()

  if (userIdentifier) {
    localStorage.setItem(`worktrail_client_has_requests_${userIdentifier}`, 'true')
  }
  if (userEmail) {
    localStorage.setItem(`worktrail_client_has_requests_${userEmail}`, 'true')
  }
  if (userId) {
    localStorage.setItem(`worktrail_client_has_requests_id_${userId}`, 'true')
  }
  if (company) {
    localStorage.setItem(`worktrail_client_has_requests_${company}`, 'true')
  }
}

/**
 * Clears request status flags for testing new client user workflows.
 */
export function resetClientRequests(user?: AuthUser | null, emailId?: string): void {
  const userIdentifier = (user?.username || emailId || '').toLowerCase().trim()
  const userEmail = (emailId || '').toLowerCase().trim()
  const userId = user?.id ? String(user.id) : ''
  const company = (user?.CompanyName || '').toLowerCase().trim()

  if (userIdentifier) {
    localStorage.removeItem(`worktrail_client_has_requests_${userIdentifier}`)
  }
  if (userEmail) {
    localStorage.removeItem(`worktrail_client_has_requests_${userEmail}`)
  }
  if (userId) {
    localStorage.removeItem(`worktrail_client_has_requests_id_${userId}`)
  }
  if (company) {
    localStorage.removeItem(`worktrail_client_has_requests_${company}`)
  }
}

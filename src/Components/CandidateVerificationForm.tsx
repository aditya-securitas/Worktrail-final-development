import React, { useState, useEffect, useRef } from 'react'
import {
  Building2,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Briefcase,
  Mail,
  Phone,
  FileText,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  BadgeAlert,
  ChevronDown,
  X,
  Lock,
  LogOut,
  Layers,
  FileCheck,
  RefreshCw,
  AlertCircle,
  CreditCard,
  IndianRupee,
  Receipt,
  LayoutGrid,
  Zap,
  FileSpreadsheet,
  Download,
  ArrowLeft,
  UserCheck,
  Check,
  Plus
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useAuth } from '../useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { API_ENDPOINTS } from '../endpoint'
import Logo_w from '../assets/Img/Logo_w.png'
import { markClientHasRequests } from '../client-utils'
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  handler: (response: RazorpayPaymentResponse) => void
  modal: { ondismiss: () => void }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export type VerificationRecord = {
  id: string
  requestId: string
  candidateName: string
  employeeId: string
  candidateEmail: string
  contactNumber: string
  verifierId: string
  verifierName: string
  verifierCategory: string
  verifierCode: string
  dateOfJoining: string
  dateOfLeaving: string
  isCurrentlyEmployed: boolean
  designation: string
  department: string
  verificationType: string
  remarks: string
  uploadedFilesCount: number
  submittedBy: string
  submittedAt: string
  status: 'Pending' | 'In Progress' | 'Verified' | 'Rejected'
  amount?: number
  transactionId?: string
  paymentId?: string
  orderId?: string
}

export const STORAGE_KEY_VERIFICATION_RECORDS = 'worktrail_verification_records'

/**
 * Standard pre-formatted sample rows for bulk candidate verification upload (.xlsx)
 */
export const SAMPLE_CANDIDATE_BULK_ROWS = [
  {
    "Candidate Full Name": "Aarav Sharma",
    "Candidate Email": "aarav.sharma@tcs.com",
    "Contact Number": "+91 98234 11223",
    "Employee Code": "EMP-1001",
    "Verifier Organization": "Tata Consultancy Services (TCS)",
    "Designation": "Senior Systems Engineer",
    "Department": "Digital Cloud Practices",
    "Date of Joining": "2021-06-15",
    "Date of Leaving": "2024-03-31",
    "Currently Employed": "No",
    "Verification Type": "Standard Employment Verification",
    "Remarks": "Confirmed relieving date and integrity clearance."
  },
  {
    "Candidate Full Name": "Priya Mukherjee",
    "Candidate Email": "priya.m@infosys-consult.com",
    "Contact Number": "+91 99102 33445",
    "Employee Code": "EMP-1002",
    "Verifier Organization": "Infosys Limited",
    "Designation": "Lead Business Analyst",
    "Department": "Fintech Solutions",
    "Date of Joining": "2020-01-10",
    "Date of Leaving": "2023-11-20",
    "Currently Employed": "No",
    "Verification Type": "Comprehensive Screening",
    "Remarks": "Candidate provided experience letter #INF/2023/88."
  },
  {
    "Candidate Full Name": "Rohan Deshmukh",
    "Candidate Email": "rohan.d@securitas-emp.in",
    "Contact Number": "+91 97654 88776",
    "Employee Code": "EMP-1003",
    "Verifier Organization": "Securitas India",
    "Designation": "Operations Supervisor",
    "Department": "Site Security Division",
    "Date of Joining": "2022-04-01",
    "Date of Leaving": "Present",
    "Currently Employed": "Yes",
    "Verification Type": "Standard Employment Verification",
    "Remarks": "Currently active employee verification check."
  }
]

function formatExcelDate(val: any): string {
  if (!val) return ''
  if (val instanceof Date) {
    return val.toISOString().split('T')[0]
  }
  if (typeof val === 'number') {
    const d = new Date((val - (25567 + 2)) * 86400 * 1000)
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]
  }
  const str = String(val).trim()
  if (str.toLowerCase() === 'present') return 'Present'
  return str
}

function parseBooleanEmployed(val: any): boolean {
  if (!val) return false
  const s = String(val).toLowerCase().trim()
  return s === 'yes' || s === 'true' || s === '1' || s === 'present' || s === 'currently employed'
}

function normalizeBulkCandidateRow(row: any): {
  candidateName: string
  employeeId: string
  candidateEmail: string
  contactNumber: string
  verifierName: string
  designation: string
  department: string
  dateOfJoining: string
  dateOfLeaving: string
  isCurrentlyEmployed: boolean
  verificationType: string
  remarks: string
} {
  const getVal = (possibleKeys: string[]): string => {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null) {
        return String(row[key]).trim()
      }
      const lowerKey = key.toLowerCase()
      const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === lowerKey)
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
        return String(row[foundKey]).trim()
      }
    }
    return ''
  }

  const rawDoj = row['Date of Joining'] || row['dateOfJoining'] || row['DOJ'] || row['Joining Date']
  const rawDol = row['Date of Leaving'] || row['dateOfLeaving'] || row['DOL'] || row['Leaving Date']
  const rawEmployed = row['Currently Employed'] || row['isCurrentlyEmployed'] || row['Employed']

  const isCurrentlyEmployed = parseBooleanEmployed(rawEmployed)

  return {
    candidateName: getVal(['Candidate Full Name', 'Candidate Name', 'candidateName', 'Full Name', 'Name', 'First Name']),
    employeeId: getVal(['Employee Code', 'employeeId', 'Employee ID', 'Emp Code', 'Emp ID']),
    candidateEmail: getVal(['Candidate Email', 'candidateEmail', 'Email', 'Email Address', 'EmailID']),
    contactNumber: getVal(['Contact Number', 'contactNumber', 'Mobile No', 'Phone', 'Contact']),
    verifierName: getVal(['Verifier Organization', 'verifierName', 'Organization', 'Company', 'Company Name']),
    designation: getVal(['Designation', 'designation', 'Position', 'Last Position Held']),
    department: getVal(['Department', 'department']),
    dateOfJoining: formatExcelDate(rawDoj),
    dateOfLeaving: isCurrentlyEmployed ? 'Present' : formatExcelDate(rawDol),
    isCurrentlyEmployed,
    verificationType: getVal(['Verification Type', 'verificationType']) || 'Standard Employment Verification',
    remarks: getVal(['Remarks', 'remarks', 'Comments', 'Notes'])
  }
}


/**
 * Extract a clean brand domain slug dynamically from any organization name.
 * e.g. "Tata Consultancy Services (TCS)" -> "tcs.com"
 * e.g. "Securitas India Ltd" -> "securitas.com"
 * e.g. "Infosys Limited" -> "infosys.com"
 */
export function getDynamicBrandDomain(name: string): string {
  if (!name) return ''
  const lower = name.toLowerCase().trim()

  // 1. Check if acronym exists inside parentheses, e.g. (TCS), (L&T), (RIL)
  const parenMatch = lower.match(/\(([^)]+)\)/)
  if (parenMatch && parenMatch[1]) {
    const acronym = parenMatch[1].replace(/[^a-z0-9]/g, '')
    if (acronym.length >= 2 && acronym.length <= 6) {
      return `${acronym}.com`
    }
  }

  // 2. Remove common legal and business noise words
  const cleaned = lower
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(private|pvt|limited|ltd|corp|corporation|inc|technologies|technology|tech|services|service|solutions|solution|group|india|global|consulting|enterprises|enterprise|industries|industry|holdings|holding|bank|international|co)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()

  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    const fallbackClean = lower.replace(/[^a-z0-9]/g, '')
    return fallbackClean ? `${fallbackClean}.com` : ''
  }

  // Use primary brand keyword or concatenated slug
  const primarySlug = words[0].length >= 3 ? words[0] : words.join('')
  return `${primarySlug}.com`
}

/**
 * 100% Dynamic logo URL generator without hardcoded dictionaries
 */
export function getOrgLogoUrl(name: string): string {
  const domain = getDynamicBrandDomain(name)
  if (!domain) return ''
  return `https://unavatar.io/${domain}?fallback=https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

/**
 * Reusable dynamic organization logo component with automatic fallback
 */
export function OrgLogo({
  name,
  organizationName,
  className = 'w-9 h-9',
  size,
  fallbackTextSize = 'text-sm'
}: {
  name?: string
  organizationName?: string
  className?: string
  size?: string
  fallbackTextSize?: string
}) {
  const effectiveName = name || organizationName || ''
  const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : className
  const domain = getDynamicBrandDomain(effectiveName)
  const [imgUrlIndex, setImgUrlIndex] = useState<number>(0)
  const [hasError, setHasError] = useState(false)

  // Dynamic candidate sources generated on the fly for any company
  const logoSources = [
    `https://unavatar.io/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://logo.clearbit.com/${domain}`
  ]

  useEffect(() => {
    setImgUrlIndex(0)
    setHasError(false)
  }, [name, domain])

  const handleImageError = () => {
    if (imgUrlIndex < logoSources.length - 1) {
      setImgUrlIndex((prev) => prev + 1)
    } else {
      setHasError(true)
    }
  }

  if (!domain || hasError) {
    return (
      <div
        className={`${sizeClass} rounded-xl bg-gradient-to-tr from-[#0680A6] to-[#10B981] flex items-center justify-center text-white font-extrabold ${fallbackTextSize} shadow-sm shrink-0 select-none`}
      >
        {(effectiveName ? effectiveName.charAt(0) : 'O').toUpperCase()}
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-xl bg-white border border-slate-200/90 p-1.5 flex items-center justify-center shadow-xs shrink-0 overflow-hidden`}
    >
      <img
        src={logoSources[imgUrlIndex]}
        alt={effectiveName}
        className="w-full h-full object-contain filter drop-shadow-2xs"
        loading="lazy"
        onError={handleImageError}
      />
    </div>
  )
}

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

function CandidateVerificationForm() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // API Organizations State
  const [organizations, setOrganizations] = useState<
    { OrganizationID: number; OrganizationName: string }[]
  >([])
  const [loading, setLoading] = useState(false)
  const [orgError, setOrgError] = useState<string | null>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<number | ''>('')

  // Search & Dropdown states
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Form states
  const [candidateName, setCandidateName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [dateOfJoining, setDateOfJoining] = useState('')
  const [dateOfLeaving, setDateOfLeaving] = useState('')
  const [isCurrentlyEmployed, setIsCurrentlyEmployed] = useState(false)
  const [designation, setDesignation] = useState('')
  const [department, setDepartment] = useState('')
  const [verificationType, setVerificationType] = useState('Standard Employment Verification')
  const [remarks, setRemarks] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  
  // Payment states
  const [amount, setAmount] = useState('500')
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle')
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)
  const [transactionDetails, setTransactionDetails] = useState<{
    transactionId: string
    orderId: string
    paymentId: string
    amount: number
  } | null>(null)

  // Submission & feedback states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [generatedRequestId, setGeneratedRequestId] = useState('')
  const [formError, setFormError] = useState('')

  // Bulk Upload feature states (matching AddEmployee pattern)
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single')
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [bulkParsedRows, setBulkParsedRows] = useState<ReturnType<typeof normalizeBulkCandidateRow>[]>([])
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkError, setBulkError] = useState('')
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState('')

  // Step 1: Download Sample Excel Template
  const handleDownloadExcelSample = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(SAMPLE_CANDIDATE_BULK_ROWS)
      worksheet['!cols'] = [
        { wch: 22 }, // Candidate Full Name
        { wch: 28 }, // Candidate Email
        { wch: 18 }, // Contact Number
        { wch: 16 }, // Employee Code
        { wch: 34 }, // Verifier Organization
        { wch: 25 }, // Designation
        { wch: 24 }, // Department
        { wch: 16 }, // Date of Joining
        { wch: 16 }, // Date of Leaving
        { wch: 18 }, // Currently Employed
        { wch: 32 }, // Verification Type
        { wch: 45 }  // Remarks
      ]
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidate_Verification_Sample')
      XLSX.writeFile(workbook, 'candidate_verification_bulk_sample.xlsx')
    } catch (err: any) {
      setBulkError(`Failed to download template: ${err?.message || 'Unknown error'}`)
    }
  }

  // Step 2: Read & Parse Uploaded Excel File
  const readUploadedFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array', cellDates: true })
          const firstSheetName = workbook.SheetNames[0]
          if (!firstSheetName) return resolve([])
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
          resolve(jsonRows)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = (err) => reject(err)
      reader.readAsArrayBuffer(file)
    })
  }

  const handleBulkFileSelected = async (file: File) => {
    setBulkFile(file)
    setBulkError('')
    setBulkSuccessMessage('')
    try {
      const rows = await readUploadedFile(file)
      if (!Array.isArray(rows) || rows.length === 0) {
        setBulkError('Excel file is empty or format is invalid. Please download and use the official sample template.')
        setBulkParsedRows([])
        return
      }
      const normalized = rows.map(normalizeBulkCandidateRow).filter(r => r.candidateName && r.candidateName.trim().length > 0)
      if (normalized.length === 0) {
        setBulkError('No candidate records detected. Please ensure the "Candidate Full Name" column is filled.')
        setBulkParsedRows([])
        return
      }
      setBulkParsedRows(normalized)
    } catch (err: any) {
      setBulkError(err?.message || 'Failed to parse Excel file.')
      setBulkParsedRows([])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        await handleBulkFileSelected(file)
      } else {
        setBulkError('Please drop an Excel spreadsheet (.xlsx or .xls).')
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleBulkFileSelected(file)
    }
  }

  // Handle Bulk Batch Submission
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkFile || bulkParsedRows.length === 0) {
      setBulkError('Please select a populated Excel spreadsheet.')
      return
    }
    setBulkUploading(true)
    setBulkError('')

    try {
      const todayFormatted = new Date().toISOString().split('T')[0]
      const newRecords: VerificationRecord[] = bulkParsedRows.map((row, idx) => {
        const genId = `VR-${Math.floor(100000 + Math.random() * 900000)}`
        // Match organization from live organizations list
        const matchedOrg = organizations.find(o => 
          o.OrganizationName.toLowerCase().includes((row.verifierName || '').toLowerCase()) ||
          (row.verifierName || '').toLowerCase().includes(o.OrganizationName.toLowerCase())
        )
        return {
          id: `bulk-${Date.now()}-${idx}`,
          requestId: genId,
          candidateName: row.candidateName,
          employeeId: row.employeeId || `EMP-${1000 + idx}`,
          candidateEmail: row.candidateEmail || '',
          contactNumber: row.contactNumber || '',
          verifierId: matchedOrg ? String(matchedOrg.OrganizationID) : '99',
          verifierName: matchedOrg ? matchedOrg.OrganizationName : (row.verifierName || 'Enterprise Verifier'),
          verifierCategory: (matchedOrg as any)?.Category || 'Registered Organization',
          verifierCode: matchedOrg ? `ORG-${matchedOrg.OrganizationID}` : 'VER-BATCH',
          dateOfJoining: row.dateOfJoining || todayFormatted,
          dateOfLeaving: row.isCurrentlyEmployed ? 'Present' : (row.dateOfLeaving || todayFormatted),
          isCurrentlyEmployed: Boolean(row.isCurrentlyEmployed),
          designation: row.designation || 'N/A',
          department: row.department || 'General',
          verificationType: row.verificationType || 'Standard Employment Verification',
          remarks: row.remarks || 'Bulk candidate verification batch request',
          uploadedFilesCount: 0,
          submittedBy: user?.username || user?.FirstName || 'Client User',
          submittedAt: todayFormatted,
          status: 'Pending'
        }
      })

      // Persist to storage
      const existing = localStorage.getItem(STORAGE_KEY_VERIFICATION_RECORDS)
      const recordsList: VerificationRecord[] = existing ? JSON.parse(existing) : []
      const updatedList = [...newRecords, ...recordsList]
      localStorage.setItem(STORAGE_KEY_VERIFICATION_RECORDS, JSON.stringify(updatedList))

      // Mark client has requests
      markClientHasRequests(user, user?.username)

      setBulkSuccessMessage(`Successfully processed & submitted ${newRecords.length} candidate verification requests!`)

      setTimeout(() => {
        navigate('/dashboard', {
          state: {
            newRequestId: newRecords[0]?.requestId,
            candidateName: `${newRecords.length} Candidates (Bulk Batch)`
          }
        })
      }, 1000)
    } catch (err: any) {
      setBulkError(err?.message || 'Failed to submit bulk verification requests.')
    } finally {
      setBulkUploading(false)
    }
  }


  // Fetch Organizations from live API
  const fetchOrgs = async () => {
    setLoading(true)
    setOrgError(null)
    try {
      const response = await fetch('http://10.80.0.83:3000/OrgmasterData', {
        method: 'GET',
        headers: {
          APIKEY: 'Securitas@#!1234',
        },
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }
      const data = await response.json()
      if (data && Array.isArray(data.data)) {
        setOrganizations(data.data)
      } else {
        setOrganizations([])
      }
    } catch (err: any) {
      setOrgError(
        err?.message || 'Error loading organizations. Please try again later.'
      )
      setOrganizations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrgs()
  }, [])

  const selectedOrg = organizations.find((o) => o.OrganizationID === selectedOrgId) || null

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.OrganizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.OrganizationID.toString().includes(searchQuery)
  )

  const handleSelectCompany = (org: { OrganizationID: number; OrganizationName: string }) => {
    setSelectedOrgId(org.OrganizationID)
    setIsDropdownOpen(false)
    setSearchQuery('')
    setFormError('')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleResetForm = () => {
    setCandidateName('')
    setEmployeeId('')
    setCandidateEmail('')
    setContactNumber('')
    setDateOfJoining('')
    setDateOfLeaving('')
    setIsCurrentlyEmployed(false)
    setDesignation('')
    setDepartment('')
    setVerificationType('Standard Employment Verification')
    setRemarks('')
    setUploadedFiles([])
    setAmount('500')
    setPaymentState('idle')
    setPaymentMessage(null)
    setTransactionDetails(null)
    setFormError('')
  }

  const handlePaymentAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setPaymentMessage(null)

    if (!selectedOrg) {
      setFormError('Please select a verifier company first.')
      return
    }

    if (!candidateName.trim() || !employeeId.trim() || !dateOfJoining) {
      setFormError('Please fill in all mandatory fields (Candidate Name, Employee ID, and Date of Joining).')
      return
    }

    if (!isCurrentlyEmployed && !dateOfLeaving) {
      setFormError('Please provide Date of Leaving or check "Candidate is currently employed".')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Generate unique Request ID
      const newId = `VR-${Math.floor(100000 + Math.random() * 900000)}`
      const todayFormatted = new Date().toISOString().split('T')[0]

      // 2. Build and save verification record directly (Bypassing payment gateway)
      const newRecord: VerificationRecord = {
        id: `rec-${Date.now()}`,
        requestId: newId,
        candidateName: candidateName.trim(),
        employeeId: employeeId.trim(),
        candidateEmail: candidateEmail.trim(),
        contactNumber: contactNumber.trim(),
        verifierId: String(selectedOrg.OrganizationID),
        verifierName: selectedOrg.OrganizationName,
        verifierCategory: 'Registered Organization',
        verifierCode: `ORG-${selectedOrg.OrganizationID}`,
        dateOfJoining,
        dateOfLeaving: isCurrentlyEmployed ? 'Present' : dateOfLeaving,
        isCurrentlyEmployed,
        designation: designation.trim() || 'N/A',
        department: department.trim() || 'General',
        verificationType,
        remarks: remarks.trim(),
        uploadedFilesCount: uploadedFiles.length,
        submittedBy: user?.username || user?.FirstName || 'Client User',
        submittedAt: todayFormatted,
        status: 'Pending'
      }

      try {
        const existing = localStorage.getItem(STORAGE_KEY_VERIFICATION_RECORDS)
        const recordsList: VerificationRecord[] = existing ? JSON.parse(existing) : []
        recordsList.unshift(newRecord)
        localStorage.setItem(STORAGE_KEY_VERIFICATION_RECORDS, JSON.stringify(recordsList))
        markClientHasRequests(user, candidateEmail)
      } catch (storageErr) {
        console.error('Failed to persist verification record:', storageErr)
      }

      setGeneratedRequestId(newId)
      setSubmissionSuccess(true)
      const candName = candidateName.trim()
      handleResetForm()

      // 3. Immediately redirect to the dashboard where the verification request is shown
      navigate('/dashboard', {
        state: {
          newRequestId: newId,
          candidateName: candName
        }
      })
    } catch (submitErr: any) {
      console.error('Submission error:', submitErr)
      setFormError(submitErr?.message || 'Verification request could not be submitted.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-securitas text-slate-800 antialiased selection:bg-[#0680A6] selection:text-white">
      {/* 1. Standalone Header */}
      <header className="sticky top-0 z-40 bg-[#031f30]/95 backdrop-blur-md border-b border-white/10 text-white transition-all shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
            
              <div>
                <img src={Logo_w} alt="Worktrail Logo" className="w-24 h-8 object-contain" />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 pl-4 ml-4 border-l border-white/15 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Enterprise Client Gateway</span>
            </div>

            {/* Dashboard Navigation Button */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold tracking-wide transition-all ml-2"
              title="Go to Dashboard"
            >
              <LayoutGrid className="w-4 h-4 text-[#fff]" />
              <span className='text-white'>Dashboard</span>
            </Link>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white tracking-wide">
                {user?.FirstName ? `${user.FirstName} ${user.LastName || ''}` : user?.username || 'Client User'}
              </span>
              <span className="text-[10px] text-slate-300 uppercase tracking-widest font-mono">
                {user?.Usertype || 'Client'}
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0680A6] to-[#10B981] text-white flex items-center justify-center font-bold text-sm shadow-sm border border-white/20">
              {(user?.FirstName?.charAt(0) || user?.username?.charAt(0) || 'C').toUpperCase()}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 border border-white/15 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#031f30] via-[#05324e] to-[#0a466c] text-white p-8 sm:p-12 shadow-xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0680A6]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#10B981]/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#88ffbb] mb-4">
                <span className="w-2 h-2 rounded-full bg-[#88ffbb] animate-pulse"></span>
                Direct Partner Verification Gateway
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
                Candidate Verification Form
              </h1>
              <p className="text-slate-200 text-sm sm:text-base mt-3 leading-relaxed">
                Submit candidate employment background verification requests directly to registered enterprise verifiers with instant online payment.
              </p>

              <div className="flex flex-wrap gap-4 mt-6 text-xs text-slate-300">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-[#88ffbb]" />
                  <span>AES-256 Encrypted</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Zap className="w-4 h-4 text-emerald-300" />
                  <span>Direct Verification</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>24-48h SLA</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <FileCheck className="w-4 h-4 text-sky-300" />
                  <span>Legally Compliant</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 min-w-[210px] text-center">
              <span className="text-3xl font-extrabold text-[#88ffbb]">
                {loading ? '...' : organizations.length}
              </span>
              <span className="text-xs font-semibold text-slate-200 mt-1 uppercase tracking-wider">
                Live Verifiers
              </span>
              <span className="text-[11px] text-slate-400 mt-2">Active Master Organizations</span>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs: Single Verification vs Bulk Upload */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveMode('single')}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeMode === 'single'
                  ? 'bg-white text-[#031f30] shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#0680A6]" />
              <span>Single Candidate Verification</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('bulk')}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeMode === 'bulk'
                  ? 'bg-gradient-to-r from-emerald-500 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Upload (.xlsx)</span>
              <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                activeMode === 'bulk' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                BATCH
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="hidden sm:inline">Choose single form entry or bulk Excel ingestion</span>
          </div>
        </div>

        {activeMode === 'single' ? (
          <>
            {/* 3. Select Verifier Section */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0680A6] block mb-1">
                Step 1
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-[#0680A6]" />
                Select Your Verifier
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Choose the registered organization from which you need to request candidate verification details.
            </p>
          </div>

          <div className="mt-6 max-w-2xl" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Select Company <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={fetchOrgs}
                className="inline-flex items-center gap-1 text-[11px] text-[#0680A6] hover:underline cursor-pointer"
                title="Refresh verifiers list"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh List</span>
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-slate-50 hover:bg-slate-100/80 border rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                  isDropdownOpen
                    ? 'border-[#0680A6] ring-4 ring-[#0680A6]/10 bg-white'
                    : selectedOrg
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-200'
                }`}
              >
                {selectedOrg ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <OrgLogo name={selectedOrg.OrganizationName} className="w-9 h-9" />
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {selectedOrg.OrganizationName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-400">
                    <Search className="w-5 h-5 text-slate-400" />
                    <span className="text-sm">
                      {loading ? 'Loading organizations...' : 'Search or choose a company verifier...'}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  {selectedOrg && (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                      Selected
                    </span>
                  )}
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-[#0680A6]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Panel */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type organization name or ID..."
                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:ring-2 focus:ring-[#0680A6]/10"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto sidebar-scroll p-2 divide-y divide-slate-50">
                    {loading ? (
                      <div className="p-6 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-[#0680A6] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs text-slate-500">Loading master organizations...</p>
                      </div>
                    ) : orgError ? (
                      <div className="p-4 text-center text-rose-500 text-xs">
                        <AlertCircle className="w-6 h-6 mx-auto mb-1 text-rose-400" />
                        <p>{orgError}</p>
                        <button
                          type="button"
                          onClick={fetchOrgs}
                          className="mt-2 text-[#0680A6] font-bold hover:underline"
                        >
                          Retry Loading
                        </button>
                      </div>
                    ) : filteredOrganizations.length > 0 ? (
                      filteredOrganizations.map((org) => {
                        const isSelected = selectedOrgId === org.OrganizationID
                        return (
                          <button
                            key={org.OrganizationID}
                            type="button"
                            onClick={() => handleSelectCompany(org)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer group ${
                              isSelected
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <OrgLogo name={org.OrganizationName} className="w-8 h-8" fallbackTextSize="text-xs" />
                              <div className="truncate">
                                <p className="text-xs sm:text-sm font-medium group-hover:text-[#0680A6] transition-colors truncate">
                                  {org.OrganizationName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            </div>
                          </button>
                        )
                      })
                    ) : (
                      <div className="p-6 text-center text-slate-400">
                        <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-semibold text-slate-500">
                          No verifier found matching "{searchQuery}"
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">Try another keyword or organization ID.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedOrg && (
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Ready to submit verification for {selectedOrg.OrganizationName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrgId('')
                    handleResetForm()
                  }}
                  className="text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 4. Candidate Verification Form Section */}
        {selectedOrg ? (
          <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/70 mb-8">
              <div className="flex items-center gap-3.5">
                <OrgLogo name={selectedOrg.OrganizationName} className="w-12 h-12" fallbackTextSize="text-base" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0680A6]">
                    Target Verifier
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {selectedOrg.OrganizationName}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrgId('')
                  window.scrollTo({ top: 100, behavior: 'smooth' })
                }}
                className="self-start sm:self-center px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Change Verifier
              </button>
            </div>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0680A6] block mb-1">
                Step 2
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Candidate Verification Details & Payment
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Fill in the candidate's employment details and complete the verification fee payment via Razorpay.
              </p>
            </div>

            {formError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3">
                <BadgeAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {paymentMessage && (
              <div
                className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 ${
                  paymentState === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}
              >
                {paymentState === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{paymentMessage}</span>
              </div>
            )}

            <form onSubmit={handlePaymentAndSubmit} className="space-y-8">
              {/* Profile Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-[#0680A6]" />
                  1. Candidate Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Candidate Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:bg-white focus:ring-4 focus:ring-[#0680A6]/10 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Employee ID / Code <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="e.g. EMP-98234"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:bg-white focus:ring-4 focus:ring-[#0680A6]/10 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Official / Personal Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="e.g. candidate@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:bg-white focus:ring-4 focus:ring-[#0680A6]/10 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Contact Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:bg-white focus:ring-4 focus:ring-[#0680A6]/10 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tenure Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Calendar className="w-4 h-4 text-[#0680A6]" />
                  2. Employment Tenure & Designation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Date of Joining <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dateOfJoining}
                      onChange={(e) => setDateOfJoining(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-[#0680A6] focus:bg-white focus:ring-4 focus:ring-[#0680A6]/10 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Date of Leaving {!isCurrentlyEmployed && <span className="text-rose-500">*</span>}
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-[#0680A6] font-semibold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isCurrentlyEmployed}
                          onChange={(e) => {
                            setIsCurrentlyEmployed(e.target.checked)
                            if (e.target.checked) setDateOfLeaving('')
                          }}
                          className="w-3.5 h-3.5 accent-[#0680A6] rounded cursor-pointer"
                        />
                        <span>Currently Employed</span>
                      </label>
                    </div>
                    <input
                      type="date"
                      value={dateOfLeaving}
                      disabled={isCurrentlyEmployed}
                      onChange={(e) => setDateOfLeaving(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                        isCurrentlyEmployed
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0680A6] focus:bg-white focus:ring-4 focus:ring-[#0680A6]/10'
                      }`}
                      required={!isCurrentlyEmployed}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Designation / Job Role
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:bg-white focus:ring-4 focus:ring-[#0680A6]/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Department / Business Unit
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Engineering / Operations"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:bg-white focus:ring-4 focus:ring-[#0680A6]/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Scope & Documents */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Layers className="w-4 h-4 text-[#0680A6]" />
                  3. Verification Scope & Documents
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Verification Type
                    </label>
                    <select
                      value={verificationType}
                      onChange={(e) => setVerificationType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-[#0680A6] focus:bg-white focus:ring-4 focus:ring-[#0680A6]/10 transition-all cursor-pointer"
                    >
                      <option value="Standard Employment Verification">
                        Standard Employment Verification (Dates, Title, Conduct)
                      </option>
                      <option value="Relieving & Experience Check">
                        Relieving & Experience Letter Confirmation
                      </option>
                      <option value="Full Comprehensive Screening">
                        Comprehensive Background Screening (HR + Supervisor)
                      </option>
                      <option value="Salary & Compensation Verification">
                        Salary & Compensation Verification
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Attach Supporting Documents (Experience Letter, Relieving Letter, Payslips, or ID)
                    </label>

                    <div className="border-2 border-dashed border-slate-200 hover:border-[#0680A6] rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-all">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#0680A6] flex items-center justify-center mb-3 shadow-xs">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">
                          Click to upload <span className="font-normal text-slate-500">or drag and drop files</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">PDF, DOCX, PNG, or JPG up to 10MB each</p>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {uploadedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#0680A6]" />
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            <span className="text-[10px] text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="text-slate-400 hover:text-rose-500 p-0.5 ml-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Additional Instructions / Notes for Verifier
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter any specific queries or instructions for the HR verifier..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:bg-white focus:ring-4 focus:ring-[#0680A6]/10 transition-all resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Confirmation Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-[#0680A6]" />
                  4. Review &amp; Direct Submission
                </h3>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-emerald-50/20 to-sky-50/20 border border-slate-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                        Direct Enterprise Dispatch
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        Candidate Verification Request
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Your request will be transmitted directly to <strong className="text-slate-700">{selectedOrg?.OrganizationName || 'the selected verifier'}</strong> and tracked in real-time on your dashboard.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0 select-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ready for Verification</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetForm}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  Reset Form
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer select-none ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Verification Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 shadow-sm border border-slate-200 flex items-center justify-center mx-auto text-[#0680A6] mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">No Verifier Selected Yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
              Please search and select a company in the dropdown above to unlock the candidate verification request form.
            </p>
          </div>
        )}
      </>
    ) : (
      /* Bulk Candidate Verification Panel (Identical Architecture to AddEmployee) */
      <div className="w-full mx-auto flex flex-col gap-8 animate-in fade-in duration-300">
        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#031f30] via-[#063352] to-[#0680A6] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-emerald-300 mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Batch Ingestion Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bulk Candidate Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Download the pre-formatted Excel sheet, fill your candidate verification records, and upload for automated batch processing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveMode('single')}
            className="self-start sm:self-center inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Switch to Single Entry
          </button>
        </div>

        {/* 2-Step Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step 1: Download Template */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase bg-emerald-100/70 text-emerald-800 rounded-full">
                  Step 1
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                Download Excel Template
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                Get the official Excel spreadsheet (<code>.xlsx</code>) pre-configured with headers and sample records matching the Candidate Verification form.
              </p>

              {/* Included Column Chips */}
              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Pre-configured Columns (12 Fields):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Candidate Full Name',
                    'Candidate Email',
                    'Contact Number',
                    'Employee Code',
                    'Verifier Organization',
                    'Designation',
                    'Department',
                    'Date of Joining',
                    'Date of Leaving',
                    'Currently Employed',
                    'Verification Type',
                    'Remarks'
                  ].map((col, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-lg border border-slate-200/70"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadExcelSample}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer select-none"
            >
              <Download className="w-5 h-5 shrink-0" />
              <span>Download Sample Template (.xlsx)</span>
            </button>
          </div>

          {/* Step 2: Upload Completed Sheet */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <form onSubmit={handleBulkSubmit} className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase bg-indigo-100/70 text-indigo-800 rounded-full">
                    Step 2
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Upload Completed Sheet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                  Select or drop your populated Excel spreadsheet (<code>.xlsx</code> / <code>.xls</code>) to validate and submit batch verification requests.
                </p>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                      : bulkFile
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    id="candidate-bulk-excel-input"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />

                  {bulkFile ? (
                    <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0 text-left">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {bulkFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {(bulkFile.size / 1024).toFixed(1)} KB • Ready to submit
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setBulkFile(null)
                          setBulkParsedRows([])
                          setBulkError('')
                          setBulkSuccessMessage('')
                        }}
                        className="relative z-20 text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-1" />
                      <p className="text-xs sm:text-sm font-semibold text-slate-700">
                        Drop your completed <code>.xlsx</code> file here, or{' '}
                        <span className="text-[#0680A6] underline font-bold">browse</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports Microsoft Excel spreadsheets (.xlsx, .xls)
                      </p>
                    </div>
                  )}
                </div>

                {/* Feedback Messages */}
                {bulkError && (
                  <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{bulkError}</span>
                  </div>
                )}

                {bulkSuccessMessage && (
                  <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>{bulkSuccessMessage}</span>
                  </div>
                )}

                {/* Parsed records summary & preview table */}
                {bulkParsedRows.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>{bulkParsedRows.length} Candidates Detected</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Preview (First 3)</span>
                    </div>

                    <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 text-[11px] bg-slate-50/50">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 text-slate-500 font-bold border-b border-slate-200">
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3">Candidate</th>
                            <th className="py-2 px-3">Emp Code</th>
                            <th className="py-2 px-3">Verifier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkParsedRows.slice(0, 3).map((r, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-white transition-colors">
                              <td className="py-1.5 px-3 font-mono text-slate-400">{i + 1}</td>
                              <td className="py-1.5 px-3 font-semibold text-slate-800">{r.candidateName}</td>
                              <td className="py-1.5 px-3 font-mono text-slate-600">{r.employeeId || 'N/A'}</td>
                              <td className="py-1.5 px-3 text-slate-600 truncate max-w-[120px]">{r.verifierName || 'Enterprise'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={bulkUploading || !bulkFile || bulkParsedRows.length === 0}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:brightness-110 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer select-none disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkUploading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Processing Batch Ingestion...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>
                        {bulkParsedRows.length > 0
                          ? `Process & Submit ${bulkParsedRows.length} Bulk Verification Requests`
                          : 'Upload & Process Batch File'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
      </main>

      {/* 5. Standalone Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-semibold tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#0680A6]" />
            <span>WALSONS SECURED VERIFICATION NETWORK</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.securitas.in/about-us/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 transition-colors"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="https://walsonsverify.com/assets/documents/Terms_and_condition.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 transition-colors"
            >
              Terms & Conditions
            </a>
            <span>•</span>
            <span>© 2026 WALSONSLABS</span>
          </div>
        </div>
      </footer>

      {/* 6. Payment & Verification Success Modal */}
      {submissionSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Verification Request Transmitted
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-3">Request Submitted!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your verification request for <strong className="text-slate-800">{candidateName}</strong> has been transmitted to{' '}
                <strong className="text-slate-800">{selectedOrg?.OrganizationName}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Request ID:</span>
                <span className="font-mono font-bold text-slate-800">{generatedRequestId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-amber-600">Pending Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate:</span>
                <span className="font-semibold text-slate-800">
                  {candidateName} ({employeeId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Organization:</span>
                <span className="font-semibold text-slate-800">{selectedOrg?.OrganizationName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccess(false)
                  navigate('/dashboard')
                }}
                className="w-full py-3 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccess(false)
                  handleResetForm()
                }}
                className="w-full py-2.5 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Submit Another Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CandidateVerificationForm

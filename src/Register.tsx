import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from './endpoint'
import { 
  Mail, 
  User, 
  Lock, 
  Building, 
  MapPin, 
  Globe, 
  CreditCard, 
  Hash, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  Check
} from 'lucide-react'
import securitasLogo from './assets/Img/logo_b.png'

type RegisterProps = { onLogin?: () => void }
type AccountType = 'Contributor' | 'Client'
type RegisterForm = {
  email: string
  firstName: string
  lastName: string
  companyName: string
  companyCode: string
  gstNo: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  password: string
  confirmPassword: string
}

const emptyForm: RegisterForm = { 
  email: '', 
  firstName: '', 
  lastName: '', 
  companyName: '', 
  companyCode: '', 
  gstNo: '', 
  address: '', 
  city: '', 
  state: '', 
  country: '', 
  zipCode: '', 
  password: '', 
  confirmPassword: '' 
}

// Live Input Sanitizer
const sanitizeInput = (field: keyof RegisterForm, value: string): string => {
  switch (field) {
    case 'firstName':
    case 'lastName':
    case 'city':
    case 'state':
    case 'country':
      // Only alphabetic characters and spaces, max 50 chars
      return value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50)
    case 'companyCode':
      // Auto-uppercase alphanumeric and allowed separators (-, _, /), max 20 chars
      return value.toUpperCase().replace(/[^A-Z0-9\-_/]/g, '').slice(0, 20)
    case 'gstNo':
      // Auto-uppercase alphanumeric, max 15 chars
      return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15)
    case 'zipCode':
      // Digits only, max 6 chars (PIN Code)
      return value.replace(/\D/g, '').slice(0, 6)
    default:
      return value
  }
}

// Comprehensive Single Field Validator
const validateSingleField = (
  field: keyof RegisterForm,
  value: string,
  currentForm: RegisterForm,
  accountType: AccountType
): string => {
  const val = (value || '').trim()

  switch (field) {
    case 'email':
      if (!val) return 'Official email is required'
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
        return 'Enter a valid email address (e.g., name@company.com)'
      }
      return ''

    case 'firstName':
      if (!val) return 'First name is required'
      if (!/^[a-zA-Z\s]+$/.test(val)) return 'Only alphabetic characters allowed'
      if (val.length < 2) return 'First name must be at least 2 characters'
      if (val.length > 50) return 'First name cannot exceed 50 characters'
      return ''

    case 'lastName':
      if (!val) return 'Last name is required'
      if (!/^[a-zA-Z\s]+$/.test(val)) return 'Only alphabetic characters allowed'
      if (val.length < 2) return 'Last name must be at least 2 characters'
      if (val.length > 50) return 'Last name cannot exceed 50 characters'
      return ''

    case 'companyName':
      if (accountType === 'Contributor') {
        if (!val) return 'Company name is required'
        if (val.length < 2) return 'Company name must be at least 2 characters'
        if (val.length > 100) return 'Company name cannot exceed 100 characters'
      }
      return ''

    case 'companyCode':
      if (!val) return ''
      if (val.length < 2) return 'Company code must be at least 2 characters'
      if (!/^[A-Z0-9\-_/]+$/i.test(val)) {
        return 'Can only contain alphanumeric characters, hyphens, and slashes'
      }
      if (val.length > 20) return 'Company code must not exceed 20 characters'
      return ''

    case 'gstNo': {
      if (!val) return ''
      if (val.length !== 15) return 'GST number must be exactly 15 characters'
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
      if (!gstRegex.test(val)) {
        return 'Enter a valid 15-character GSTIN (e.g., 07AAACS1122C1ZK)'
      }
      return ''
    }

    case 'address':
      if (!val) return ''
      if (val.length < 5) return 'Address must be at least 5 characters'
      if (val.length > 250) return 'Address cannot exceed 250 characters'
      return ''

    case 'city':
      if (!val) return ''
      if (!/^[a-zA-Z\s]+$/.test(val)) return 'Only alphabetic characters allowed'
      if (val.length < 2) return 'City must be at least 2 characters'
      if (val.length > 50) return 'City cannot exceed 50 characters'
      return ''

    case 'state':
      if (!val) return ''
      if (!/^[a-zA-Z\s]+$/.test(val)) return 'Only alphabetic characters allowed'
      if (val.length < 2) return 'State must be at least 2 characters'
      if (val.length > 50) return 'State cannot exceed 50 characters'
      return ''

    case 'country':
      if (!val) return ''
      if (!/^[a-zA-Z\s]+$/.test(val)) return 'Only alphabetic characters allowed'
      if (val.length < 2) return 'Country must be at least 2 characters'
      if (val.length > 50) return 'Country cannot exceed 50 characters'
      return ''

    case 'zipCode':
      if (!val) return ''
      if (!/^\d{6}$/.test(val)) return 'PIN / ZIP code must be exactly 6 digits'
      return ''

    case 'password':
      if (!val) return 'Password is required'
      if (val.length < 6) return 'Password must be at least 6 characters'
      if (val.length > 50) return 'Password cannot exceed 50 characters'
      return ''

    case 'confirmPassword':
      if (!val) return 'Please confirm your password'
      if (val !== currentForm.password) return 'Passwords do not match'
      return ''

    default:
      return ''
  }
}

function Register({ onLogin }: RegisterProps) {
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState<AccountType>('Contributor')
  const [form, setForm] = useState<RegisterForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Registration OTP States
  const [awaitingOtp, setAwaitingOtp] = useState(false)
  const [regOtp, setRegOtp] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpSuccess, setOtpSuccess] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)

  // Countdown timer for Registration OTP resend
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpCountdown])

  const updateField = (field: keyof RegisterForm, rawValue: string) => {
    const sanitized = sanitizeInput(field, rawValue)
    const updatedForm = { ...form, [field]: sanitized }
    setForm(updatedForm)

    if (touched[field]) {
      const err = validateSingleField(field, sanitized, updatedForm, accountType)
      setErrors((prev) => ({ ...prev, [field]: err }))
    }

    if (field === 'password' && touched.confirmPassword && updatedForm.confirmPassword) {
      const confirmErr = validateSingleField('confirmPassword', updatedForm.confirmPassword, updatedForm, accountType)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }))
    }
    if (field === 'confirmPassword' && touched.password && updatedForm.password) {
      const confirmErr = validateSingleField('confirmPassword', sanitized, updatedForm, accountType)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }))
    }
  }

  const handleBlur = (field: keyof RegisterForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const err = validateSingleField(field, form[field], form, accountType)
    setErrors((prev) => ({ ...prev, [field]: err }))

    if (field === 'password' && touched.confirmPassword && form.confirmPassword) {
      const confirmErr = validateSingleField('confirmPassword', form.confirmPassword, form, accountType)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }))
    }
  }

  const handleTypeChange = (type: AccountType) => { 
    setAccountType(type)
    setError('')
    setSuccess('') 
    setErrors({})
    setTouched({})
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const relevantFields: (keyof RegisterForm)[] = accountType === 'Contributor'
      ? [
          'email',
          'firstName',
          'lastName',
          'companyName',
          'companyCode',
          'gstNo',
          'address',
          'city',
          'state',
          'country',
          'zipCode',
          'password',
          'confirmPassword'
        ]
      : [
          'email',
          'firstName',
          'lastName',
          'password',
          'confirmPassword'
        ]

    const newErrors: Record<string, string> = {}
    const allTouched: Record<string, boolean> = {}

    relevantFields.forEach((field) => {
      allTouched[field] = true
      const err = validateSingleField(field, form[field], form, accountType)
      if (err) {
        newErrors[field] = err
      }
    })

    setTouched(allTouched)
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstKey = relevantFields.find((f) => newErrors[f]) || Object.keys(newErrors)[0]
      setError(`Please correct the highlighted errors before submitting. (${newErrors[firstKey]})`)
      setTimeout(() => {
        const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null
        if (el) {
          el.focus()
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
      return
    }

    setIsLoading(true)
    const username = `${form.firstName}_${form.lastName}`.trim().replace(/\s+/g, '_').toLowerCase()
    const payload = {
      username,
      password: form.password,
      UserType: accountType,
      EmailID: form.email.trim(),
      email: form.email.trim(),
      FirstName: form.firstName.trim(),
      LastName: form.lastName.trim(),
      CompanyName: accountType === 'Contributor' ? form.companyName.trim() : null,
      CompanyCode: accountType === 'Contributor' && form.companyCode.trim() ? form.companyCode.trim() : null,
      GSTNumber: accountType === 'Contributor' && form.gstNo.trim() ? form.gstNo.trim() : null,
      Address: accountType === 'Contributor' && form.address.trim() ? form.address.trim() : null,
      City: accountType === 'Contributor' && form.city.trim() ? form.city.trim() : null,
      State: accountType === 'Contributor' && form.state.trim() ? form.state.trim() : null,
      Country: accountType === 'Contributor' && form.country.trim() ? form.country.trim() : null,
      ZIPcode: accountType === 'Contributor' && form.zipCode.trim() ? form.zipCode.trim() : null,
    }
    
    try {
      let result = await fetch(API_ENDPOINTS.auth.register, { 
        method: 'POST', 
        headers: { 
          APIKEY: 'Securitas@#!1234', 
          'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify(payload) 
      })
      if (result.status === 404 && (API_ENDPOINTS.auth as any).registerLegacy) {
        result = await fetch((API_ENDPOINTS.auth as any).registerLegacy, {
          method: 'POST',
          headers: {
            APIKEY: 'Securitas@#!1234',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      }
      const text = await result.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
      if (!result.ok) throw new Error(data.message || `Registration failed (${result.status})`)
      
      // Successfully registered initial profile; transition to OTP verification
      setRegisteredEmail(form.email.trim())
      setAwaitingOtp(true)
      setOtpCountdown(45)
      setOtpSuccess(data.message || `Verification code sent to ${form.email.trim()}`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to registration service.')
    } finally { 
      setIsLoading(false) 
    }
  }

  const handleVerifyRegistrationOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!regOtp.trim() || regOtp.trim().length < 4) {
      setOtpError('Please enter a valid verification code.')
      return
    }
    setOtpLoading(true)
    setOtpError('')
    setOtpSuccess('')

    try {
      const payload = {
        EmailID: registeredEmail.trim(),
        OTP: regOtp.trim(),
      }
      const response = await fetch(API_ENDPOINTS.auth.verifyRegistrationOtp, {
        method: 'POST',
        headers: {
          APIKEY: 'Securitas@#!1234',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const text = await response.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
      if (!response.ok) {
        throw new Error(data.message || `Invalid or expired verification code (${response.status})`)
      }

      setIsVerified(true)
      setForm(emptyForm)
      setErrors({})
      setTouched({})
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Failed to verify registration code.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendRegistrationOtp = async () => {
    if (otpCountdown > 0 || otpLoading) return
    setOtpLoading(true)
    setOtpError('')
    setOtpSuccess('')

    try {
      // Re-trigger registration or OTP dispatch
      const username = `${form.firstName}_${form.lastName}`.trim().replace(/\s+/g, '_').toLowerCase()
      const payload = {
        username,
        password: form.password,
        UserType: accountType,
        EmailID: registeredEmail.trim(),
        FirstName: form.firstName,
        LastName: form.lastName,
      }
      let response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: {
          APIKEY: 'Securitas@#!1234',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (response.status === 404 && (API_ENDPOINTS.auth as any).registerLegacy) {
        response = await fetch((API_ENDPOINTS.auth as any).registerLegacy, {
          method: 'POST',
          headers: {
            APIKEY: 'Securitas@#!1234',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      }
      const text = await response.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
      setOtpSuccess(data.message || `A fresh code has been sent to ${registeredEmail}`)
      setOtpCountdown(45)
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Unable to resend code.')
    } finally {
      setOtpLoading(false)
    }
  }

  const getIconForField = (field: keyof RegisterForm) => {
    switch (field) {
      case 'email': return Mail
      case 'firstName':
      case 'lastName': return User
      case 'password':
      case 'confirmPassword': return Lock
      case 'companyName': return Building
      case 'companyCode':
      case 'zipCode': return Hash
      case 'gstNo': return CreditCard
      case 'address':
      case 'city':
      case 'state': return MapPin
      case 'country': return Globe
      default: return User
    }
  }

  const input = (
    field: keyof RegisterForm, 
    label: string, 
    placeholder = label, 
    required = false, 
    type = 'text',
    className = 'col-span-1'
  ) => {
    const Icon = getIconForField(field)
    const isPasswordField = field === 'password' || field === 'confirmPassword'
    const isShowing = field === 'password' ? showPassword : showConfirmPassword
    const actualType = isPasswordField ? (isShowing ? 'text' : 'password') : type

    const hasError = !!(touched[field] && errors[field])
    const errorMsg = errors[field]
    const isValid = !!touched[field] && !hasError && Boolean(form[field])

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={`field-${field}`}
            className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase select-none transition-colors ${
              hasError ? 'text-rose-600 font-extrabold' : 'text-slate-500'
            }`}
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {isValid && (
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 animate-fade-in">
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Valid
            </span>
          )}
        </div>

        <div
          className={`flex items-center gap-2.5 h-[46px] px-3.5 rounded-2xl transition-all shadow-2xs ${
            hasError
              ? 'border-2 border-rose-500 bg-rose-50/20 text-rose-900 focus-within:border-rose-600 focus-within:ring-2 focus-within:ring-rose-500/20'
              : isValid
              ? 'border border-emerald-400 bg-emerald-50/10 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10'
              : 'bg-slate-50/70 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-[#42638C] focus-within:ring-2 focus-within:ring-slate-100'
          }`}
        >
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              hasError ? 'text-rose-500' : isValid ? 'text-emerald-500' : 'text-slate-400'
            }`}
          />
          <input
            id={`field-${field}`}
            name={field}
            type={actualType}
            value={form[field]}
            onChange={(event) => updateField(field, event.target.value)}
            onBlur={() => handleBlur(field)}
            placeholder={placeholder}
            inputMode={field === 'zipCode' ? 'numeric' : undefined}
            autoComplete="off"
            className={`w-full placeholder-slate-400 outline-none text-xs sm:text-sm bg-transparent font-medium ${
              hasError ? 'text-rose-900' : 'text-slate-800'
            }`}
          />
          {isPasswordField && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                if (field === 'password') setShowPassword(!showPassword)
                else setShowConfirmPassword(!showConfirmPassword)
              }}
              className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors shrink-0 cursor-pointer"
            >
              {isShowing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {hasError && (
          <p className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-0.5 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </p>
        )}
      </div>
    )
  }

  // --- RENDER: Account Verified Success View ---
  if (isVerified) {
    return (
      <div className="flex flex-col items-center text-center w-full font-securitas select-text animate-fade-in py-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5 text-emerald-600 shadow-sm border border-emerald-200">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082136] tracking-tight leading-tight mb-2">
          Account Verified!
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-sm mb-6">
          Your <span className="font-semibold text-slate-700">{accountType}</span> account has been successfully verified and activated.
        </p>

        <Link
          to="/login"
          onClick={onLogin}
          className="w-full h-[50px] rounded-full text-white text-xs sm:text-[13px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none shadow-md"
        >
          <span>Proceed to Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  // --- RENDER: Registration OTP Verification View ---
  if (awaitingOtp) {
    return (
      <div className="flex flex-col w-full font-securitas select-text animate-fade-in">
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <img src={securitasLogo} alt="Securitas" className="h-7 sm:h-8 object-contain" />
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Email Verification
          </span>
        </div>

        {/* Headings */}
        <div className="mb-5 select-none text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082136] tracking-tight leading-tight mb-1">
            Verify Your Email
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Enter the 6-digit verification code sent to{' '}
            <span className="font-semibold text-slate-700">{registeredEmail}</span>
          </p>
        </div>

        {/* Feedback Messages */}
        {otpSuccess && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{otpSuccess}</span>
          </div>
        )}
        {otpError && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold animate-fade-in" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{otpError}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerifyRegistrationOtp} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
              6-Digit Verification Code
            </label>
            <div className="flex items-center gap-3 h-[52px] px-4 bg-slate-50/70 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-[#42638C] focus-within:ring-2 focus-within:ring-slate-100 rounded-2xl transition-all shadow-2xs">
              <KeyRound className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={regOtp}
                onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full text-slate-800 placeholder-slate-400 outline-none text-base sm:text-lg tracking-[0.4em] text-center font-bold bg-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={otpLoading || regOtp.length < 4}
            className="w-full h-[50px] rounded-full text-white text-xs sm:text-[13px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none shadow-md disabled:grayscale disabled:opacity-50 mt-1"
          >
            <span>{otpLoading ? 'Activating Account...' : 'Verify & Activate Account'}</span>
            {!otpLoading && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              onClick={handleResendRegistrationOtp}
              disabled={otpCountdown > 0 || otpLoading}
              className="font-bold text-[#0680A6] hover:text-[#082136] disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${otpLoading ? 'animate-spin' : ''}`} />
              {otpCountdown > 0 ? `Resend Code in ${otpCountdown}s` : 'Resend Code'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAwaitingOtp(false)
                setRegOtp('')
                setOtpError('')
                setOtpSuccess('')
              }}
              className="font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Edit Details
            </button>
          </div>
        </form>

        {/* Separator */}
        <div className="w-full border-t border-slate-200/80 my-5"></div>

        {/* Telemetry Warning Footer */}
        <div className="flex flex-col items-center justify-center gap-1 select-none text-center">
          <p className="text-[9px] sm:text-[10px] leading-relaxed text-slate-400 font-bold tracking-wider uppercase">
            Securitas Cryptographic Account Activation.
            <br className="hidden sm:inline" />
            IP Logging and Telemetry Tracking Active.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full font-securitas select-text">
      {/* Brand Header */}
      <div className="flex items-center justify-between gap-2 mb-5">
        <img
          src={securitasLogo}
          alt="Securitas"
          className="h-7 sm:h-8 object-contain"
        />
      
      </div>

      {/* Headings */}
      <div className="mb-4 select-none text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082136] tracking-tight leading-tight mb-1">
          Create Account
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium">
          Select registration role to start verification onboarding.
        </p>
      </div>

      {/* Account Type Toggle Tabs */}
      <div className="flex bg-slate-100 rounded-full p-1 gap-1 mb-5 border border-slate-200/60" role="tablist">
        <button
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 select-none cursor-pointer ${
            accountType === 'Contributor'
              ? 'bg-gradient-to-r from-[#10B981] to-[#5850EC] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          type="button"
          role="tab"
          aria-selected={accountType === 'Contributor'}
          onClick={() => handleTypeChange('Contributor')}
        >
          Contributor
        </button>
        <button
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 select-none cursor-pointer ${
            accountType === 'Client'
              ? 'bg-gradient-to-r from-[#10B981] to-[#5850EC] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          type="button"
          role="tab"
          aria-selected={accountType === 'Client'}
          onClick={() => handleTypeChange('Client')}
        >
          Client
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5 w-full">
        {/* Responsive Grid for Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 w-full">
          {/* Email Field */}
          {input('email', 'Official Email', 'name@company.com', true, 'email', 'sm:col-span-2')}

          {/* First & Last Name */}
          {input('firstName', 'First Name', 'First name', true, 'text', 'col-span-1')}
          {input('lastName', 'Last Name', 'Last name', true, 'text', 'col-span-1')}

          {/* Dynamic Contributor Fields */}
          {accountType === 'Contributor' && (
            <>
              {input('companyName', 'Company Name', 'e.g. Acme Securitas Pvt Ltd', true, 'text', 'sm:col-span-2')}
              {input('companyCode', 'Company Code', 'e.g. ACM-01', false, 'text', 'col-span-1')}
              {input('gstNo', 'GST Number', 'e.g. 07AAACS1122C1ZK', false, 'text', 'col-span-1')}
              {input('address', 'Office Address', 'Building, Street...', false, 'text', 'sm:col-span-2')}
              {input('city', 'City', 'e.g. Mumbai', false, 'text', 'col-span-1')}
              {input('state', 'State', 'e.g. Maharashtra', false, 'text', 'col-span-1')}
              {input('country', 'Country', 'India', false, 'text', 'col-span-1')}
              {input('zipCode', 'ZIP / PIN Code', 'e.g. 400001', false, 'text', 'col-span-1')}
            </>
          )}

          {/* Passwords */}
          {input('password', 'Password', 'Min. 6 characters', true, 'password', 'col-span-1')}
          {input('confirmPassword', 'Confirm Password', 'Re-enter password', true, 'password', 'col-span-1')}
        </div>

        {/* Error/Success Handlers */}
        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold animate-fade-in" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold animate-fade-in" role="status">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="w-full h-[48px] rounded-full text-white text-xs sm:text-[13px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none shadow-md disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          type="submit"
          disabled={isLoading}
        >
          <span>{isLoading ? 'Creating Account...' : `Create ${accountType} Account`}</span>
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      {/* Separator */}
      <div className="w-full border-t border-slate-200/80 my-4"></div>

      {/* Sign In Switch Link */}
      <div className="text-center select-none mb-3">
        <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
          Already have an account?{' '}
        </span>
        <Link
          to="/login"
          onClick={onLogin}
          className="text-[11px] sm:text-xs font-extrabold text-[#082136] hover:text-[#0b2b41] uppercase tracking-wider transition-colors ml-1"
        >
          Sign In
        </Link>
      </div>

      {/* Telemetry Footer */}
      <div className="flex flex-col items-center justify-center gap-1 select-none text-center">
        <p className="text-[8.5px] sm:text-[9.5px] leading-tight text-slate-400 font-bold tracking-wider uppercase">
          System Authorized Operations Only.
          <br className="hidden sm:inline" />
          IP Logging and Telemetry Tracking Active.
        </p>
      </div>
    </div>
  )
}

export default Register

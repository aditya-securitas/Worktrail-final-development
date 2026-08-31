import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { API_ENDPOINTS } from './endpoint'
import { 
  Mail, 
  User, 
  Lock, 
  Building, 
  MapPin, 
  Globe, 
  CreditCard, 
  Hash 
} from 'lucide-react'

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

function Register({ onLogin }: RegisterProps) {
  const [accountType, setAccountType] = useState<AccountType>('Contributor')
  const [form, setForm] = useState<RegisterForm>(emptyForm)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateField = (field: keyof RegisterForm, value: string) => 
    setForm((current) => ({ ...current, [field]: value }))

  const handleTypeChange = (type: AccountType) => { 
    setAccountType(type)
    setError('')
    setSuccess('') 
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (form.password !== form.confirmPassword) { 
      setError('Passwords do not match.')
      return 
    }
    setIsLoading(true)
    const username = `${form.firstName}_${form.lastName}`.trim().replace(/\s+/g, '_').toLowerCase()
    const payload = {
      username,
      password: form.password,
      UserType: accountType,
      EmailID: form.email,
      FirstName: form.firstName,
      LastName: form.lastName,
      CompanyName: accountType === 'Contributor' ? form.companyName : null,
      CompanyCode: accountType === 'Contributor' ? form.companyCode : null,
      GSTNumber: accountType === 'Contributor' ? form.gstNo : null,
      Address: accountType === 'Contributor' ? form.address : null,
      City: accountType === 'Contributor' ? form.city : null,
      State: accountType === 'Contributor' ? form.state : null,
      Country: accountType === 'Contributor' ? form.country : null,
      ZIPcode: accountType === 'Contributor' ? form.zipCode : null,
    }
    
    if (import.meta.env.DEV) {
      console.log('[Register API] Request:', {
        endpoint: API_ENDPOINTS.auth.register,
        method: 'POST',
        body: payload,
      })
    }
    
    try {
      const result = await fetch(API_ENDPOINTS.auth.register, { 
        method: 'POST', 
        headers: { 
          APIKEY: 'Securitas@#!1234', 
          'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify(payload) 
      })
      const data = await result.json().catch(() => ({})) as { message?: string }
      if (!result.ok) throw new Error(data.message || `Registration failed (${result.status})`)
      setSuccess(data.message || `${accountType} account created successfully.`)
      setForm(emptyForm)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to the registration service.')
    } finally { 
      setIsLoading(false) 
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

  const input = (field: keyof RegisterForm, label: string, placeholder = label, required = false, type = 'text') => {
    const Icon = getIconForField(field)
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
          {label}
        </label>
        <div className="flex items-center gap-3 h-[48px] px-4 bg-white border border-slate-200/80 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 rounded-full transition-all">
          <Icon className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <input
            type={type}
            value={form[field]}
            onChange={(event) => updateField(field, event.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full text-slate-800 placeholder-slate-400 outline-none text-[13px] sm:text-[14px] bg-transparent"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full font-securitas">
      {/* Headings */}
      <div className="mb-6 select-none">
        <h2 className="text-[32px] font-bold text-[#082136] tracking-tight leading-tight mb-2">
          Create Account
        </h2>
        <p className="text-slate-500 text-[13px] sm:text-sm font-medium tracking-wide">
          Choose your account type to get started.
        </p>
      </div>

      {/* Account Type Toggle Tabs */}
      <div className="flex bg-slate-200/80 rounded-full p-1 gap-1 mb-6" role="tablist">
        <button
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 select-none cursor-pointer ${
            accountType === 'Contributor'
              ? 'bg-[#031f30] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
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
              ? 'bg-[#031f30] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {/* Email Field */}
        {input('email', 'Email ID', 'you@company.com', true, 'email')}

        {/* First & Last Name */}
        <div className="flex gap-4">
          {input('firstName', 'First name', 'First name', true)}
          {input('lastName', 'Last name', 'Last name', true)}
        </div>

        {/* Dynamic Contributor Fields */}
        {accountType === 'Contributor' && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              {input('companyName', 'Company name', 'Company name', true)}
              {input('companyCode', 'Company code')}
            </div>
            <div className="flex gap-4">
              {input('gstNo', 'GST number')}
              {input('address', 'Address')}
            </div>
            <div className="flex gap-4">
              {input('city', 'City')}
              {input('state', 'State')}
            </div>
            <div className="flex gap-4">
              {input('country', 'Country')}
              {input('zipCode', 'ZIP code')}
            </div>
          </div>
        )}

        {/* Passwords */}
        <div className="flex gap-4">
          {input('password', 'Password', 'Password', true, 'password')}
          {input('confirmPassword', 'Confirm password', 'Confirm password', true, 'password')}
        </div>

        {/* Error/Success Handlers */}
        {error && (
          <p className="text-[11px] sm:text-xs text-red-500 font-semibold text-center mt-1" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-[11px] sm:text-xs text-emerald-600 font-semibold text-center mt-1" role="status">
            {success}
          </p>
        )}

        {/* Submit Button */}
        <button
          className="w-full h-[54px] mt-2 rounded-full text-white text-[13px] font-bold tracking-widest bg-gradient-to-r from-[#031f30] via-[#0b2b41] to-[#88ffbb] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] transition-all uppercase flex items-center justify-center cursor-pointer select-none"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : `Create ${accountType} Account`}
        </button>
      </form>

      {/* Separator */}
      <div className="w-full border-t border-slate-200/80 my-5"></div>

      {/* Sign In Switch Link */}
      <div className="text-center select-none mb-6">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Already have an account?{' '}
        </span>
        <Link
          to="/login"
          onClick={onLogin}
          className="text-[10px] sm:text-[11px] font-bold text-[#082136] hover:text-[#0b2b41] uppercase tracking-wider transition-colors ml-1"
        >
          Sign In
        </Link>
      </div>

      {/* Telemetry Footer */}
      <div className="flex flex-col items-center justify-center gap-3 select-none">
        <p className="text-[9px] sm:text-[10px] text-center leading-normal text-slate-400 font-bold tracking-widest uppercase">
          System Authorized Operations Only.
          <br />
          IP Logging and Telemetry Tracking Active.
        </p>
        <Link
          to="/Privacypolicy"
          className="text-[10px] sm:text-[11px] font-bold text-[#082136] hover:text-[#0b2b41] uppercase tracking-widest transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}

export default Register

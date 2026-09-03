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
  Hash,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight
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

function Register({ onLogin }: RegisterProps) {
  const [accountType, setAccountType] = useState<AccountType>('Contributor')
  const [form, setForm] = useState<RegisterForm>(emptyForm)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      setSuccess(data.message || `${accountType} account created successfully!`)
      setForm(emptyForm)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to registration service.')
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

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex items-center gap-2.5 h-[46px] px-3.5 bg-slate-50/70 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-[#42638C] focus-within:ring-2 focus-within:ring-slate-100 rounded-2xl transition-all shadow-2xs">
          <Icon className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type={actualType}
            value={form[field]}
            onChange={(event) => updateField(field, event.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full text-slate-800 placeholder-slate-400 outline-none text-xs sm:text-sm bg-transparent font-medium"
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full">
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

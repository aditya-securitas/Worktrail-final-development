import { useState, type FormEvent } from 'react'
import { useAuth } from './useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import securitasLogo from './assets/Img/logo_b.png'
import { checkClientHasRequests } from './client-utils'

type LoginProps = {
  onRegister?: () => void
}

function Login({ onRegister }: LoginProps) {
  const [emailId, setEmailId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const loggedUser = await login(emailId, password)
      const currentUser = loggedUser || (() => {
        try {
          const stored = localStorage.getItem('worktrail_user')
          return stored ? JSON.parse(stored) : null
        } catch {
          return null
        }
      })()

      if (currentUser?.Usertype?.toLowerCase() === 'client') {
        const hasRequests = checkClientHasRequests(currentUser, emailId)
        if (hasRequests) {
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/CandidateVerification', { replace: true })
        }
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch { }
  }

  return (
    <div className="flex flex-col w-full font-securitas select-text">
      {/* Brand Header */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <img
          src={securitasLogo}
          alt="Securitas"
          className="h-7 sm:h-8 object-contain"
        />
    
      </div>

      {/* Headings */}
      <div className="mb-6 select-none text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082136] tracking-tight leading-tight mb-1">
          Sign In
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium">
          Enter credentials to access workforce verification portal.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {/* User ID Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
            User ID / Email Address
          </label>
          <div className="flex items-center gap-3 h-[48px] px-4 bg-slate-50/70 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-[#42638C] focus-within:ring-2 focus-within:ring-slate-100 rounded-2xl transition-all shadow-2xs">
            <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
            <input
              type="email"
              value={emailId}
              onChange={(event) => setEmailId(event.target.value)}
              placeholder="user@company.com"
              className="w-full text-slate-800 placeholder-slate-400 outline-none text-xs sm:text-sm bg-transparent font-medium"
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center select-none">
            <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Password
            </label>
            <a
              href="#forgot"
              className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#0680A6] hover:text-[#082136] uppercase transition-colors"
            >
              Key Recovery
            </a>
          </div>
          <div className="flex items-center gap-3 h-[48px] px-4 bg-slate-50/70 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-[#42638C] focus-within:ring-2 focus-within:ring-slate-100 rounded-2xl transition-all shadow-2xs">
            <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••••"
              className="w-full text-slate-800 placeholder-slate-400 outline-none text-xs sm:text-sm tracking-wider bg-transparent font-medium"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((current) => !current)}
              className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none shrink-0 p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-2 select-none py-0.5">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 accent-[#031f30] border-slate-300 rounded focus:ring-[#031f30]/20 cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="text-[11px] font-bold tracking-wider text-slate-500 uppercase cursor-pointer select-none"
          >
            Remember session
          </label>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold animate-fade-in" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="w-full h-[50px] rounded-full text-white text-xs sm:text-[13px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none shadow-md disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          type="submit"
          disabled={isLoading}
        >
          <span>{isLoading ? 'Authenticating...' : 'Login'}</span>
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      {/* Separator */}
      <div className="w-full border-t border-slate-200/80 my-5"></div>

      {/* Toggle Link */}
      <div className="text-center select-none mb-4">
        <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
          Don't have an account?{' '}
        </span>
        <Link
          to="/register"
          onClick={onRegister}
          className="text-[11px] sm:text-xs font-extrabold text-[#082136] hover:text-[#0b2b41] uppercase tracking-wider transition-colors ml-1"
        >
          Sign Up
        </Link>
      </div>

      {/* Telemetry Warning Footer */}
      <div className="flex flex-col items-center justify-center gap-1 select-none text-center">
        <p className="text-[9px] sm:text-[10px] leading-relaxed text-slate-400 font-bold tracking-wider uppercase">
          System Authorized Operations Only.
          <br className="hidden sm:inline" />
          IP Logging and Telemetry Tracking Active.
        </p>
      </div>
    </div>
  )
}

export default Login

import { useState, type FormEvent } from 'react'
import { useAuth } from './useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

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
      await login(emailId, password)
      navigate('/dashboard', { replace: true })
    } catch { }
  }

  return (
    <div className="flex flex-col w-full font-securitas">
      {/* Headings */}
      <div className="mb-8 select-none">
        <h2 className="text-[32px] font-bold text-[#082136] tracking-tight leading-tight mb-2">
          Access Portal
        </h2>
        <p className="text-slate-500 text-[13px] sm:text-sm font-medium tracking-wide">
          Enter your credentials to initialize compliance check.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        {/* User ID Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
            User ID
          </label>
          <div className="flex items-center gap-3 h-[52px] px-4 bg-white border border-slate-200/80 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 rounded-full transition-all">
            <Mail className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="email"
              value={emailId}
              onChange={(event) => setEmailId(event.target.value)}
              placeholder="user@sentinel.network"
              className="w-full text-slate-800 placeholder-slate-400 outline-none text-[13px] sm:text-[14px] bg-transparent"
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center select-none">
            <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Password
            </label>
            <a
              href="#forgot"
              className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#4A6B82] hover:text-[#082136] uppercase transition-colors"
            >
              Key Recovery
            </a>
          </div>
          <div className="flex items-center gap-3 h-[52px] px-4 bg-white border border-slate-200/80 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 rounded-full transition-all">
            <Lock className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="............"
              className="w-full text-slate-800 placeholder-slate-400 outline-none text-[13px] sm:text-[14px] tracking-widest bg-transparent"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((current) => !current)}
              className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none shrink-0"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-2 select-none py-1">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 accent-[#031f30] border-slate-300 rounded focus:ring-[#031f30]/20 cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase cursor-pointer select-none"
          >
            Remember
          </label>
        </div>

        {/* Error Handling */}
        {error && (
          <p className="text-[11px] sm:text-xs text-red-500 font-semibold text-center -mt-2" role="alert">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          className="w-full h-[54px] rounded-full text-white text-[13px] font-bold tracking-widest bg-gradient-to-r from-[#031f30] via-[#0b2b41] to-[#88ffbb] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] transition-all uppercase flex items-center justify-center cursor-pointer select-none"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Login'}
        </button>
      </form>

      {/* Separator */}
      <div className="w-full border-t border-slate-200/80 my-5"></div>

      {/* Toggle Link */}
      <div className="text-center select-none mb-6">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Don't have an account?{' '}
        </span>
        <Link
          to="/register"
          onClick={onRegister}
          className="text-[10px] sm:text-[11px] font-bold text-[#082136] hover:text-[#0b2b41] uppercase tracking-wider transition-colors ml-1"
        >
          Sign Up
        </Link>
      </div>

      {/* Telemetry Warning Footer */}
      <div className="flex flex-col items-center justify-center gap-3 select-none">
        <p className="text-[9px] sm:text-[10px] text-center leading-normal text-slate-400 font-bold tracking-widest uppercase">
          System Authorized Operations Only.
          <br />
          IP Logging and Telemetry Tracking Active.
        </p>
     
      </div>
    </div>
  )
}

export default Login

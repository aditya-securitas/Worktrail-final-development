import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  KeyRound, 
  ArrowLeft, 
  RotateCw, 
  CheckCircle2 
} from 'lucide-react'
import securitasLogo from './assets/Img/logo_b.png'
import { API_ENDPOINTS, BASE_URL } from './endpoint'

async function callEndpointCascade(endpoints: string[], payload: any, extraHeaders: Record<string, string> = {}) {
  let lastError = 'Request failed. Please try again.'
  for (const endpoint of endpoints) {
    if (!endpoint) continue
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          APIKEY: 'Securitas@#!1234', 
          'Content-Type': 'application/json',
          ...extraHeaders,
        },
        body: JSON.stringify(payload),
      })
      const text = await res.text()
      // Skip Express HTML 404
      if (res.status === 404 || text.includes('Cannot POST') || text.includes('<!DOCTYPE html>')) {
        continue
      }
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
      if (!res.ok) {
        lastError = data?.message || `Request failed (${res.status})`
        continue
      }
      // Check if backend returned HTTP 200 but logical failure
      if (data && (data.status === false || data.success === false || data.loginStatus === false || data.updateStatus === false)) {
        lastError = data?.message || 'Operation failed. Please verify your details.'
        continue
      }
      return data
    } catch (err: any) {
      lastError = err?.message || lastError
    }
  }
  throw new Error(lastError)
}

function ForgotPassword() {
  // 2-step password recovery flow:
  // 'request' -> 'reset' -> 'success'
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request')
  const [emailId, setEmailId] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [resendCountdown, setResendCountdown] = useState(45)
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState('')

  const isSubmittingRef = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (step !== 'reset' || resendCountdown <= 0) return
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [step, resendCountdown])

  // Step 1: Request OTP code to registered email
  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading || isSubmittingRef.current) return
    if (!emailId.trim()) {
      setError('Please enter your registered Email or User ID.')
      return
    }

    isSubmittingRef.current = true
    setIsLoading(true)
    setError('')
    setResendStatus('')

    try {
      const cleanIdentifier = emailId.trim()
      const payload = {
        EmailID: cleanIdentifier,
        email: cleanIdentifier,
        username: cleanIdentifier,
      }

      const endpoints = [
        API_ENDPOINTS.auth.requestPasswordReset,
        `${BASE_URL}/Auth/RequestPasswordReset`,
      ].filter(Boolean)

      const result = await callEndpointCascade(endpoints, payload)
      setInfoMessage(result?.message || `A password recovery code has been sent to ${cleanIdentifier}`)
      setStep('reset')
      setResendCountdown(45)
    } catch (err: any) {
      setError(err?.message || 'Unable to request password reset code. Please try again.')
    } finally {
      isSubmittingRef.current = false
      setIsLoading(false)
    }
  }

  // Step 2: Submit OTP, New Password, and Reset Token to /Auth/UpdatePassword
  const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading || isSubmittingRef.current) return

    const cleanOtp = otp.trim().replace(/\s+/g, '')
    if (!cleanOtp) {
      setError('Please enter the 6-digit recovery code sent to your email.')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.')
      return
    }

    isSubmittingRef.current = true
    setIsLoading(true)
    setError('')
    setResendStatus('')

    try {
      const cleanIdentifier = emailId.trim()

      // Pass EmailID, newPassword, and resetToken (as required by the backend /Auth/UpdatePassword)
      const payload = {
        EmailID: cleanIdentifier,
        email: cleanIdentifier,
        username: cleanIdentifier,
        emailId: cleanIdentifier,

        // Password variations
        newPassword: newPassword,
        new_password: newPassword,
        password: newPassword,
        Password: newPassword,
        NewPassword: newPassword,

        // Reset token variations (the backend validator explicitly checks for resetToken)
        resetToken: cleanOtp,
        reset_token: cleanOtp,
        token: cleanOtp,
        ResetToken: cleanOtp,

        // OTP code variations
        OTP: cleanOtp,
        otp: cleanOtp,

        // Confirmation password variations
        confirmPassword: confirmPassword,
        ConfirmPassword: confirmPassword,
      }

      const extraHeaders = {
        'reset-token': cleanOtp,
        'x-reset-token': cleanOtp,
      }

      const endpoints = [
        API_ENDPOINTS.auth.updatePassword,
        `${BASE_URL}/UpdatePassword`,
      ].filter(Boolean)

      await callEndpointCascade(endpoints, payload, extraHeaders)
      setStep('success')
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please check your recovery code and try again.')
    } finally {
      isSubmittingRef.current = false
      setIsLoading(false)
    }
  }

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending || isLoading || isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsResending(true)
    setError('')
    setResendStatus('')

    try {
      const cleanIdentifier = emailId.trim()
      const payload = {
        EmailID: cleanIdentifier,
        email: cleanIdentifier,
        username: cleanIdentifier,
      }

      const endpoints = [
        API_ENDPOINTS.auth.requestPasswordReset,
        `${BASE_URL}/Auth/RequestPasswordReset`,
      ].filter(Boolean)

      await callEndpointCascade(endpoints, payload)
      setResendCountdown(45)
      setResendStatus('A fresh recovery code has been dispatched to your email.')
    } catch (err: any) {
      setError(err?.message || 'Failed to resend recovery code.')
    } finally {
      isSubmittingRef.current = false
      setIsResending(false)
    }
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-sky-50 text-[#0680A6] border border-sky-200">
          <KeyRound className="w-3.5 h-3.5 text-[#0680A6]" />
          Key Recovery
        </span>
      </div>

      {/* Step 1: Request Password Reset */}
      {step === 'request' && (
        <>
          <div className="mb-6 select-none text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082136] tracking-tight leading-tight mb-1">
              Reset Password
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Enter your registered User ID or Email to receive an authentication recovery code.
            </p>
          </div>

          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
                User ID / Email Address
              </label>
              <div className="flex items-center gap-3 h-[48px] px-4 bg-slate-50/70 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-[#42638C] focus-within:ring-2 focus-within:ring-slate-100 rounded-2xl transition-all shadow-2xs">
                <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder="user@company.com or User ID"
                  className="w-full text-slate-800 placeholder-slate-400 outline-none text-xs sm:text-sm bg-transparent font-medium"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold animate-fade-in" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !emailId.trim()}
              className="w-full h-[50px] rounded-full text-white text-xs sm:text-[13px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none shadow-md disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              <span>{isLoading ? 'Sending Code...' : 'Send Recovery Code'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center select-none mt-6 pt-5 border-t border-slate-200/80">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-[#0680A6] hover:text-[#082136] uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </>
      )}

      {/* Step 2: Enter OTP, New Password, and Confirm Password */}
      {step === 'reset' && (
        <>
          <div className="mb-5 select-none text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082136] tracking-tight leading-tight mb-1">
              Reset Your Password
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Enter the recovery code sent to{' '}
              <span className="font-bold text-[#082136] break-all">{emailId}</span> and choose a new password.
            </p>
          </div>

          {infoMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50/80 border border-sky-200/80 text-xs text-sky-800 font-medium mb-3 animate-fade-in">
              <Mail className="w-4 h-4 shrink-0 text-sky-600 mt-0.5" />
              <span className="leading-snug">{infoMessage}</span>
            </div>
          )}

          {resendStatus && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold mb-3 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{resendStatus}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3.5 w-full">
            {/* OTP Code Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center select-none">
                <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  Recovery Code (OTP)
                </label>
                {resendCountdown > 0 ? (
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider">
                    Resend in <span className="text-[#082136]">{resendCountdown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="inline-flex items-center gap-1 text-[#0680A6] hover:text-[#082136] font-bold uppercase tracking-wider text-[10px] sm:text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{isResending ? 'Sending...' : 'Resend Code'}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 h-[48px] px-4 bg-slate-50/70 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-[#42638C] focus-within:ring-2 focus-within:ring-slate-100 rounded-2xl transition-all shadow-2xs">
                <KeyRound className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\s+/g, ''))}
                  placeholder="• • • • • •"
                  maxLength={8}
                  autoFocus
                  autoComplete="one-time-code"
                  className="w-full text-slate-900 placeholder-slate-300 outline-none text-base font-mono font-bold tracking-[0.2em] bg-transparent"
                  required
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                New Password
              </label>
              <div className="flex items-center gap-3 h-[48px] px-4 bg-slate-50/70 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-[#42638C] focus-within:ring-2 focus-within:ring-slate-100 rounded-2xl transition-all shadow-2xs">
                <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-slate-800 placeholder-slate-400 outline-none text-xs sm:text-sm tracking-wider bg-transparent font-medium"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((c) => !c)}
                  className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none shrink-0 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Confirm New Password
              </label>
              <div className="flex items-center gap-3 h-[48px] px-4 bg-slate-50/70 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-[#42638C] focus-within:ring-2 focus-within:ring-slate-100 rounded-2xl transition-all shadow-2xs">
                <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full text-slate-800 placeholder-slate-400 outline-none text-xs sm:text-sm tracking-wider bg-transparent font-medium"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmPassword((c) => !c)}
                  className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none shrink-0 p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5 text-slate-400" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold animate-fade-in" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !otp.trim() || !newPassword || !confirmPassword}
              className="w-full h-[50px] rounded-full text-white text-xs sm:text-[13px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none shadow-md disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              <span>{isLoading ? 'Updating Password...' : 'Update Password & Proceed'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Navigation link back to email request */}
          <div className="text-center select-none mt-4 pt-4 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setStep('request')
                setError('')
                setResendStatus('')
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Email</span>
            </button>
          </div>
        </>
      )}

      {/* Step 3: Success State */}
      {step === 'success' && (
        <div className="flex flex-col items-center text-center py-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 shadow-sm">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082136] tracking-tight leading-tight mb-2">
            Password Updated!
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mb-6">
            Your credentials have been securely updated. You can now access your account with your new password.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="w-full h-[50px] rounded-full text-white text-xs sm:text-[13px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none shadow-md"
          >
            <span>Sign In With New Password</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="flex flex-col items-center justify-center gap-1 select-none text-center mt-6">
        <p className="text-[9px] sm:text-[10px] leading-relaxed text-slate-400 font-bold tracking-wider uppercase">
          Securitas Authorization & Security Node Protected.
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword

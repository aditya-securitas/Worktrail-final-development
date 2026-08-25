import { useState, type FormEvent } from 'react'
import { useAuth } from './useAuth'
import { Link, useNavigate } from 'react-router-dom'

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
    <>
      <div className="form-heading"><span className="form-kicker">Welcome back</span><h2>Sign in to Worktrail</h2><p>Pick up where you left off.</p></div>
      <form onSubmit={handleSubmit}>
        <label>Email ID<div className="input-wrap"><span className="field-icon">@</span><input type="email" value={emailId} onChange={(event) => setEmailId(event.target.value)} placeholder="you@company.com" autoComplete="email" required /></div></label>
        <label>Password<div className="input-wrap"><span className="field-icon">#</span><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="........" autoComplete="current-password" required /><button className="icon-button" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
        <div className="form-options"><span className="session-note">Your session stays active after refresh</span><a href="#forgot">Forgot password?</a></div>
        {error && <p className="error-message" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'} <span aria-hidden="true">-&gt;</span></button>
      </form>
      <div className="mode-switch"><span>New to Worktrail?</span><Link to="/register" onClick={onRegister}>Create an account</Link></div>
    </>
  )
}

export default Login

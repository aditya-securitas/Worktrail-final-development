import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { API_ENDPOINTS } from './endpoint'

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

const emptyForm: RegisterForm = { email: '', firstName: '', lastName: '', companyName: '', companyCode: '', gstNo: '', address: '', city: '', state: '', country: '', zipCode: '', password: '', confirmPassword: '' }

function Register({ onLogin }: RegisterProps) {
  const [accountType, setAccountType] = useState<AccountType>('Contributor')
  const [form, setForm] = useState<RegisterForm>(emptyForm)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateField = (field: keyof RegisterForm, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const handleTypeChange = (type: AccountType) => { setAccountType(type); setError(''); setSuccess('') }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
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
      const result = await fetch(API_ENDPOINTS.auth.register, { method: 'POST', headers: { APIKEY: 'Securitas@#!1234', 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await result.json().catch(() => ({})) as { message?: string }
      if (!result.ok) throw new Error(data.message || `Registration failed (${result.status})`)
      setSuccess(data.message || `${accountType} account created successfully.`)
      setForm(emptyForm)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to the registration service.')
    } finally { setIsLoading(false) }
  }

  const input = (field: keyof RegisterForm, label: string, placeholder = label, required = false) => <label>{label}<div className="input-wrap"><input type="text" value={form[field]} onChange={(event) => updateField(field, event.target.value)} placeholder={placeholder} required={required} /></div></label>

  return <>
    <div className="form-heading"><span className="form-kicker">Start your journey</span><h2>Create your account</h2><p>Choose your account type to get started.</p></div>
    <div className="account-tabs" role="tablist"><button className={accountType === 'Contributor' ? 'account-tab active' : 'account-tab'} type="button" role="tab" aria-selected={accountType === 'Contributor'} onClick={() => handleTypeChange('Contributor')}>Contributor</button><button className={accountType === 'Client' ? 'account-tab active' : 'account-tab'} type="button" role="tab" aria-selected={accountType === 'Client'} onClick={() => handleTypeChange('Client')}>Client</button></div>
    <form onSubmit={handleSubmit}>
      {input('email', 'Email ID', 'you@company.com', true)}
      <div className="form-row">{input('firstName', 'First name', 'First name', true)}{input('lastName', 'Last name', 'Last name', true)}</div>
      {accountType === 'Contributor' && <><div className="form-row">{input('companyName', 'Company name', 'Company name', true)}{input('companyCode', 'Company code')}</div><div className="form-row">{input('gstNo', 'GST number')}{input('address', 'Address')}</div><div className="form-row">{input('city', 'City')}{input('state', 'State')}</div><div className="form-row">{input('country', 'Country')}{input('zipCode', 'ZIP code')}</div></>}
      {input('password', 'Password', 'Password', true)}{input('confirmPassword', 'Confirm password', 'Confirm password', true)}
      {error && <p className="error-message" role="alert">{error}</p>}{success && <p className="success-message" role="status">{success}</p>}
      <button className="primary-button" type="submit" disabled={isLoading}>{isLoading ? 'Creating account...' : `Create ${accountType.toLowerCase()} account`} <span aria-hidden="true">-&gt;</span></button>
    </form>
    <div className="mode-switch"><span>Already a user?</span><Link to="/login" onClick={onLogin}>Sign in</Link></div>
  </>
}

export default Register

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import Dashboard from './Dashboard'
import Home from './Home'
import Login from './Login'
import ProtectedRoute from './ProtectedRoute'
import Register from './Register'
import './App.css'

function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-shell">
    <section className="brand-panel">
      <div className="brand-top"><div className="brand-mark">*</div><span>worktrail</span></div>
      <div className="brand-copy"><p className="eyebrow">Your work, in rhythm</p><h1>Make space for<br /><em>meaningful work.</em></h1><p className="brand-description">A calmer way to plan, focus, and move your best work forward.</p></div>
      <div className="quote-card"><div className="quote-stars">★★★★★</div><p>“Worktrail gives our team the clarity to spend less time coordinating and more time creating.”</p><div className="quote-author"><div className="avatar">AM</div><div><strong>Alex Morgan</strong><span>Design lead, Northstar</span></div></div></div>
      <div className="panel-footer"><span>© 2025 Worktrail</span><span>Simple by design</span></div>
    </section>
    <section className="form-panel"><div className="form-wrap"><div className="mobile-brand"><div className="brand-mark">*</div><span>worktrail</span></div>{children}<div className="legal">By continuing, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</div></div></section>
  </main>
}

function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
    <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
    <Route element={<ProtectedRoute />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/ServiceRequest" element={<Dashboard />} /></Route>
    <Route path="/" element={<Home />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></AuthProvider></BrowserRouter>
}

export default App

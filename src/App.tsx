import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import Dashboard from './Dashboard'
import Home from './Home' 
import Login from './Login'
import ProtectedRoute from './ProtectedRoute'
import Register from './Register'
import bgVideo from './assets/video/this_is_good_change_one_thing.mp4'
import './App.css'

function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="flex flex-col md:flex-row min-h-screen bg-[#F4F7F9]">
    <div className="relative w-full md:w-1/2 lg:w-[55%] flex flex-col justify-between p-8 sm:p-12 md:p-16 overflow-hidden bg-[#031f30] text-white min-h-[360px] md:h-screen md:sticky md:top-0">
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-85 scale-105"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#031f30]/10 to-[#42638C]/35 z-10"></div>
        <div className="absolute inset-0 login-cyber-grid z-15 opacity-50"></div>
      </div>

      <div className="relative z-20 flex items-center gap-3">
        <div className="glass-panel px-6 py-3.5 rounded-xl float-anim">
          <img
            src="https://worktrail.ai/static/images/Walsons-Logo-White.png"
            alt="Walsons Logo"
            className="h-7 object-contain"
          />
        </div>
      </div>

      <div className="relative z-20 mt-auto pt-16 md:pt-0">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-tech tracking-tight leading-tight mt-3 max-w-lg">
          Trust Begins With <br /> Verified Identities
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-md font-sans leading-relaxed">
          Screen smarter, hire confidently, and reduce risk. Background verification built for today's
          digital workforce.
        </p>
      </div>

      <div className="relative z-20 mt-12 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-300 font-tech uppercase tracking-wider glass-panel px-6 py-4 rounded-xl">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#88ffbb] animate-pulse shadow-[0_0_10px_#88ffbb]"></span>
          Node Secured
        </span>
        <span className="text-[10px] text-slate-400">Copyright © Walsons Worktrail 2026</span>
      </div>
    </div>
    <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16">
      <div className="w-full max-w-[440px]">
        {children}
      </div>
    </div>
  </main>
}

function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
    <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
    <Route element={<ProtectedRoute />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/ServiceRequest" element={<Dashboard />} /><Route path="/AddEmployee" element={<Dashboard />} /><Route path="/Client" element={<Dashboard />} /><Route path="/Contributor" element={<Dashboard />} /><Route path="/Termsandconditions" element={<Dashboard />} /><Route path="/Privacypolicy" element={<Dashboard />} /><Route path="/OtherServices" element={<Dashboard />} /></Route>
    <Route path="/" element={<Home />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></AuthProvider></BrowserRouter>
}

export default App

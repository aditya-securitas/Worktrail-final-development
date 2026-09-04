import { useLocation, Link, Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { MenuRoute } from './auth-context'
import { useState, useEffect, useRef } from 'react'
import { checkClientHasRequests } from './client-utils'
import ServiceRequest from './Components/ServiceRequest'
import AddEmployee from './Components/AddEmployee'
import Client from './Components/Client'
import CandidateVerificationForm from './Components/CandidateVerificationForm'
import Contributor from './Components/Contributor'
import OrgMaster from './Components/OrgMaster'
import UserMaster from './Components/Usermaster'
import Recyclebin from './Components/Recyclebin'
import OtherServices from './Components/OtherServices'
import Invoice from './Components/Invoice'
import ConAdminUsermaster from './ContributorAdmin/ConAdminUsermaster'
import ConUserAddEmployee from './ContributorUser/ConUserAddEmployee'
import Navbar from './Components/Navbar'
import Sidebar from './Components/Sidebar'
import { flattenMenu, menuPath } from './Components/sidebar-utils'
import bgVideo from './assets/video/the_element_related_to_BGV.mp4'
import DashboardCards, { type DashboardStats } from './Components/DashboardCards'
import DashboardCharts, {
  TransactionTelemetryChart,
  type ProgressionPoint,
  type ComplianceDistribution
} from './Components/DashboardCharts'
import {
  type VerificationRecord,
  STORAGE_KEY_VERIFICATION_RECORDS
} from './Components/CandidateVerificationForm'
import { Search, Calendar, RefreshCw, CheckCircle2 } from 'lucide-react'

const EXTERNAL_LINKS: Record<string, boolean> = {
  'Privacypolicy.tsx': true,
  'Termsandconditions.tsx': true
}

function MenuComponent({ item }: { item: MenuRoute | undefined }) {
  const { user } = useAuth()
  if (!item) return null
  if (item.components === 'ServiceRequest.tsx') return <ServiceRequest />
  if (item.components === 'ConUserAddEmployee.tsx') return <ConUserAddEmployee />
  if (item.components === 'ConAdminAddEmployee.tsx') return <ConUserAddEmployee />
  if (item.components === 'AddEmployee.tsx') {
    const ut = (user?.Usertype || '').toLowerCase().trim().replace(/[\s_-]+/g, '')
    if (ut === 'contributor' || ut === 'contributoruser' || ut === 'contributoradmin' || ut === 'admincontributor') {
      return <ConUserAddEmployee />
    }
    return <AddEmployee />
  }
  if (item.components === 'Client.tsx') return <Client />
  if (item.components === 'CandidateVerificationForm.tsx') return <CandidateVerificationForm />
  if (item.components === 'Contributor.tsx') return <Contributor />
  if (item.components === 'OrgMaster.tsx') return <OrgMaster />
  if (item.components === 'Usermaster.tsx') return <UserMaster />
  if (item.components === 'Recyclebin.tsx') return <Recyclebin />
  if (item.components === 'OtherServices.tsx') return <OtherServices />
  if (item.components === 'Invoice.tsx') return <Invoice />
  if (item.components === 'ConAdminUsermaster.tsx') return <ConAdminUsermaster />
  return null
}

function Dashboard() {
  const { user, menu, isMenuLoading, menuError } = useAuth()
  const location = useLocation()

  // If user is Client and currently on the /CandidateVerification route, render the verification form
  if (user?.Usertype?.toLowerCase() === 'client' && location.pathname === '/CandidateVerification') {
    return <CandidateVerificationForm />
  }

  // If new client user with 0 requests visits /dashboard, redirect to Candidate Verification form
  if (user?.Usertype?.toLowerCase() === 'client' && location.pathname === '/dashboard') {
    const hasRequests = checkClientHasRequests(user)
    if (!hasRequests) {
      return <Navigate to="/CandidateVerification" replace />
    }
  }

  const [sidebarState, setSidebarState] = useState<'full' | 'mini' | 'closed'>('full')
  const menuItems = flattenMenu(menu)

  const userTypeNorm = (user?.Usertype || '').toLowerCase().trim().replace(/[\s_-]+/g, '')
  const isClientUser = userTypeNorm === 'client'
  const isContributorUser = userTypeNorm.includes('contributor')
  const showComplianceCharts = !isClientUser && !isContributorUser

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [appealSearchQuery, setAppealSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Dynamic records loaded from live verification storage
  const [allRecords, setAllRecords] = useState<VerificationRecord[]>([])

  const loadRecords = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VERIFICATION_RECORDS)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // Filter out any legacy dummy records from localStorage
          const genuineRecords = parsed.filter(
            (r) =>
              !r.id?.startsWith('rec-') &&
              !r.requestId?.startsWith('VR-849') &&
              !r.requestId?.startsWith('VR-732') &&
              !r.requestId?.startsWith('VR-619') &&
              !r.requestId?.startsWith('VR-508') &&
              !r.requestId?.startsWith('VR-381') &&
              !r.requestId?.startsWith('VR-274') &&
              !r.requestId?.startsWith('VR-194')
          )
          if (genuineRecords.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY_VERIFICATION_RECORDS, JSON.stringify(genuineRecords))
          }
          if (user?.Usertype?.toLowerCase() === 'client') {
            const ident = (user?.username || '').toLowerCase().trim()
            const userRecords = genuineRecords.filter((r) => {
              const sub = (r.submittedBy || '').toLowerCase().trim()
              return !ident || sub === ident || sub.includes(ident) || ident.includes(sub)
            })
            setAllRecords(userRecords)
          } else {
            setAllRecords(genuineRecords)
          }
          return
        }
      }
    } catch {
      // ignore
    }

    setAllRecords([])
  }

  useEffect(() => {
    loadRecords()
    const handleStorage = () => loadRecords()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const activeMenuItem = menuItems.find((item) => menuPath(item.Route) === location.pathname)
    if (activeMenuItem && activeMenuItem.components) {
      if (activeMenuItem.components === 'Privacypolicy.tsx') {
        window.open('https://www.securitas.in/about-us/privacy-policy/', '_blank')
        window.location.href = '/dashboard'
      } else if (activeMenuItem.components === 'Termsandconditions.tsx') {
        window.open('https://walsonsverify.com/assets/documents/Terms_and_condition.pdf', '_blank')
        window.location.href = '/dashboard'
      }
    }
  }, [location.pathname, menuItems])

  const getFormattedDateRange = () => {
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`
    }
    return 'Select Date Range'
  }

  const applyPreset = (preset: 'all' | '7days' | '30days') => {
    const today = new Date()
    if (preset === 'all') {
      setStartDate('')
      setEndDate('')
    } else if (preset === '7days') {
      const past = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      setStartDate(past.toISOString().split('T')[0])
      setEndDate(today.toISOString().split('T')[0])
    } else if (preset === '30days') {
      const past = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      setStartDate(past.toISOString().split('T')[0])
      setEndDate(today.toISOString().split('T')[0])
    }
  }

  // Filter records dynamically based on query and date range
  const filteredRecords = allRecords.filter(record => {
    if (appealSearchQuery.trim()) {
      const q = appealSearchQuery.toLowerCase()
      const matchReq = record.requestId?.toLowerCase().includes(q)
      const matchEmp = record.employeeId?.toLowerCase().includes(q)
      const matchName = record.candidateName?.toLowerCase().includes(q)
      const matchOrg = record.verifierName?.toLowerCase().includes(q)
      if (!matchReq && !matchEmp && !matchName && !matchOrg) return false
    }
    if (startDate && record.submittedAt < startDate) return false
    if (endDate && record.submittedAt > endDate) return false
    return true
  })

  // 1. Dynamic Dashboard Stats
  const stats: DashboardStats = {
    totalCases: filteredRecords.length,
    casePending: filteredRecords.filter(r => r.status === 'Pending' || (r.status as any) === 'In Progress').length,
    caseResponded: filteredRecords.filter(r => r.status === 'Verified').length,
    caseRejected: filteredRecords.filter(r => r.status === 'Rejected').length,
    requestsPending: filteredRecords.filter(r => r.status === 'Pending').length,
    requestsResponded: filteredRecords.filter(r => r.status === 'Verified').length,
  }

  // 2. Dynamic Compliance Distribution
  const distribution: ComplianceDistribution = {
    total: filteredRecords.length,
    pending: stats.casePending,
    responded: stats.caseResponded,
    rejected: stats.caseRejected,
  }

  // 3. Dynamic Progression Points based on Timeframe
  const getProgressionData = (): ProgressionPoint[] => {
    if (timeframe === 'daily') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const counts: Record<string, { logged: number; completed: number }> = {}
      days.forEach(d => { counts[d] = { logged: 0, completed: 0 } })

      filteredRecords.forEach(r => {
        const d = new Date(r.submittedAt)
        const dayIdx = (d.getDay() + 6) % 7 // 0 = Mon, 6 = Sun
        const dayName = days[dayIdx]
        if (counts[dayName]) {
          counts[dayName].logged += 1
          if (r.status === 'Verified') {
            counts[dayName].completed += 1
          }
        }
      })

      return days.map(day => ({
        label: day,
        logged: counts[day].logged,
        completed: counts[day].completed
      }))
    } else if (timeframe === 'weekly') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      const counts: Record<string, { logged: number; completed: number }> = {}
      weeks.forEach(w => { counts[w] = { logged: 0, completed: 0 } })

      filteredRecords.forEach(r => {
        const d = new Date(r.submittedAt)
        const dateNum = d.getDate()
        const weekIdx = Math.min(Math.floor((dateNum - 1) / 7), 3)
        const weekName = weeks[weekIdx]
        if (counts[weekName]) {
          counts[weekName].logged += 1
          if (r.status === 'Verified') {
            counts[weekName].completed += 1
          }
        }
      })

      return weeks.map(w => ({
        label: w,
        logged: counts[w].logged,
        completed: counts[w].completed
      }))
    } else {
      // monthly
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const counts: Record<string, { logged: number; completed: number }> = {}
      months.forEach(m => { counts[m] = { logged: 0, completed: 0 } })

      filteredRecords.forEach(r => {
        const d = new Date(r.submittedAt)
        const mIdx = d.getMonth()
        const mName = months[mIdx]
        if (counts[mName]) {
          counts[mName].logged += 1
          if (r.status === 'Verified') {
            counts[mName].completed += 1
          }
        }
      })

      return months.map(m => ({
        label: m,
        logged: counts[m].logged,
        completed: counts[m].completed
      }))
    }
  }

  const progressionData = getProgressionData()

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex font-securitas w-full">
      <Sidebar
        state={sidebarState}
        onClose={() => setSidebarState('closed')}
        userType={user?.Usertype}
        menu={menu}
        isLoading={isMenuLoading}
        error={menuError}
      />
      <section className="flex-1 flex flex-col justify-between min-h-screen bg-[#F8FAFC] p-6 sm:p-8 transition-all duration-300 overflow-x-hidden">
        <div>
          <Navbar sidebarState={sidebarState} onToggleSidebar={() => {
            setSidebarState((prev) => {
              if (prev === 'full') return 'mini'
              if (prev === 'mini') return 'closed'
              return 'full'
            })
          }} />

          {location.pathname === '/dashboard' ? (
            <>
              {/* Success Notification Banner if just submitted */}
              {location.state?.newRequestId && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between text-emerald-900 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900">
                        Candidate Verification Request {location.state.newRequestId} Submitted!
                      </h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Request for <strong>{location.state.candidateName || 'Candidate'}</strong> is now queued as <strong>'Pending'</strong> and shown in the table below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Banner Card */}
              <div className="relative rounded-3xl overflow-hidden bg-[#031f30] text-white p-8 mb-8 shadow-sm flex flex-col items-end justify-between min-h-[220px]">
                {/* Background Video */}
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none opacity-45">
                  <video
                    className="object-fill absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={bgVideo} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-l from-[#031f30] via-[#031f30]/10 to-transparent z-10"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-lg mt-auto flex flex-col items-end">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                    {user?.Usertype?.toLowerCase() === 'client' ? 'CLIENT VERIFICATION PORTAL' : 'WORKTRAIL DASHBOARD'}
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm text-end leading-relaxed mb-6">
                    {user?.Usertype?.toLowerCase() === 'client'
                      ? 'Submit candidate verification requests and monitor live background screening progress in real-time.'
                      : 'Candidate background verification portal. Access compliance audit parameters, telemetry signals, and physical checks.'}
                  </p>
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    {user?.Usertype?.toLowerCase() === 'client' && (
                      <Link to="/Client">
                        <button className="flex items-center gap-2 h-11 px-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs tracking-wider uppercase rounded-full transition-all shadow-sm cursor-pointer select-none">
                          VIEW RAISED REQUESTS
                        </button>
                      </Link>
                    )}
                    <Link
                      to={
                        isClientUser
                          ? '/CandidateVerification'
                          : userTypeNorm.includes('contributoradmin') || userTypeNorm === 'admincontributor'
                          ? '/ConAdminAddEmployee'
                          : '/AddEmployee'
                      }
                    >
                      <button className="flex items-center gap-2.5 h-11 px-6 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase rounded-full transition-all shadow-md cursor-pointer select-none">
                        {isClientUser ? 'NEW VERIFICATION REQUEST' : 'ADD CANDIDATE'}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Six Metrics Cards Component */}
              <DashboardCards userType={user?.Usertype} stats={stats} />

              {/* Switcher Header & Charts Component - Hidden for Client and Contributor roles (Contributor User & Admin) per user request */}
              {showComplianceCharts && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none uppercase">Compliance Analytics</h3>
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest mt-1.5 block">SENTINEL TELEMETRY CHARTS</span>
                    </div>
                    <div className="bg-slate-100 rounded-full p-1 flex gap-1.5 text-xs font-bold text-slate-500">
                      <button
                        type="button"
                        onClick={() => setTimeframe('daily')}
                        className={`px-3.5 py-1.5 rounded-full uppercase cursor-pointer transition-all ${
                          timeframe === 'daily'
                            ? 'bg-[#031f30] text-white shadow-xs'
                            : 'hover:text-slate-800 text-slate-500'
                        }`}
                      >
                        Daily
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimeframe('weekly')}
                        className={`px-3.5 py-1.5 rounded-full uppercase cursor-pointer transition-all ${
                          timeframe === 'weekly'
                            ? 'bg-[#031f30] text-white shadow-xs'
                            : 'hover:text-slate-800 text-slate-500'
                        }`}
                      >
                        Weekly
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimeframe('monthly')}
                        className={`px-3.5 py-1.5 rounded-full uppercase cursor-pointer transition-all ${
                          timeframe === 'monthly'
                            ? 'bg-[#031f30] text-white shadow-xs'
                            : 'hover:text-slate-800 text-slate-500'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>

                  {/* Two Column Charts Component */}
                  <DashboardCharts
                    timeframe={timeframe}
                    progressionData={progressionData}
                    distribution={distribution}
                  />

                  {/* Superadmin Exclusive: Full-Width Transaction & Revenue Telemetry Chart Under Compliance Analytics */}
                  {userTypeNorm === 'superadmin' && (
                    <div className="mt-8">
                      <TransactionTelemetryChart timeframe={timeframe} />
                    </div>
                  )}
                </>
              )}

              {/* Recent Appeals Title & Subtitle */}
              <div className="flex flex-col gap-1 mb-6 mt-8 select-none">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none uppercase">
                  {user?.Usertype?.toLowerCase() === 'client' ? 'Candidate Verification Requests' : 'Recent Appeals'}
                </h3>
                <span className="text-[9px] text-slate-400 font-bold tracking-widest mt-1.5 block">
                  {user?.Usertype?.toLowerCase() === 'client' ? 'LIVE VERIFICATION STATUS & CANDIDATE LOGS' : 'VERIFICATION LOGS & APPEALS ACTION'}
                </span>
              </div>

              {/* Filters Container Card */}
              <div className="w-full bg-white rounded-3xl p-5 mb-6 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border border-slate-100/50">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={appealSearchQuery}
                    onChange={(e) => setAppealSearchQuery(e.target.value)}
                    placeholder="Search by Request ID, employee code..."
                    className="w-full h-11 pl-12 pr-4 bg-slate-50/55 hover:bg-slate-50 border border-slate-200/60 focus:border-[#42638C] focus:bg-white focus:outline-none rounded-2xl text-[13px] placeholder-slate-400 transition-all font-medium"
                  />
                </div>

                {/* Calendar Date picker and Reset */}
                <div className="flex items-center gap-3 relative select-none" ref={datePickerRef}>
                  {/* Toggle Calendar Button */}
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2.5 h-11 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wider uppercase rounded-2xl transition-all cursor-pointer focus:outline-none"
                  >
                    <Calendar className="w-4 h-4 text-[#5850EC]" />
                    <span>{getFormattedDateRange()}</span>
                  </button>

                  {/* Reset Filters button */}
                  {(appealSearchQuery || startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppealSearchQuery("")
                        setStartDate("")
                        setEndDate("")
                      }}
                      className="flex items-center justify-center w-11 h-11 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-all cursor-pointer focus:outline-none"
                      title="Reset filters"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                    </button>
                  )}

                  {/* Dropdown Calendar Menu Popover */}
                  {showDatePicker && (
                    <div className="absolute right-0 top-13 bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 z-50 w-72 flex flex-col gap-4 animate-fade-in">
                      <div>
                        <span className="text-[10px] font-extrabold text-[#4A6B82] tracking-widest uppercase block mb-3">
                          QUICK PRESETS
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => applyPreset('all')}
                            className="py-2 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg uppercase cursor-pointer"
                          >
                            All Time
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset('7days')}
                            className="py-2 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg uppercase cursor-pointer"
                          >
                            7 Days
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset('30days')}
                            className="py-2 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg uppercase cursor-pointer"
                          >
                            30 Days
                          </button>
                        </div>
                      </div>

                      <div className="w-full border-t border-slate-100"></div>

                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-extrabold text-[#4A6B82] tracking-widest uppercase block animate-none">
                          CUSTOM RANGE
                        </span>

                        {/* Start Date */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 focus:border-[#5850EC] rounded-lg text-xs text-slate-800 focus:outline-none transition-all"
                          />
                        </div>

                        {/* End Date */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 focus:border-[#5850EC] rounded-lg text-xs text-slate-800 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Dropdown Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setStartDate("")
                            setEndDate("")
                            setShowDatePicker(false)
                          }}
                          className="py-1.5 px-3 text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className="py-1.5 px-3.5 bg-[#5850EC] hover:bg-[#4f46e5] text-white text-[10px] font-bold uppercase rounded-lg shadow-sm cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Appeals Data Table Card */}
              <div className="w-full bg-white rounded-3xl p-6 shadow-sm overflow-hidden mb-6 border border-slate-100/80">
                <div className="w-full overflow-x-auto">
                  <table className="whitespace-nowrap w-full border-collapse text-left select-text">
                    <thead>
                      <tr className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/85 rounded-2xl border-b border-slate-100">
                        <th className="px-5 pb-5 pt-2">Request ID</th>
                        <th className="px-5 pb-5 pt-2">Candidate & Org</th>
                        <th className="px-5 pb-5 pt-2">Date</th>
                        <th className="px-5 pb-5 pt-2">Employee ID</th>
                        <th className="px-5 pb-5 pt-2">Status</th>
                        <th className="px-5 pb-5 pt-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[13px] text-slate-650 font-semibold bg-white">
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                          <tr key={record.id || record.requestId} className="hover:bg-slate-50 transition-all duration-200 border-b border-slate-100">
                            <td className="px-5 py-4 font-bold text-[#031f30] font-mono">{record.requestId}</td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{record.candidateName}</span>
                                <span className="text-[11px] text-slate-400 font-normal">{record.verifierName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-500 font-medium font-mono">{record.submittedAt}</td>
                            <td className="px-5 py-4 text-slate-600 font-mono">{record.employeeId}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase rounded-full ${
                                record.status === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : record.status === 'Pending' || (record.status as any) === 'In Progress'
                                    ? 'bg-amber-50 text-amber-600'
                                    : record.status === 'Rejected'
                                      ? 'bg-rose-50 text-rose-600'
                                      : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 select-none">
                              <Link
                                to="/Client"
                                className="text-xs font-bold text-[#5850EC] hover:text-[#4f46e5] hover:underline cursor-pointer focus:outline-none"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-slate-400 bg-white select-none">
                            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                            <p className="font-semibold text-xs text-slate-500">
                              {user?.Usertype?.toLowerCase() === 'client' ? 'No candidate verification requests found' : 'No verification appeals found'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">Try resetting the filters or date range.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            (() => {
              const activeMenuItem = menuItems.find((item) => menuPath(item.Route) === location.pathname)
              if (activeMenuItem && activeMenuItem.components && EXTERNAL_LINKS[activeMenuItem.components]) {
                return null
              }
              return <MenuComponent item={activeMenuItem} />
            })()
          )}
        </div>

        {/* Secure Network Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-12 border-t border-slate-100 pt-6">
          <span>WALSONS SECURED NETWORK</span>
          <div className="flex items-center gap-4">
            <Link to="/Privacypolicy" className="hover:underline text-slate-400">PRIVACY POLICY</Link>
            <span>|</span>
            <span>COPYRIGHT © DESIGNED & DEVELOPED BY WALSONSLABS 2026</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Dashboard

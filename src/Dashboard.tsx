import { useLocation, Link } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { MenuRoute } from './auth-context'
import { useState, useEffect, useRef } from 'react'
import ServiceRequest from './Components/ServiceRequest'
import AddEmployee from './Components/AddEmployee'
import Client from './Components/Client'
import Contributor from './Components/Contributor'
// import Privacypolicy from './Components/Privacypolicy' // No longer needed here
import Navbar from './Components/Navbar'
import Sidebar from './Components/Sidebar'
import { flattenMenu, menuPath } from './Components/sidebar-utils'
import bgVideo from './assets/video/the_element_related_to_BGV.mp4'
import DashboardCards from './Components/DashboardCards'
import DashboardCharts from './Components/DashboardCharts'
import { Search, Calendar, RefreshCw } from 'lucide-react'

const EXTERNAL_LINKS: Record<string, boolean> = {
  'Privacypolicy.tsx': true,
  'Termsandconditions.tsx': true
}

function MenuComponent({ item }: { item: MenuRoute | undefined }) {
  // This component will handle external links in Dashboard instead, so only render mapped components here
  if (!item) return null
  if (item.components === 'ServiceRequest.tsx') return <ServiceRequest />
  if (item.components === 'AddEmployee.tsx') return <AddEmployee />
  if (item.components === 'Client.tsx') return <Client />
  if (item.components === 'Contributor.tsx') return <Contributor />
  // Don't use Privacypolicy component anymore, open as external link via Dashboard logic
  return null
}

function Dashboard() {
  const { user, menu, isMenuLoading, menuError } = useAuth()
  const location = useLocation()
  const [sidebarState, setSidebarState] = useState<'full' | 'mini' | 'closed'>('full')
  const menuItems = flattenMenu(menu)

  const [appealSearchQuery, setAppealSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

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

  const MOCK_APPEALS = [
    { requestId: "REQ-001", date: "2026-08-25", employeeCode: "EMP001", status: "Approved" },
    { requestId: "REQ-002", date: "2026-08-26", employeeCode: "EMP002", status: "Pending" },
    { requestId: "REQ-003", date: "2026-08-27", employeeCode: "EMP003", status: "Rejected" },
    { requestId: "REQ-004", date: "2026-08-28", employeeCode: "EMP004", status: "Approved" }
  ]

  const filteredAppeals = MOCK_APPEALS.filter(appeal => {
    if (appealSearchQuery.trim()) {
      const query = appealSearchQuery.toLowerCase()
      const matchesRequest = appeal.requestId.toLowerCase().includes(query)
      const matchesEmp = appeal.employeeCode.toLowerCase().includes(query)
      if (!matchesRequest && !matchesEmp) return false
    }
    if (startDate && appeal.date < startDate) return false
    if (endDate && appeal.date > endDate) return false
    return true
  })


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
              {/* Banner Card */}
              <div className="relative rounded-3xl overflow-hidden bg-[#031f30] text-white p-8 mb-8 shadow-sm flex flex-col items-end justify-between min-h-[220px]">
                {/* Background Video */}
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none opacity-45">
                  <video
                    className="object-fill absolute inset-0 w-full h-full object-cover  mix-blend-overlay"
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
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">WORKTRAIL DASHBOARD</h2>
                  <p className="text-slate-300 text-xs sm:text-sm text-end leading-relaxed mb-6">
                    Candidate background verification portal. Access compliance audit parameters, telemetry signals, and physical checks.
                  </p>
                  <Link to="/AddEmployee">
                    <button className="flex items-center gap-2.5 h-11 px-6 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase rounded-full transition-all shadow-md cursor-pointer select-none">
                      ADD CANDIDATE
                    </button>
                  </Link>
                </div>
              </div>

              {/* Six Metrics Cards Component */}
              <DashboardCards userType={user?.Usertype} />

              {/* Switcher Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none uppercase">Compliance Analytics</h3>
                  <span className="text-[9px] text-slate-400 font-bold tracking-widest mt-1.5 block">SENTINEL TELEMETRY CHARTS</span>
                </div>
                <div className="bg-slate-100 rounded-full p-1 flex gap-1.5 text-xs font-bold text-slate-500">
                  <button className="bg-[#031f30] text-white px-3.5 py-1.5 rounded-full uppercase cursor-pointer">Daily</button>
                  <button className="hover:text-slate-800 px-3.5 py-1.5 uppercase cursor-pointer">Weekly</button>
                  <button className="hover:text-slate-800 px-3.5 py-1.5 uppercase cursor-pointer">Monthly</button>
                </div>
              </div>

              {/* Two Column Charts Component */}
              <DashboardCharts />

              {/* Recent Appeals Title & Subtitle */}
              <div className="flex flex-col gap-1 mb-6 mt-8 select-none">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none uppercase">Recent Appeals</h3>
                <span className="text-[9px] text-slate-400 font-bold tracking-widest mt-1.5 block">VERIFICATION LOGS & APPEALS ACTION</span>
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
                        <th className="px-5 pb-5 pt-2">Date</th>
                        <th className="px-5 pb-5 pt-2">Employee Code</th>
                        <th className="px-5 pb-5 pt-2">Status</th>
                        <th className="px-5 pb-5 pt-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[13px] text-slate-650 font-semibold bg-white">
                      {filteredAppeals.length > 0 ? (
                        filteredAppeals.map((appeal) => (
                          <tr key={appeal.requestId} className="hover:bg-slate-50 transition-all duration-200 border-b border-slate-100">
                            <td className="px-5 py-4 font-bold text-[#031f30] font-mono">{appeal.requestId}</td>
                            <td className="px-5 py-4 text-slate-500 font-medium font-mono">{appeal.date}</td>
                            <td className="px-5 py-4 text-slate-600 font-mono">{appeal.employeeCode}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase rounded-full ${appeal.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-600'
                                : appeal.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-600'
                                  : appeal.status === 'Rejected'
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                {appeal.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 select-none">
                              <button
                                onClick={() => alert(`Reviewing Request ${appeal.requestId}...`)}
                                className="text-xs font-bold text-[#5850EC] hover:text-[#4f46e5] hover:underline cursor-pointer focus:outline-none"
                              >
                                View Detail
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-slate-400 bg-white select-none">
                            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                            <p className="font-semibold text-xs text-slate-500">No recent appeals found</p>
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
            // Only show the MenuComponent if the item is not an external link
            (() => {
              const activeMenuItem = menuItems.find((item) => menuPath(item.Route) === location.pathname)
              // If it's an external link component, render nothing (link handled in effect above)
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

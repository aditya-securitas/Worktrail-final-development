import { useState, useEffect } from 'react'

export interface ProgressionPoint {
  day?: string
  label?: string
  logged: number
  completed: number
}

export interface ComplianceDistribution {
  total: number
  pending: number
  responded: number
  rejected: number
}

interface DashboardChartsProps {
  timeframe?: 'daily' | 'weekly' | 'monthly'
  progressionData?: ProgressionPoint[]
  distribution?: ComplianceDistribution
}

export function DashboardCharts({
  timeframe = 'daily',
  progressionData,
  distribution
}: DashboardChartsProps) {
  const defaultDailyData: ProgressionPoint[] = [
    { label: 'Mon', logged: 0, completed: 0 },
    { label: 'Tue', logged: 0, completed: 0 },
    { label: 'Wed', logged: 0, completed: 0 },
    { label: 'Thu', logged: 0, completed: 0 },
    { label: 'Fri', logged: 0, completed: 0 },
    { label: 'Sat', logged: 0, completed: 0 },
    { label: 'Sun', logged: 0, completed: 0 },
  ]

  const chartData = progressionData && progressionData.length > 0
    ? progressionData.map(d => ({ ...d, label: d.label || d.day || '' }))
    : defaultDailyData

  // Calculate dynamic max value for scaling bar heights
  const maxVal = Math.max(...chartData.map(d => Math.max(d.logged, d.completed)), 1)
  const yTicks = [
    Math.round(maxVal),
    Math.round((maxVal * 2) / 3),
    Math.round(maxVal / 3),
    0
  ]

  // Distribution calculations
  const dist = distribution || {
    total: 0,
    pending: 0,
    responded: 0,
    rejected: 0
  }

  const total = Math.max(dist.total, dist.pending + dist.responded + dist.rejected, 1)
  const respondedPct = (dist.responded / total) * 100
  const pendingPct = (dist.pending / total) * 100
  const rejectedPct = (dist.rejected / total) * 100

  // SVG Circumference: 2 * PI * 38 ≈ 238.76
  const C = 238.76
  const respondedOffset = C - (respondedPct / 100) * C
  const pendingOffset = C - (pendingPct / 100) * C
  const rejectedOffset = C - (rejectedPct / 100) * C

  const respondedRotation = -90
  const pendingRotation = -90 + (respondedPct / 100) * 360
  const rejectedRotation = pendingRotation + (pendingPct / 100) * 360

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Appeals Progression */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            APPEALS & VERIFICATION PROGRESSION
          </span>
          <span className="text-[9px] font-bold text-[#42638C] bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {timeframe.toUpperCase()} METRICS
          </span>
        </div>
        
        {/* Legends */}
        <div className="flex gap-4 justify-center mb-6 text-[11px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#5850EC]"></span>
            <span>Logged Cases</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></span>
            <span>Completed Cases</span>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="relative h-60 flex flex-col justify-between pt-4">
          {/* Grid lines */}
          <div className="absolute inset-x-0 bottom-6 top-4 flex flex-col justify-between pointer-events-none">
            <div className="border-b border-slate-100 w-full h-0"></div>
            <div className="border-b border-slate-100 w-full h-0"></div>
            <div className="border-b border-slate-100 w-full h-0"></div>
            <div className="border-b border-slate-200 w-full h-0"></div>
          </div>

          {/* Y-Axis & Bars */}
          <div className="flex-1 flex items-stretch">
            {/* Y Axis Labels */}
            <div className="w-7 flex flex-col justify-between text-[10px] text-slate-400 font-bold pr-2 pb-6">
              <span>{yTicks[0]}</span>
              <span>{yTicks[1]}</span>
              <span>{yTicks[2]}</span>
              <span>0</span>
            </div>

            {/* Columns Area */}
            <div className="flex-1 flex justify-around items-end pb-6">
              {chartData.map((item, idx) => (
                <div key={item.label || idx} className="flex flex-col items-center gap-2 group">
                  <div className="flex items-end gap-1.5 h-32 relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-1.5 py-0.5 bg-slate-900 text-white text-[9px] rounded font-mono z-20 whitespace-nowrap shadow-md">
                      L:{item.logged} | C:{item.completed}
                    </div>

                    {/* Logged Bar */}
                    <div 
                      style={{ height: `${Math.max((item.logged / maxVal) * 100, 4)}%` }} 
                      className="w-3 bg-[#5850EC] rounded-t transition-all duration-300 group-hover:brightness-110"
                    />
                    {/* Completed Bar */}
                    <div 
                      style={{ height: `${Math.max((item.completed / maxVal) * 100, 4)}%` }} 
                      className="w-3 bg-[#10B981] rounded-t transition-all duration-300 group-hover:brightness-110"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart 2: Compliance Distribution */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">COMPLIANCE DISTRIBUTION</span>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            STATUS BREAKDOWN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Dynamic Donut Chart SVG */}
          <div className="flex flex-col justify-center items-center relative">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="transparent" 
                  stroke="#F1F5F9" 
                  strokeWidth="12" 
                />
                {/* Responded segment (Green) */}
                {dist.responded > 0 && (
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    fill="transparent" 
                    stroke="#10B981" 
                    strokeWidth="12" 
                    strokeDasharray={C} 
                    strokeDashoffset={respondedOffset}
                    transform={`rotate(${respondedRotation} 50 50)`}
                    className="transition-all duration-500"
                  />
                )}
                {/* Pending segment (Orange/Amber) */}
                {dist.pending > 0 && (
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    fill="transparent" 
                    stroke="#F59E0B" 
                    strokeWidth="12" 
                    strokeDasharray={C} 
                    strokeDashoffset={pendingOffset} 
                    transform={`rotate(${pendingRotation} 50 50)`}
                    className="transition-all duration-500"
                  />
                )}
                {/* Rejected segment (Red) */}
                {dist.rejected > 0 && (
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    fill="transparent" 
                    stroke="#EF4444" 
                    strokeWidth="12" 
                    strokeDasharray={C} 
                    strokeDashoffset={rejectedOffset} 
                    transform={`rotate(${rejectedRotation} 50 50)`}
                    className="transition-all duration-500"
                  />
                )}
              </svg>

              {/* Center Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900">{dist.total}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Cases</span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="flex flex-col gap-2.5">
            {[
              { label: 'Total Cases', value: dist.total, pct: '100%', color: 'bg-[#5850EC]' },
              { label: 'Pending', value: dist.pending, pct: `${Math.round(pendingPct)}%`, color: 'bg-[#F59E0B]' },
              { label: 'Responded / Verified', value: dist.responded, pct: `${Math.round(respondedPct)}%`, color: 'bg-[#10B981]' },
              { label: 'Rejected', value: dist.rejected, pct: `${Math.round(rejectedPct)}%`, color: 'bg-[#EF4444]' },
            ].map((legend) => (
              <div key={legend.label} className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3 flex justify-between items-center text-xs font-bold text-slate-600 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${legend.color}`}></span>
                  <span>{legend.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 font-extrabold">{legend.value}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({legend.pct})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface TransactionDataPoint {
  label: string
  revenue: number
  count: number
  paid: number
}

interface TransactionTelemetryChartProps {
  timeframe?: 'daily' | 'weekly' | 'monthly'
}

function computeTelemetryData(timeframe: 'daily' | 'weekly' | 'monthly'): TransactionDataPoint[] {
  let records: any[] = []
  try {
    const stored = localStorage.getItem('worktrail_verification_records')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        records = parsed.filter(
          (r) =>
            !r.id?.startsWith('rec-') &&
            !r.requestId?.startsWith('VR-849') &&
            !r.requestId?.startsWith('VR-732') &&
            !r.requestId?.startsWith('VR-619')
        )
      }
    }
  } catch {
    // ignore
  }

  if (timeframe === 'daily') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const map: Record<string, { revenue: number; count: number; paid: number }> = {}
    days.forEach((d) => { map[d] = { revenue: 0, count: 0, paid: 0 } })

    records.forEach((r) => {
      const d = new Date(r.submittedAt || Date.now())
      const dayIdx = (d.getDay() + 6) % 7
      const dayName = days[dayIdx]
      const amt = r.amount || 1499
      if (map[dayName]) {
        map[dayName].count += 1
        map[dayName].revenue += amt
        if (r.status !== 'Rejected') map[dayName].paid += 1
      }
    })

    return days.map((label) => ({
      label,
      revenue: map[label].revenue,
      count: map[label].count,
      paid: map[label].paid
    }))
  } else if (timeframe === 'weekly') {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    const map: Record<string, { revenue: number; count: number; paid: number }> = {}
    weeks.forEach((w) => { map[w] = { revenue: 0, count: 0, paid: 0 } })

    records.forEach((r) => {
      const d = new Date(r.submittedAt || Date.now())
      const weekIdx = Math.min(Math.floor((d.getDate() - 1) / 7), 3)
      const weekName = weeks[weekIdx]
      const amt = r.amount || 1499
      if (map[weekName]) {
        map[weekName].count += 1
        map[weekName].revenue += amt
        if (r.status !== 'Rejected') map[weekName].paid += 1
      }
    })

    return weeks.map((label) => ({
      label,
      revenue: map[label].revenue,
      count: map[label].count,
      paid: map[label].paid
    }))
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const map: Record<string, { revenue: number; count: number; paid: number }> = {}
    months.forEach((m) => { map[m] = { revenue: 0, count: 0, paid: 0 } })

    records.forEach((r) => {
      const d = new Date(r.submittedAt || Date.now())
      const mIdx = d.getMonth()
      const mName = months[mIdx]
      const amt = r.amount || 1499
      if (map[mName]) {
        map[mName].count += 1
        map[mName].revenue += amt
        if (r.status !== 'Rejected') map[mName].paid += 1
      }
    })

    return months.map((label) => ({
      label,
      revenue: map[label].revenue,
      count: map[label].count,
      paid: map[label].paid
    }))
  }
}

export function TransactionTelemetryChart({ timeframe = 'daily' }: TransactionTelemetryChartProps) {
  const [currentData, setCurrentData] = useState<TransactionDataPoint[]>(() => {
    return computeTelemetryData(timeframe)
  })

  useEffect(() => {
    setCurrentData(computeTelemetryData(timeframe))
    const handleStorage = () => setCurrentData(computeTelemetryData(timeframe))
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [timeframe])
  const maxRevenue = Math.max(...currentData.map(d => d.revenue), 1)
  const totalRevenue = currentData.reduce((acc, d) => acc + d.revenue, 0)
  const totalTransactions = currentData.reduce((acc, d) => acc + d.count, 0)
  const avgTicket = Math.round(totalRevenue / Math.max(totalTransactions, 1))

  const yTicks = [
    `₹${(maxRevenue / 1000).toFixed(0)}k`,
    `₹${((maxRevenue * 2) / 3000).toFixed(0)}k`,
    `₹${(maxRevenue / 3000).toFixed(0)}k`,
    '₹0'
  ]

  return (
    <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow mb-8 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">
              TRANSACTION & REVENUE ANALYTICS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[9px] uppercase tracking-wider border border-emerald-200">
              Superadmin Only
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time multi-gateway inflows, verification settlement telemetry, and invoicing volume.
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 flex flex-col items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Period Volume</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 flex flex-col items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
            <span className="text-sm font-extrabold text-indigo-600 font-mono">
              {totalTransactions} txns
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 flex flex-col items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Ticket</span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono">
              ₹{avgTicket.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Legends */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 text-[11px] font-bold text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-[#0680A6] to-[#10B981]"></span>
            <span>Settled Revenue (₹)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>Transaction Count</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Gateway: <strong className="text-slate-700">Razorpay Auto-Settlement</strong> (99.8% SLA)
        </div>
      </div>

      {/* Full Width Bar Chart Container */}
      <div className="relative h-64 flex flex-col justify-between pt-4">
        {/* Grid lines */}
        <div className="absolute inset-x-0 bottom-6 top-4 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-slate-100 w-full h-0"></div>
          <div className="border-b border-slate-100 w-full h-0"></div>
          <div className="border-b border-slate-100 w-full h-0"></div>
          <div className="border-b border-slate-200 w-full h-0"></div>
        </div>

        {/* Y-Axis & Bars */}
        <div className="flex-1 flex items-stretch">
          {/* Y Axis Labels */}
          <div className="w-12 flex flex-col justify-between text-[10px] text-slate-400 font-mono font-bold pr-2 pb-6">
            <span>{yTicks[0]}</span>
            <span>{yTicks[1]}</span>
            <span>{yTicks[2]}</span>
            <span>{yTicks[3]}</span>
          </div>

          {/* Columns Area */}
          <div className="flex-1 flex justify-around items-end pb-6 gap-2">
            {currentData.map((item, idx) => {
              const heightPct = Math.max((item.revenue / maxRevenue) * 100, 6)
              return (
                <div key={item.label || idx} className="flex-1 flex flex-col items-center gap-2 group max-w-[60px]">
                  <div className="w-full flex items-end justify-center h-40 relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center px-2.5 py-1.5 bg-slate-900 text-white text-[10px] rounded-xl font-mono z-30 whitespace-nowrap shadow-xl border border-slate-700">
                      <span className="font-bold text-emerald-400">₹{item.revenue.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-slate-300">{item.count} orders ({item.paid} paid)</span>
                    </div>

                    {/* Gradient Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[32px] bg-gradient-to-t from-[#0680A6] to-[#10B981] rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-xs relative"
                    >
                      {/* Inner highlight */}
                      <div className="absolute inset-x-1 top-1 h-1 bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold truncate max-w-full">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts


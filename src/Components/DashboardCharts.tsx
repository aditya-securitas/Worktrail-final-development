export function DashboardCharts() {
  const weeklyData = [
    { day: 'Mon', logged: 3, completed: 2 },
    { day: 'Tue', logged: 2, completed: 1 },
    { day: 'Wed', logged: 1, completed: 0 },
    { day: 'Thu', logged: 2, completed: 2 },
    { day: 'Fri', logged: 2, completed: 1 },
    { day: 'Sat', logged: 1, completed: 0 },
    { day: 'Sun', logged: 1, completed: 0 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Appeals Progression */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">APPEALS PROGRESSION</span>
          <span className="text-[9px] font-bold text-[#42638C] bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">METRICS</span>
        </div>
        
        {/* Legends */}
        <div className="flex gap-4 justify-center mb-6 text-[10px] font-bold text-slate-500">
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
            <div className="w-6 flex flex-col justify-between text-[10px] text-slate-400 font-bold pr-2 pb-6">
              <span>3</span>
              <span>2</span>
              <span>1</span>
              <span>0</span>
            </div>

            {/* Columns Area */}
            <div className="flex-1 flex justify-around items-end pb-6">
              {weeklyData.map((item) => (
                <div key={item.day} className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-1.5 h-32">
                    {/* Logged Bar */}
                    <div 
                      style={{ height: `${(item.logged / 3) * 100}%` }} 
                      className="w-2.5 bg-[#5850EC] rounded-t"
                    />
                    {/* Completed Bar */}
                    <div 
                      style={{ height: `${(item.completed / 3) * 100}%` }} 
                      className="w-2.5 bg-[#10B981] rounded-t"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart 2: Compliance Distribution */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">COMPLIANCE DISTRIBUTION</span>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">STATUS BREAKDOWN</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Donut Chart SVG */}
          <div className="flex justify-center items-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="transparent" 
                  stroke="#F1F5F9" 
                  strokeWidth="12" 
                />
                {/* Responded segment (Green, value 6 = 50%) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="transparent" 
                  stroke="#10B981" 
                  strokeWidth="12" 
                  strokeDasharray="238.76" 
                  strokeDashoffset="119.38" 
                />
                {/* Pending segment (Orange, value 4 = 33.33%) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="transparent" 
                  stroke="#F59E0B" 
                  strokeWidth="12" 
                  strokeDasharray="238.76" 
                  strokeDashoffset="39.79" 
                  transform="rotate(180 50 50)"
                />
                {/* Rejected segment (Red, value 2 = 16.67%) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="transparent" 
                  stroke="#EF4444" 
                  strokeWidth="12" 
                  strokeDasharray="238.76" 
                  strokeDashoffset="198.97" 
                  transform="rotate(120 50 50)"
                />
              </svg>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="flex flex-col gap-2">
            {[
              { label: 'Total Logged', value: 12, color: 'bg-[#5850EC]' },
              { label: 'Pending', value: 4, color: 'bg-[#F59E0B]' },
              { label: 'Responded', value: 6, color: 'bg-[#10B981]' },
              { label: 'Rejected', value: 2, color: 'bg-[#EF4444]' },
            ].map((legend) => (
              <div key={legend.label} className="bg-slate-50/60 rounded-xl p-3.5 flex justify-between items-center text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${legend.color}`}></span>
                  <span>{legend.label}</span>
                </div>
                <span className="text-slate-800">{legend.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default DashboardCharts

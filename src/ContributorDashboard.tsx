import { Link } from 'react-router-dom'
import {
  Folder,
  Clock,
  HelpCircle,
  ThumbsUp
} from 'lucide-react'
import bgVideo from './assets/video/the_element_related_to_BGV.mp4'

export default function ContributorDashboard() {
  // Hardcoded card stats for Contributor
  const contributorCards = [
    {
      title: 'TOTAL CASES',
      value: '48',
      sub: 'Database records',
      icon: Folder,
      colorClass: 'text-[#5850EC]',
      barColor: 'bg-[#5850EC]',
      iconBg: 'bg-indigo-50 text-[#5850EC]'
    },
    {
      title: 'CASE PENDING',
      value: '14',
      sub: 'Active running checks',
      icon: Clock,
      colorClass: 'text-orange-500',
      barColor: 'bg-orange-500',
      iconBg: 'bg-orange-50 text-orange-500'
    },
    {
      title: 'REQUESTS PENDING',
      value: '09',
      sub: 'Running queries',
      icon: HelpCircle,
      colorClass: 'text-blue-500',
      barColor: 'bg-blue-500',
      iconBg: 'bg-blue-50 text-blue-500'
    },
    {
      title: 'REQUESTS RESPONDED',
      value: '25',
      sub: 'Completed queries',
      icon: ThumbsUp,
      colorClass: 'text-pink-500',
      barColor: 'bg-pink-500',
      iconBg: 'bg-pink-50 text-pink-500'
    }
  ]

  return (
    <div className="w-full select-text animate-fade-in">
      {/* 1. Video Banner Section */}
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
          <div className="absolute inset-0 bg-gradient-to-l from-[#031f30] via-[#031f30]/40 to-transparent z-10"></div>
        </div>

        {/* Banner Content */}
        <div className="relative z-10 max-w-xl mt-auto flex flex-col items-end">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#10B981] bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full mb-3 shadow-xs">
            CONTRIBUTOR WORKSPACE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-right">
            CONTRIBUTOR VERIFICATION PORTAL
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm text-right leading-relaxed mb-6">
            Review inbound candidate background verification requests, verify employment credentials, and manage service requests.
          </p>
      
        </div>
      </div>

      {/* 2. Hardcoded Metric Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {contributorCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6 flex flex-col transition-all hover:shadow-md"
            >
              {/* Top Accent Color Bar */}
              <div className={`absolute top-0 left-0 right-0 h-[3.5px] ${card.barColor}`} />

              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-slate-600 tracking-widest text-[12px]">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-5">
                <span className={`font-extrabold block text-3xl sm:text-3.5xl ${card.colorClass}`}>
                  {card.value}
                </span>
                <span className="text-slate-500 font-medium mt-1.5 block text-[12px]">
                  {card.sub}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Table Structure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 select-none">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none uppercase">
            Service Requests
          </h3>
          <span className="text-[9px] text-slate-400 font-bold tracking-widest mt-1 block">
            RECENT VERIFICATION QUEUE & ACTIVITY
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 select-none">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">REQUEST ID</th>
                <th className="px-6 py-4">CANDIDATE NAME</th>
                <th className="px-6 py-4">CLIENT NAME</th>
                <th className="px-6 py-4">VERIFICATION TYPE</th>
                <th className="px-6 py-4">DATE</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
           
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

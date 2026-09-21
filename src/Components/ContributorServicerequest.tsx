import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../useAuth'
import {
  ShieldCheck,
  Building2,
  User,
  Layers,
  Sparkles
} from 'lucide-react'

const ContributorServicerequest: React.FC = () => {
  const { user } = useAuth()

  // Verify that the user is Contributor Admin or Contributor User
  const userTypeNorm = (user?.Usertype || '').toLowerCase().trim().replace(/[\s_-]+/g, '')
  const isContributor = userTypeNorm.includes('contributor')

  // Strictly allow only Contributor Admin and Contributor User
  if (!isContributor) {
    return <Navigate to="/dashboard" replace />
  }

  const isContributorAdmin = userTypeNorm.includes('contributoradmin') || userTypeNorm === 'admincontributor'
  const roleDisplayName = isContributorAdmin ? 'Contributor Admin' : 'Contributor User'

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#031f30] text-white p-6 sm:p-8 shadow-sm border border-slate-200/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-[#10B981]">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                {roleDisplayName} Portal
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Contributor Service Requests
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Dedicated service request workspace for {roleDisplayName.toLowerCase()}s. Review, verify, and track candidate credentials and organizational appeals in real-time.
            </p>
          </div>

          {/* Contributor Badge & Info */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">{user?.CompanyName || 'Contributor'}</span>
              <span className="text-white/40">•</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                {roleDisplayName}
              </span>
            </div>
            {user?.CompanyName && (
              <div className="inline-flex items-center gap-2 text-xs text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.CompanyName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-100">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-800">
              Contributor Service Request Workspace
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This page is active and configured exclusively for Contributor Admin and Contributor User accounts.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Secured & Exclusive to Contributor Roles</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContributorServicerequest
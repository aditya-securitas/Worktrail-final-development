import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Eye,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Mail,
  Phone,
  Layers,
  Sparkles
} from 'lucide-react'
import {
  type VerificationRecord,
  STORAGE_KEY_VERIFICATION_RECORDS,
  OrgLogo
} from './CandidateVerificationForm'
import { useAuth } from '../useAuth'

function Client() {
  const { user } = useAuth()
  const isClient = user?.Usertype?.toLowerCase() === 'client'

  const [records, setRecords] = useState<VerificationRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('All')
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Load records from localStorage
  const loadRecords = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VERIFICATION_RECORDS)
      if (stored) {
        const parsed = JSON.parse(stored) as VerificationRecord[]
        if (Array.isArray(parsed)) {
          // Filter out any legacy dummy records from localStorage
          const genuine = parsed.filter(
            (r) =>
              !r.id?.startsWith('rec-') &&
              !r.requestId?.startsWith('VR-849') &&
              !r.requestId?.startsWith('VR-732') &&
              !r.requestId?.startsWith('VR-619') &&
              !r.requestId?.startsWith('VR-502') &&
              !r.requestId?.startsWith('VR-504') &&
              !r.requestId?.startsWith('VR-410') &&
              !r.requestId?.startsWith('VR-392') &&
              !r.requestId?.startsWith('VR-281') &&
              !r.requestId?.startsWith('VR-194')
          )
          if (genuine.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY_VERIFICATION_RECORDS, JSON.stringify(genuine))
          }
          setRecords(genuine)
          return
        }
      }
    } catch (err) {
      console.error('Failed to load verification records', err)
    }
    setRecords([])
  }

  useEffect(() => {
    loadRecords()
  }, [])

  // Update status of a record
  const handleUpdateStatus = (recordId: string, newStatus: VerificationRecord['status']) => {
    setIsUpdatingStatus(true)
    const updated = records.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))
    setRecords(updated)
    localStorage.setItem(STORAGE_KEY_VERIFICATION_RECORDS, JSON.stringify(updated))
    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord({ ...selectedRecord, status: newStatus })
    }
    setTimeout(() => setIsUpdatingStatus(false), 300)
  }

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.verifierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus
    const matchesCompany = selectedCompanyFilter === 'All' || r.verifierName === selectedCompanyFilter

    return matchesSearch && matchesStatus && matchesCompany
  })

  // Metrics
  const totalRequests = records.length
  const pendingRequests = records.filter((r) => r.status === 'Pending').length
  const inProgressRequests = records.filter((r) => r.status === 'In Progress').length
  const verifiedRequests = records.filter((r) => r.status === 'Verified').length
  const rejectedRequests = records.filter((r) => r.status === 'Rejected').length

  const getStatusBadge = (status: VerificationRecord['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Verified
          </span>
        )
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            In Progress
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        )
    }
  }

  const exportCSV = () => {
    const headers = 'Request ID,Candidate Name,Employee ID,Verifier,DOJ,DOL,Designation,Type,Submitted By,Date,Status\n'
    const rows = filteredRecords
      .map(
        (r) =>
          `"${r.requestId}","${r.candidateName}","${r.employeeId}","${r.verifierName}","${r.dateOfJoining}","${r.dateOfLeaving}","${r.designation}","${r.verificationType}","${r.submittedBy}","${r.submittedAt}","${r.status}"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Client_Verification_Records_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full font-securitas space-y-8 animate-fade-in pb-16">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0680A6] block mb-1">
            {isClient ? 'Live Verification Tracking' : 'Verification Records & Compliance'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isClient ? 'Raised Verification Requests' : 'Client Verification Records'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isClient
              ? 'Review all candidate verification requests raised by your organization, track real-time verifier progress, and inspect status reports.'
              : 'Monitor, audit, and process candidate background verification requests submitted across client accounts.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadRecords}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#031f30] hover:bg-[#0680A6] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 2. Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Requests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Requests</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{totalRequests}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">All time submissions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#031f30] flex items-center justify-center shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Pending Review</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{pendingRequests}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Awaiting partner response</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-500">In Progress</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 mt-1">{inProgressRequests}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Under HR verification</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Verified */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Completed & Verified</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{verifiedRequests}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {rejectedRequests} flagged / rejected
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Table Card */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, ID, company, client..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:ring-2 focus:ring-[#0680A6]/10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
              {['All', 'Pending', 'In Progress', 'Verified', 'Rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-[#031f30] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Verifier Company Filter */}
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#0680A6]"
            >
              <option value="All">All Companies</option>
              {Array.from(new Set(records.map((r) => r.verifierName).filter(Boolean))).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Candidate Profile</th>
                <th className="px-6 py-4">Target Verifier</th>
                <th className="px-6 py-4">Tenure & Role</th>
                <th className="px-6 py-4">Submitted By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Request ID */}
                    <td className="px-6 py-4 font-mono font-bold text-[#0680A6]">
                      {rec.requestId}
                    </td>

                    {/* Candidate */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{rec.candidateName}</span>
                        <span className="text-xs text-slate-400 font-mono">ID: {rec.employeeId}</span>
                      </div>
                    </td>

                    {/* Verifier */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{rec.verifierName}</span>
                        <span className="text-[11px] text-slate-400">{rec.verifierCategory}</span>
                      </div>
                    </td>

                    {/* Tenure */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-slate-700">{rec.designation}</span>
                        <span className="text-slate-400">
                          {rec.dateOfJoining} → {rec.dateOfLeaving}
                        </span>
                      </div>
                    </td>

                    {/* Submitted By */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-medium truncate max-w-[150px]">
                          {rec.submittedBy}
                        </span>
                        <span className="text-[11px] text-slate-400">{rec.submittedAt}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(rec.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(rec)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#0680A6] hover:text-white text-slate-700 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="font-semibold text-sm text-slate-600">No verification records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the search keyword or filter options.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0680A6]">
                  Verification Record Detail
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedRecord.candidateName}{' '}
                  <span className="font-mono text-sm text-slate-400">({selectedRecord.requestId})</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto sidebar-scroll text-xs sm:text-sm">
              {/* Target Verifier Info */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <OrgLogo name={selectedRecord.verifierName} className="w-10 h-10" />
                  <div>
                    <h4 className="font-bold text-slate-900">{selectedRecord.verifierName}</h4>
                    <p className="text-xs text-slate-500">
                      Category: {selectedRecord.verifierCategory} • Code: {selectedRecord.verifierCode}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(selectedRecord.status)}</div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidate Name</span>
                  <p className="font-bold text-slate-800">{selectedRecord.candidateName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee ID</span>
                  <p className="font-mono font-bold text-slate-800">{selectedRecord.employeeId}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                  <p className="text-slate-700">{selectedRecord.candidateEmail || 'Not Provided'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</span>
                  <p className="text-slate-700">{selectedRecord.contactNumber || 'Not Provided'}</p>
                </div>
              </div>

              {/* Employment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Joining</span>
                  <p className="font-semibold text-slate-800">{selectedRecord.dateOfJoining}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Leaving</span>
                  <p className="font-semibold text-slate-800">{selectedRecord.dateOfLeaving}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation</span>
                  <p className="text-slate-700">{selectedRecord.designation}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
                  <p className="text-slate-700">{selectedRecord.department}</p>
                </div>
              </div>

              {/* Scope & Remarks */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification Scope</span>
                  <p className="font-medium text-slate-800 mt-0.5">{selectedRecord.verificationType}</p>
                </div>

                {selectedRecord.remarks && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client Remarks</span>
                    <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs mt-1">
                      {selectedRecord.remarks}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submission Audit</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submitted by <strong className="text-slate-700">{selectedRecord.submittedBy}</strong> on{' '}
                    <strong className="text-slate-700">{selectedRecord.submittedAt}</strong>.
                  </p>
                </div>
              </div>

              {/* Status Update Action Bar for Superadmin/Admin */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  Update Verification Status
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRecord.id, 'Verified')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRecord.id, 'In Progress')}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                    Mark as In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRecord.id, 'Rejected')}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Mark as Rejected
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRecord.id, 'Pending')}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reset to Pending
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Client

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Building2,
  User,
  Download,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  X,
  FileSpreadsheet,
  FileCheck,
  Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../useAuth';
import { API_ENDPOINTS } from '../endpoint';
import { type VerificationRecord } from './CandidateVerificationForm';
import { OrgLogo } from './OrgLogo';
export type { FieldVerificationState } from './ServiceRequestReview';

const ServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const roleName = user?.Usertype || 'Facilitator';

  // Role detection: ContributorAdmin and Contributor roles only view verified records with limited columns (no client info)
  const roleLower = (user?.Usertype || '').toLowerCase().trim().replace(/[\s_-]+/g, '');
  const isContributorRole =
    roleLower === 'contributor' ||
    roleLower === 'contributoradmin' ||
    roleLower === 'contributoruser' ||
    roleLower === 'admincontributor' ||
    roleLower.includes('contributor');
  const isClientRole = roleLower === 'client' || roleLower.includes('client');

  // Requests state
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [verifierFilter, setVerifierFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Detail Modal for Contributor role
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<VerificationRecord | null>(null);

  // Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper to extract verified date
  const getVerificationDate = (r: VerificationRecord) => {
    if (r.verifiedDate) return r.verifiedDate;
    if (r.verifiedAt) {
      const d = new Date(r.verifiedAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return r.verifiedAt.split('T')[0] || r.verifiedAt.split(',')[0] || r.verifiedAt;
    }
    return r.submittedAt || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper to extract verified time
  const getVerificationTime = (r: VerificationRecord) => {
    if (r.verifiedTime) return r.verifiedTime;
    if (r.verifiedAt) {
      const d = new Date(r.verifiedAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      const part = r.verifiedAt.split('T')[1] || r.verifiedAt.split(',')[1];
      if (part) return part.slice(0, 5);
    }
    return '11:00 AM';
  };

  // Check for any toast passed via location state
  useEffect(() => {
    if (location.state?.toast) {
      showToast(location.state.toast.text, location.state.toast.type || 'success');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Load records from live database API (ClientEmpData) & local state
  const loadRecords = async () => {
    setLoading(true);
    let apiRecords: VerificationRecord[] = [];
    const clientEmail = (user?.email || user?.Email || user?.username || '').trim();

    // 1. Fetch from ClientEmpData endpoint
    try {
      const targetUrl = API_ENDPOINTS.clientEmpData || 'https://worktrail.ai/api/ClientEmpData';
      let clientEmpList: any[] = [];

      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            APIKEY: 'Securitas@#!1234',
          },
          body: JSON.stringify({
            Clientemail: clientEmail,
            email: clientEmail,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          clientEmpList = Array.isArray(data) ? data : data?.data || data?.candidates || [];
        }
      } catch (postErr) {
        console.warn('ClientEmpData POST query notice in ServiceRequest:', postErr);
      }

      if (!clientEmpList || clientEmpList.length === 0) {
        try {
          const getRes = await fetch(targetUrl, {
            method: 'GET',
            headers: {
              APIKEY: 'Securitas@#!1234',
            },
          });
          if (getRes.ok) {
            const getData = await getRes.json();
            clientEmpList = Array.isArray(getData) ? getData : getData?.data || getData?.candidates || [];
          }
        } catch (getErr) {
          console.warn('ClientEmpData GET query notice in ServiceRequest:', getErr);
        }
      }

      if (Array.isArray(clientEmpList) && clientEmpList.length > 0) {
        const flatList: any[] = [];
        clientEmpList.forEach((item: any, itemIdx: number) => {
          if (Array.isArray(item.candidates) && item.candidates.length > 0) {
            item.candidates.forEach((c: any, cIdx: number) => {
              flatList.push({
                ...item,
                ...c,
                id: c.id || item.id || `req-cand-${itemIdx}-${cIdx}`,
                RequestId: c.RequestId || c.requestId || item.RequestId || item.requestId || item.orderId,
                Contributor: c.Contributor || item.Contributor || item.verifierName,
                Clientemail: c.Clientemail || item.Clientemail || clientEmail,
                verificationType: c.verificationType || item.verificationType,
                status: c.status || item.status || 'Pending',
                created_at: c.created_at || item.created_at,
              });
            });
          } else {
            flatList.push(item);
          }
        });

        const filteredList = isClientRole && clientEmail
          ? flatList.filter((item: any) => {
              const itemClient = (item.Clientemail || item.ClientEmail || item.clientEmail || item.submittedBy || '').trim().toLowerCase();
              return !itemClient || itemClient === clientEmail.toLowerCase();
            })
          : flatList;

        apiRecords = filteredList.map((item: any, idx: number) => {
          const fullName =
            [item.FirstName, item.MiddleName, item.LastName].filter(Boolean).join(' ') ||
            item.candidateName ||
            item.CandidateName ||
            item.name ||
            'Candidate';
          return {
            id: item.id ? String(item.id) : (item.RequestId ? String(item.RequestId) : `client-api-${idx}`),
            requestId: item.RequestId || item.requestId || item.orderId || `VR-2026-${1000 + idx}`,
            candidateName: fullName,
            employeeId: item.EmployeeCode || item.employeeId || item.EmpCode || '—',
            candidateEmail: item.Email || item.candidateEmail || item.email || '',
            contactNumber: item.MobileNo || item.contactNumber || item.mobile || '',
            verifierId: item.OrganizationID ? String(item.OrganizationID) : '1',
            verifierName: item.Contributor || item.verifierName || 'Registered Enterprise',
            verifierCategory: 'Registered Organization',
            verifierCode: `ORG-${item.OrganizationID || '1'}`,
            dateOfJoining: item.DateOfJoining || item.dateOfJoining || '—',
            dateOfLeaving: item.DateOfLeaving || item.dateOfLeaving || 'Present',
            isCurrentlyEmployed: !item.DateOfLeaving || item.DateOfLeaving.toLowerCase() === 'present',
            designation: item.LastPositionHeld || item.designation || item.Designation || '—',
            department: item.Department || item.department || '—',
            verificationType: item.verificationType || item.VerificationType || 'Standard Employment Verification',
            remarks: item.remarks || item.Remarks || 'Client Employment Verification Record',
            uploadedFilesCount: item.LOA ? 1 : (item.uploadedFilesCount || 0),
            submittedBy: item.Clientemail || item.submittedBy || user?.username || 'Client User',
            submittedAt: item.created_at ? item.created_at.split('T')[0] : (item.submittedAt || new Date().toISOString().split('T')[0]),
            status: (item.status as any) || 'Pending',
            amount: item.Amount || item.amount || 1499,
            transactionId: item.TransactionId || item.transactionId,
            paymentId: item.PaymentId || item.paymentId,
            orderId: item.OrderId || item.orderId,
            customFields: item,
            dynamicData: item,
          };
        });
      }
    } catch (apiErr) {
      console.warn('ClientEmpData records fetch notice in ServiceRequest:', apiErr);
    }

    setRecords(apiRecords);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadRecords();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecords();
    showToast(
      isContributorRole
        ? 'Verified records refreshed from repository.'
        : 'Service requests refreshed from repository.',
      'success'
    );
  };

  const handleClearAllRequests = () => {
    if (window.confirm('Are you sure you want to clear all verification service requests? This will remove all entries from the local queue.')) {
      setRecords([]);
      showToast('All service requests have been cleared.', 'info');
    }
  };

  // Open candidate verification review in dedicated separate page (for Facilitator / Admin / Superadmin)
  const handleOpenReview = (record: VerificationRecord) => {
    navigate(`/ServiceRequestReview?id=${encodeURIComponent(record.id || record.requestId)}`, {
      state: { record, recordId: record.id }
    });
  };

  // Options for Admin/Facilitator
  const verifierOptions = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.verifierName) set.add(r.verifierName.trim());
    });
    return Array.from(set).sort();
  }, [records]);

  const verificationTypes = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.verificationType) set.add(r.verificationType.trim());
    });
    return Array.from(set).sort();
  }, [records]);

  // Base records: Contributor / ContributorAdmin ONLY see records after verification (status === 'Verified') and hide downloaded/recycled records
  const baseRecords = useMemo(() => {
    if (isContributorRole) {
      return records.filter((r) => r.status === 'Verified' && !r.isDownloaded && !r.inRecycleBin);
    }
    return records;
  }, [records, isContributorRole]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return baseRecords.filter((r) => {
      if (!isContributorRole) {
        if (statusFilter !== 'All' && r.status !== statusFilter) return false;
        if (verifierFilter !== 'All' && r.verifierName !== verifierFilter) return false;
        if (typeFilter !== 'All' && r.verificationType !== typeFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cand = (r.candidateName || '').toLowerCase();
        const empId = (r.employeeId || '').toLowerCase();
        const reqId = (r.requestId || '').toLowerCase();

        if (isContributorRole) {
          const vDate = getVerificationDate(r).toLowerCase();
          const vTime = getVerificationTime(r).toLowerCase();
          return cand.includes(q) || empId.includes(q) || reqId.includes(q) || vDate.includes(q) || vTime.includes(q);
        }

        const verifier = (r.verifierName || '').toLowerCase();
        const client = (r.submittedBy || '').toLowerCase();

        return (
          cand.includes(q) ||
          reqId.includes(q) ||
          empId.includes(q) ||
          verifier.includes(q) ||
          client.includes(q)
        );
      }
      return true;
    });
  }, [baseRecords, isContributorRole, statusFilter, verifierFilter, typeFilter, searchQuery]);

  // Excel Export
  const handleExportExcel = () => {
    try {
      if (filteredRecords.length === 0) {
        showToast('No records match the criteria to export.', 'info');
        return;
      }

      let rows: any[];
      if (isContributorRole) {
        // ContributorAdmin and Contributor export ONLY Employee ID, Name, Date, and Time of verification (zero client info)
        rows = filteredRecords.map((r, i) => ({
          'S.No': i + 1,
          'Employee ID': r.employeeId,
          'Employee Name': r.candidateName,
          'Verification Date': getVerificationDate(r),
          'Verification Time': getVerificationTime(r),
          'Status': 'Verified'
        }));
      } else {
        rows = filteredRecords.map((r, i) => ({
          'S.No': i + 1,
          'Request ID': r.requestId,
          'Candidate Name': r.candidateName,
          'Employee ID': r.employeeId,
          'Target Verifier': r.verifierName,
          'Designation': r.designation,
          'Department': r.department,
          'Date of Joining': r.dateOfJoining,
          'Date of Leaving': r.dateOfLeaving,
          'Verification Type': r.verificationType,
          'Submitted By (Client)': r.submittedBy,
          'Submission Date': r.submittedAt,
          'Verification Status': r.status,
          'Remarks': r.remarks || ''
        }));
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, isContributorRole ? 'Verified_Employees' : 'Verification_Requests');
      XLSX.writeFile(wb, `${isContributorRole ? 'verified_candidates_report' : 'verification_requests'}_${Date.now()}.xlsx`);
      showToast(`Exported ${filteredRecords.length} records to Excel!`, 'success');
    } catch (err: any) {
      showToast(`Export failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  };

  // Metrics for Admin / Facilitator
  const totalCount = records.length;
  const pendingCount = records.filter((r) => r.status === 'Pending').length;
  const inProgressCount = records.filter((r) => r.status === 'In Progress').length;
  const verifiedCount = records.filter((r) => r.status === 'Verified').length;
  const rejectedCount = records.filter((r) => r.status === 'Rejected').length;

  const getStatusBadge = (status: VerificationRecord['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Verified Clean
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
            In Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Rejected / Discrepancy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Pending Action
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 space-y-6 animate-fade-in font-sans">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all transform animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white shadow-rose-500/20'
              : 'bg-slate-900 text-white shadow-slate-900/20'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-10 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {roleName} Desk
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {isContributorRole ? 'Verified Candidate Registry' : 'Candidate Verification Portal'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              {isContributorRole ? 'Verified Candidate Records' : 'Service Requests & Candidate Verification'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl">
              {isContributorRole
                ? 'Official records after verification. Showing verified Employee ID, Name, and Verification Date & Time.'
                : 'Compare client-submitted verification requests side-by-side with authentic Contributor employee master records. Review each detail with Yes/No verification and custom remarks.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {!isContributorRole && records.length > 0 && (
              <button
                onClick={handleClearAllRequests}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 border border-rose-500/40 text-xs font-bold text-rose-300 hover:text-rose-200 transition-all shadow-sm cursor-pointer"
                title="Clear all requests from local queue"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear Queue</span>
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 border border-slate-600/60 text-xs font-bold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer select-none"
            >
              <Download className="w-4 h-4" />
              <span>{isContributorRole ? 'Export Report' : 'Export Queue'}</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        {isContributorRole ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 pt-6 border-t border-slate-700/60">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Verified Records</span>
                <FileCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-1">{baseRecords.length}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">Candidates with Completed Verification</span>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300 uppercase">Verification Status</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-300 mt-1">100% Certified</div>
              <span className="text-[10px] text-emerald-400/80 mt-1 block">Authenticated by Master Repository</span>
            </div>

            <div className="bg-sky-950/20 border border-sky-500/30 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-300 uppercase">Audit & Security</span>
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-extrabold text-sky-300 mt-1">Secured SLA</div>
              <span className="text-[10px] text-sky-400/80 mt-1 block">Tamper-Proof Verification Log</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-8 pt-6 border-t border-slate-700/60">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Requests</span>
                <FileCheck className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-1">{totalCount}</div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase">Pending</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-300 mt-1">{pendingCount}</div>
            </div>

            <div className="bg-sky-950/20 border border-sky-500/30 rounded-2xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-300 uppercase">In Review</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-extrabold text-sky-300 mt-1">{inProgressCount}</div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300 uppercase">Verified</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-300 mt-1">{verifiedCount}</div>
            </div>

            <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-300 uppercase">Rejected</span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-extrabold text-rose-300 mt-1">{rejectedCount}</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              isContributorRole
                ? "Search by Employee ID, Candidate Name, or Verification Date..."
                : "Search by Request ID, Candidate Name, Employee ID, Verifier, or Client..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isContributorRole ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Records Only
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Action</option>
                <option value="In Progress">In Review</option>
                <option value="Verified">Verified Clean</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span>Verifier:</span>
              <select
                value={verifierFilter}
                onChange={(e) => setVerifierFilter(e.target.value)}
                className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Verifiers</option>
                {verifierOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Types</option>
                {verificationTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. Service Requests / Verified Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading verified records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-700">
              {isContributorRole ? 'No Verified Records Found' : 'No Service Requests Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isContributorRole
                ? 'No candidate records have completed verification yet.'
                : 'No verification requests match your active criteria.'}
            </p>
          </div>
        ) : isContributorRole ? (
          /* ContributorAdmin and Contributor View: ONLY Employee ID, Name, Date, and Time of Verification (NO Client Info) */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Employee Name</th>
                  <th className="py-3.5 px-4">Date of Verification</th>
                  <th className="py-3.5 px-4">Time of Verification</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecords.map((req, idx) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">{idx + 1}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block shadow-2xs">
                        {req.employeeId}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{req.candidateName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{getVerificationDate(req)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{getVerificationTime(req)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Verified
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRecordForModal(req)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Report</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Superadmin / Admin / Facilitator View: Full comparison, client details, and Verify & Review action */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Candidate Information</th>
                  <th className="py-3.5 px-4">Target Verifier</th>
                  <th className="py-3.5 px-4">Claimed Tenure & Role</th>
                  <th className="py-3.5 px-4">Service Type</th>
                  <th className="py-3.5 px-4">Submitted By</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecords.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block shadow-2xs">
                        {req.requestId}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">{req.submittedAt}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{req.candidateName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600">
                          {req.employeeId}
                        </span>
                        {req.candidateEmail && <span className="truncate max-w-[140px]">{req.candidateEmail}</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <OrgLogo name={req.verifierName} className="w-7 h-7 rounded-lg shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{req.verifierName}</span>
                          {req.verifierCategory && (
                            <span className="text-[10px] text-slate-400 font-medium">{req.verifierCategory}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{req.designation || '—'}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {req.dateOfJoining || '—'} &rarr; {req.dateOfLeaving || (req.isCurrentlyEmployed ? 'Present' : '—')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                        {req.verificationType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{req.submittedBy}</div>
                      <div className="text-[10px] text-slate-400">Client Account</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">{getStatusBadge(req.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReview(req)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Verified Record Detail Modal for Contributor / ContributorAdmin (Zero Client Info) */}
      {selectedRecordForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-extrabold uppercase tracking-wider">Candidate Verification Record</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{selectedRecordForModal.candidateName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Verification Certified & Verified</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedRecordForModal.employeeId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Employee Name:</span>
                <span className="font-bold text-slate-900">{selectedRecordForModal.candidateName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Date of Verification:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {getVerificationDate(selectedRecordForModal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Time of Verification:</span>
                <span className="font-semibold text-sky-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  {getVerificationTime(selectedRecordForModal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Verification Status:</span>
                <span className="font-extrabold text-emerald-600 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Clean
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRecordForModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequest;
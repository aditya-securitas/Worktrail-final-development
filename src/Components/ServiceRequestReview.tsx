import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Building2,
  User,
  Briefcase,
  Mail,
  Phone,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  X,
  Check,
  UserCheck,
  ChevronRight,
  Layers,
  FileCheck,
  MessageSquare,
  CheckCheck,
  Scale,
  Building,
  FileText,
  BadgeAlert,
  ArrowRight,
  Eye,
  Download,
  ExternalLink,
  Code,
  FileCode,
  FileSpreadsheet,
  File,
  Search,
  Copy,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../useAuth';
import { API_ENDPOINTS } from '../endpoint';
import { type VerificationRecord } from './CandidateVerificationForm';

// Helper to detect if a value is a media, image, data URI, or document URL
export const isDocumentOrMediaUrl = (val: any): boolean => {
  if (!val || typeof val !== 'string') return false;
  const v = val.trim();
  if (v.startsWith('data:image/') || v.startsWith('data:application/pdf')) return true;
  if (/^https?:\/\//i.test(v)) {
    if (/\.(jpg|jpeg|png|webp|gif|svg|pdf|doc|docx|csv|xlsx)($|\?)/i.test(v)) return true;
    if (v.includes('/uploads/') || v.includes('/documents/') || v.includes('/files/') || v.includes('/loa/') || v.includes('drive.google.com')) return true;
  }
  return false;
};

// Single API endpoint containing both client requests and contributor records
const REVIEW_CLIENT_DATA_API_URL = (API_ENDPOINTS as any).reviewClientData || 'https://worktrail.ai/api/ReviewClientData';

const API_HEADERS = {
  'APIKEY': 'Securitas@#!1234',
  'Content-Type': 'application/json'
};

export interface FieldVerificationState {
  verified: boolean | null; // true = Yes, false = No, null = unselected
  remarks?: string;
  showRemarksInput?: boolean;
}

// Format camelCase / snake_case / PascalCase into Title Case
export const formatFieldLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};

export const getFieldIcon = (key: string) => {
  const k = key.toLowerCase();
  if (k.includes('date') || k.includes('year') || k.includes('time') || k.includes('doj') || k.includes('dol')) return Calendar;
  if (k.includes('email') || k.includes('mail')) return Mail;
  if (k.includes('phone') || k.includes('mobile') || k.includes('contact')) return Phone;
  if (k.includes('emp') || k.includes('code') || k.includes('id') || k.includes('uan') || k.includes('pan') || k.includes('aadhar')) return Building2;
  if (k.includes('role') || k.includes('desig') || k.includes('job') || k.includes('position') || k.includes('title')) return Briefcase;
  if (k.includes('dept') || k.includes('department') || k.includes('division') || k.includes('team')) return Layers;
  if (k.includes('company') || k.includes('org') || k.includes('contributor') || k.includes('verifier')) return Building;
  if (k.includes('loa') || k.includes('doc') || k.includes('file') || k.includes('certificate') || k.includes('attachment')) return FileText;
  if (k.includes('salary') || k.includes('ctc') || k.includes('amount') || k.includes('price') || k.includes('fee')) return Scale;
  if (k.includes('status') || k.includes('rehire') || k.includes('eligible') || k.includes('verified')) return CheckCircle2;
  if (k.includes('behaviour') || k.includes('conduct') || k.includes('police') || k.includes('criminal')) return ShieldCheck;
  if (k.includes('name') || k.includes('father') || k.includes('gender') || k.includes('candidate')) return User;
  return FileCheck;
};

// Build the comparison fields list dynamically from API data
export const getComparisonFields = (clientRec: VerificationRecord, contr: any | null) => {
  const contrFullName = contr
    ? [contr.FirstName, contr.MiddleName, contr.LastName].filter(Boolean).join(' ') || contr.CandidateName || contr.candidateName || ''
    : 'Record Not Found in Contributor DB';

  const standardFields = [
    {
      id: 'candidateName',
      label: 'Candidate Full Name',
      contributorVal: contrFullName || '—',
      clientVal: clientRec.candidateName || '—',
      icon: User,
      isDynamic: false
    },
    {
      id: 'employeeId',
      label: 'Employee Code / ID',
      contributorVal: contr ? String(contr.EmployeeCode || contr.employeeId || contr.EmpCode || '—') : 'Record Not Found',
      clientVal: clientRec.employeeId || '—',
      icon: Building2,
      isDynamic: false
    },
    {
      id: 'designation',
      label: 'Designation / Job Role',
      contributorVal: contr ? String(contr.LastPositionHeld || contr.Designation || contr.designation || 'Not Recorded') : 'Record Not Found',
      clientVal: clientRec.designation || 'Not Provided',
      icon: Briefcase,
      isDynamic: false
    },
    {
      id: 'department',
      label: 'Department',
      contributorVal: contr ? String(contr.Department || contr.department || 'Not Recorded') : 'Record Not Found',
      clientVal: clientRec.department || 'Not Provided',
      icon: Layers,
      isDynamic: false
    },
    {
      id: 'dateOfJoining',
      label: 'Date of Joining (DOJ)',
      contributorVal: contr ? String(contr.DateOfJoining || contr.dateOfJoining || 'Not Recorded') : 'Record Not Found',
      clientVal: clientRec.dateOfJoining || 'Not Provided',
      icon: Calendar,
      isDynamic: false
    },
    {
      id: 'dateOfLeaving',
      label: 'Date of Leaving (DOL)',
      contributorVal: contr ? String(contr.DateOfLeaving || contr.dateOfLeaving || (contr.IsCurrentlyEmployed ? 'Present / Active' : 'Not Recorded')) : 'Record Not Found',
      clientVal: clientRec.dateOfLeaving || (clientRec.isCurrentlyEmployed ? 'Currently Employed' : 'Not Provided'),
      icon: Calendar,
      isDynamic: false
    },
    {
      id: 'employmentType',
      label: 'Employment Status',
      contributorVal: contr ? String(contr.EmploymentType || (contr.IsCurrentlyEmployed ? 'Active' : 'Relieved')) : 'Record Not Found',
      clientVal: clientRec.isCurrentlyEmployed ? 'Currently Employed' : 'Ex-Employee',
      icon: UserCheck,
      isDynamic: false
    },
    {
      id: 'exitFormalities',
      label: 'Exit Formalities & Clearance',
      contributorVal: contr ? String(contr.ExitFormalities || '—') : 'Record Not Found',
      clientVal: clientRec.isCurrentlyEmployed ? 'N/A (Active Employee)' : (clientRec.remarks ? `Client Note: ${clientRec.remarks}` : 'Not Specified'),
      icon: FileCheck,
      isDynamic: false
    },
    {
      id: 'behaviourIssues',
      label: 'Disciplinary / Conduct Record',
      contributorVal: contr ? String(contr.AnyBehaviourIssue || 'None Reported') : 'Record Not Found',
      clientVal: 'No Disciplinary Claims Noted',
      icon: ShieldCheck,
      isDynamic: false
    },
    {
      id: 'eligibilityToRehire',
      label: 'Eligibility to Rehire',
      contributorVal: contr ? String(contr.EligibilityToRehire || '—') : 'Record Not Found',
      clientVal: 'Candidate Claimed',
      icon: CheckCircle2,
      isDynamic: false
    },
    {
      id: 'contactCredentials',
      label: 'Work Email & Contact Details',
      contributorVal: contr ? `${contr.Email || contr.candidateEmail || 'No Email'} | ${contr.MobileNo || contr.contactNumber || 'No Mobile'}` : 'Record Not Found',
      clientVal: `${clientRec.candidateEmail || 'No Email'} | ${clientRec.contactNumber || 'No Mobile'}`,
      icon: Mail,
      isDynamic: false
    }
  ];

  // Ignored internal keys
  const IGNORED_KEYS = new Set([
    'id', 'customfields', 'dynamicdata', 'fieldchecks', 'created_at', 'updated_at',
    'deleted_at', 'inrecyclebin', 'isdownloaded', 'downloadedat', 'downloadedby',
    'verifiedat', 'verifieddate', 'verifiedtime', 'status', 'amount', 'transactionid',
    'paymentid', 'orderid', 'verifierid', 'verifiercode', 'verifiercategory',
    'uploadedfilescount', 'firstname', 'middlename', 'lastname', 'candidatename',
    'employeecode', 'employeeid', 'empcode', 'lastpositionheld', 'designation',
    'department', 'dateofjoining', 'dateofleaving', 'iscurrentlyemployed',
    'employmenttype', 'exitformalities', 'anybehaviourissue', 'eligibilitytorehire',
    'email', 'candidateemail', 'mobileno', 'contactnumber', 'mobile',
    'remarks', 'clientemail', 'submittedby', 'submittedat', 'requestid',
    'contributor', 'verifiername', 'verificationtype'
  ]);

  // Aggregate all raw data objects from client and contributor
  const clientRaw: Record<string, any> = {
    ...(clientRec.customFields || {}),
    ...(clientRec.dynamicData || {}),
    ...clientRec,
  };

  const contrRaw: Record<string, any> = {
    ...(contr?.customFields || {}),
    ...(contr?.dynamicData || {}),
    ...(contr || {}),
  };

  const allDynamicKeys = new Set<string>();
  Object.keys(clientRaw).forEach((k) => {
    if (!IGNORED_KEYS.has(k.toLowerCase()) && typeof clientRaw[k] !== 'object' && clientRaw[k] !== undefined) {
      allDynamicKeys.add(k);
    }
  });
  Object.keys(contrRaw).forEach((k) => {
    if (!IGNORED_KEYS.has(k.toLowerCase()) && typeof contrRaw[k] !== 'object' && contrRaw[k] !== undefined) {
      allDynamicKeys.add(k);
    }
  });

  const dynamicFields = Array.from(allDynamicKeys).map((key) => {
    const cVal = clientRaw[key] != null && clientRaw[key] !== '' ? String(clientRaw[key]) : '—';
    const rVal = contrRaw[key] != null && contrRaw[key] !== '' ? String(contrRaw[key]) : 'Record Not Found';
    return {
      id: key,
      label: formatFieldLabel(key),
      contributorVal: rVal,
      clientVal: cVal,
      icon: getFieldIcon(key),
      isDynamic: true
    };
  });

  return [...standardFields, ...dynamicFields];
};

const ServiceRequestReview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const roleName = user?.Usertype || 'Facilitator';

  const roleLower = (user?.Usertype || '').toLowerCase().trim().replace(/[\s_-]+/g, '');
  const isContributorRole =
    roleLower === 'contributor' ||
    roleLower === 'contributoradmin' ||
    roleLower === 'contributoruser' ||
    roleLower === 'admincontributor' ||
    roleLower.includes('contributor');

  useEffect(() => {
    if (isContributorRole) {
      navigate('/ServiceRequest', { replace: true });
    }
  }, [isContributorRole, navigate]);

  // Request ID from query param or state
  const initialId =
    searchParams.get('id') ||
    searchParams.get('requestId') ||
    (location.state as any)?.recordId ||
    (location.state as any)?.record?.id ||
    (location.state as any)?.record?.requestId ||
    '';

  const [selectedRecordId, setSelectedRecordId] = useState<string>(initialId);
  const [inputRecordId, setInputRecordId] = useState<string>(initialId);

  // Active record state
  const [record, setRecord] = useState<VerificationRecord | null>(
    (location.state as any)?.record || null
  );
  const [loadingRecord, setLoadingRecord] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Raw API response stored in component state
  const [rawApiResponse, setRawApiResponse] = useState<any | null>(null);
  const [fetchTimestamp, setFetchTimestamp] = useState<string | null>(null);
  const [fetchHttpStatus, setFetchHttpStatus] = useState<number | null>(null);

  // Contributor verification state
  const [contributorData, setContributorData] = useState<any | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Document preview modal state
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('Document Preview');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'comparison' | 'jsonView' | 'dynamicRaw'>('comparison');
  const [showQuickJson, setShowQuickJson] = useState<boolean>(false);

  // Field-by-Field Verification State
  const [fieldChecks, setFieldChecks] = useState<Record<string, FieldVerificationState>>({});
  const [actionStatus, setActionStatus] = useState<VerificationRecord['status']>('Pending');
  const [overallRemarks, setOverallRemarks] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Toast state
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopyJson = (data: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      showToast('Formatted JSON response copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy JSON to clipboard', 'error');
    }
  };

  const handleDownloadJson = (data: any, id: string) => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `api_response_${id || 'record'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('API response JSON downloaded successfully!', 'success');
    } catch {
      showToast('Failed to download JSON file', 'error');
    }
  };

  // Helper to render syntax-highlighted JSON with line numbers
  const renderFormattedJson = (jsonObj: any): React.ReactNode => {
    if (jsonObj === undefined || jsonObj === null) {
      return <span className="text-rose-400 font-mono italic">null</span>;
    }
    const jsonStr = typeof jsonObj === 'string' ? jsonObj : JSON.stringify(jsonObj, null, 2);
    const lines = jsonStr.split('\n');

    return (
      <div className="font-mono text-xs leading-relaxed select-text">
        {lines.map((line, idx) => {
          const keyMatch = line.match(/^(\s*)(".*?")(\s*:\s*)(.*)$/);
          if (keyMatch) {
            const [, indent, key, colon, rest] = keyMatch;
            let valElement: React.ReactNode = rest;
            const trimmedVal = rest.trim();

            if (trimmedVal.startsWith('"')) {
              valElement = <span className="text-emerald-300">{rest}</span>;
            } else if (trimmedVal === 'true' || trimmedVal === 'false') {
              valElement = <span className="text-amber-400 font-bold">{rest}</span>;
            } else if (trimmedVal === 'null') {
              valElement = <span className="text-rose-400 italic">{rest}</span>;
            } else if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?,?$/.test(trimmedVal)) {
              valElement = <span className="text-indigo-300 font-bold">{rest}</span>;
            } else {
              valElement = <span className="text-slate-200">{rest}</span>;
            }

            return (
              <div key={idx} className="flex hover:bg-slate-900/70 px-2 py-0.5 rounded transition-colors group">
                <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-4 font-mono text-[11px] group-hover:text-slate-400">
                  {idx + 1}
                </span>
                <span className="flex-1 whitespace-pre">
                  {indent}
                  <span className="text-sky-300 font-semibold">{key}</span>
                  <span className="text-slate-400">{colon}</span>
                  {valElement}
                </span>
              </div>
            );
          }

          return (
            <div key={idx} className="flex hover:bg-slate-900/70 px-2 py-0.5 rounded transition-colors group">
              <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-4 font-mono text-[11px] group-hover:text-slate-400">
                {idx + 1}
              </span>
              <span className="flex-1 whitespace-pre text-slate-400">{line}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Dedicated sub-renderer for the Raw API Response Formatted JSON view
  const renderRawJsonResponseView = () => (
    <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-5 sm:p-7 text-white space-y-5 animate-in fade-in duration-200">
      {/* JSON Viewer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-mono font-black text-base shrink-0 shadow-inner">
            {'{ }'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-slate-100 flex items-center gap-2">
                Raw API Response Data
              </h3>
              {fetchHttpStatus && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HTTP {fetchHttpStatus} OK
                </span>
              )}
              {fetchTimestamp && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
                  Fetched at {fetchTimestamp}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Live response returned by <span className="font-mono text-indigo-400">https://worktrail.ai/api/ReviewClientData</span> for Record ID: <span className="font-mono font-bold text-emerald-400">{selectedRecordId || record?.requestId || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleCopyJson(rawApiResponse)}
            disabled={!rawApiResponse}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Copy entire formatted JSON to clipboard"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy JSON</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadJson(rawApiResponse, selectedRecordId || record?.requestId || 'record')}
            disabled={!rawApiResponse}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Download API response as JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fetchDataForRecord(selectedRecordId)}
            disabled={loadingRecord}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 text-xs font-bold border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
            title="Re-fetch record from API endpoint"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loadingRecord ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{loadingRecord ? 'Fetching...' : 'Re-fetch'}</span>
          </button>
        </div>
      </div>

      {/* Response Metadata Statistics Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Payload Size</div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">
              {rawApiResponse ? `${(new Blob([JSON.stringify(rawApiResponse)]).size / 1024).toFixed(2)} KB` : '0 KB'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Response Type</div>
            <div className="font-mono font-bold text-slate-200 mt-0.5 truncate">
              {Array.isArray(rawApiResponse) ? `Array (${rawApiResponse.length} items)` : typeof rawApiResponse}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Properties</div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">
              {rawApiResponse && typeof rawApiResponse === 'object'
                ? Array.isArray(rawApiResponse)
                  ? `${rawApiResponse.length} Records`
                  : `${Object.keys(rawApiResponse).length} Root Keys`
                : '0'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Status Code</div>
            <div className="font-mono font-bold text-emerald-400 mt-0.5">
              {fetchHttpStatus ? `${fetchHttpStatus} OK` : 'Loaded'}
            </div>
          </div>
        </div>
      </div>

      {/* Code Container with Syntax Highlighting */}
      <div className="relative rounded-2xl bg-[#090D16] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-slate-300 font-bold ml-2">response.json</span>
          </span>
          <span>application/json • utf-8</span>
        </div>

        {loadingRecord ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400 font-sans">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs font-semibold">Retrieving raw JSON payload from API...</p>
            <p className="text-[11px] font-mono text-slate-500">Endpoint: https://worktrail.ai/api/ReviewClientData</p>
          </div>
        ) : rawApiResponse ? (
          <div className="p-4 overflow-x-auto max-h-[620px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            {renderFormattedJson(rawApiResponse)}
          </div>
        ) : (
          <div className="p-14 text-center text-slate-500 font-mono text-xs">
            No API response data available yet. Please select or search a Record ID.
          </div>
        )}
      </div>
    </div>
  );

  const handleSearchRecord = (idToFetch: string) => {
    const trimmed = idToFetch.trim();
    if (!trimmed) return;
    setSelectedRecordId(trimmed);
    setSearchParams({ id: trimmed });
  };

  // Detect dynamic LOA or Document in record / contributor data
  const detectedDoc = useMemo(() => {
    if (!record) return null;
    const raw: any = {
      ...(record.customFields || {}),
      ...(record.dynamicData || {}),
      ...record,
      ...(contributorData?.customFields || {}),
      ...(contributorData?.dynamicData || {}),
      ...(contributorData || {})
    };
    const val = raw.LOA || raw.loa || raw.document || raw.Document || raw.attachment || raw.Attachment || raw.file || raw.fileUrl || raw.LOA_URL;
    if (val && typeof val === 'string' && val.trim().length > 0) {
      return {
        url: val.trim(),
        title: `${record.candidateName} - Letter of Authorization / Verification Document`
      };
    }
    return null;
  }, [record, contributorData]);

  // Initialize field checks with smart auto-matching
  const initializeFieldChecks = useCallback((clientRec: VerificationRecord, contr: any | null) => {
    const fields = getComparisonFields(clientRec, contr);
    const initialChecks: Record<string, FieldVerificationState> = {};

    fields.forEach((f) => {
      let autoMatch: boolean | null = null;

      if (contr) {
        if (f.id === 'employeeId') {
          const cCode = String(clientRec.employeeId || '').trim().toLowerCase();
          const rCode = String(contr.EmployeeCode || contr.employeeId || contr.EmpCode || '').trim().toLowerCase();
          autoMatch = cCode && rCode && (rCode === cCode);
        } else if (f.id === 'candidateName') {
          const cName = String(clientRec.candidateName || '').toLowerCase().trim();
          const rName = `${contr.FirstName || ''} ${contr.LastName || ''}`.toLowerCase().trim() || String(contr.candidateName || '').toLowerCase().trim();
          autoMatch = cName.includes(rName) || rName.includes(cName) || cName.split(' ')[0] === rName.split(' ')[0];
        } else if (f.id === 'dateOfJoining') {
          const cDoj = String(clientRec.dateOfJoining || '').trim();
          const rDoj = String(contr.DateOfJoining || contr.dateOfJoining || '').trim();
          autoMatch = cDoj === rDoj;
        } else if (f.id === 'designation') {
          const cDes = String(clientRec.designation || '').toLowerCase().trim();
          const rDes = String(contr.LastPositionHeld || contr.Designation || contr.designation || '').toLowerCase().trim();
          autoMatch = cDes.includes(rDes) || rDes.includes(cDes);
        } else if (f.id === 'eligibilityToRehire') {
          autoMatch = String(contr.EligibilityToRehire || '').toLowerCase().startsWith('y');
        } else if (f.id === 'behaviourIssues') {
          autoMatch =
            String(contr.AnyBehaviourIssue || '').toLowerCase() === 'none' ||
            !contr.AnyBehaviourIssue;
        } else {
          autoMatch = true;
        }
      } else {
        autoMatch = false;
      }

      initialChecks[f.id] = {
        verified: autoMatch
      };
    });

    setFieldChecks(initialChecks);
  }, []);

  // Fetch contributor data to cross-check from the single clientEmpData API
  const fetchContributorMasterData = useCallback(async (rec: VerificationRecord) => {
    setDataLoading(true);
    setContributorData(null);

    // 1. Direct inspection: If contributor data is already passed in raw API data / dynamic payload
    const rawData = (rec.dynamicData || rec.customFields || rec) as Record<string, any>;
    if (
      rawData &&
      (rawData.EmployeeCode || rawData.LastPositionHeld || rawData.DateOfJoining || rawData.Department || rawData.Contributor)
    ) {
      setContributorData(rawData);
      initializeFieldChecks(rec, rawData);
      setDataLoading(false);
      return;
    }

    let matchFound: any = null;

    // 2. Query single ReviewClientData API endpoint
    try {
      const res = await fetch(REVIEW_CLIENT_DATA_API_URL, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
          EmployeeCode: (rec.employeeId || '').trim(),
          requestId: rec.requestId || rec.id || '',
          Clientemail: (rec.submittedBy || '').trim(),
        })
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || data?.candidates || [];
        if (Array.isArray(list) && list.length > 0) {
          matchFound = list[0];
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          matchFound = data.data || data;
        }
      }
    } catch {
      // ignore
    }

    if (!matchFound) {
      try {
        const postAllRes = await fetch(REVIEW_CLIENT_DATA_API_URL, {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify({}),
        });
        if (postAllRes.ok) {
          const allData = await postAllRes.json();
          const list = Array.isArray(allData) ? allData : allData?.data || allData?.candidates || [];
          if (Array.isArray(list) && list.length > 0) {
            const qCode = (rec.employeeId || '').toLowerCase().trim();
            const qName = (rec.candidateName || '').toLowerCase().trim();
            const qReq = (rec.requestId || rec.id || '').toLowerCase().trim();

            matchFound = list.find((row: any) => {
              const rCode = String(row.EmployeeCode || row.employeeId || '').toLowerCase().trim();
              const rReq = String(row.RequestId || row.requestId || row.id || '').toLowerCase().trim();
              const rName = `${row.FirstName || ''} ${row.LastName || ''}`.toLowerCase().trim() || String(row.candidateName || '').toLowerCase().trim();
              return (
                (qReq && rReq === qReq) ||
                (qCode && qCode !== '—' && rCode === qCode) ||
                (qName && (rName.includes(qName) || qName.includes(rName)))
              );
            });
          }
        }
      } catch {
        // ignore
      }
    }

    const finalMatch = matchFound || rawData || null;
    setContributorData(finalMatch);
    initializeFieldChecks(rec, finalMatch);
    setDataLoading(false);
  }, [initializeFieldChecks]);

  // Primary fetch function: fetches data on mount or when specific record ID changes
  const fetchDataForRecord = useCallback(async (targetId: string) => {
    setLoadingRecord(true);
    setFetchError(null);

    const clientEmail = (user?.email || user?.Email || user?.username || '').trim();

    try {
      // 1. Query ReviewClientData API endpoint
      const res = await fetch(REVIEW_CLIENT_DATA_API_URL, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
          Clientemail: clientEmail,
          requestId: targetId || '',
          id: targetId || '',
          EmployeeCode: targetId || '',
        }),
      });

      if (!res.ok) {
        throw new Error(`API server responded with HTTP ${res.status}: ${res.statusText || 'Server Error'}`);
      }

      const data = await res.json();

      // Store the raw API response in component state
      setRawApiResponse(data);
      setFetchHttpStatus(res.status);
      setFetchTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      let apiCandidates: any[] = Array.isArray(data) ? data : data?.data || data?.candidates || [];

      // If empty candidates list returned from filtered POST, query fallback to list all
      if (apiCandidates.length === 0) {
        try {
          const postAllRes = await fetch(REVIEW_CLIENT_DATA_API_URL, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({}),
          });
          if (postAllRes.ok) {
            const allData = await postAllRes.json();
            const fallbackList = Array.isArray(allData) ? allData : allData?.data || allData?.candidates || [];
            if (Array.isArray(fallbackList) && fallbackList.length > 0) {
              apiCandidates = fallbackList;
              if (!data || (Array.isArray(data) && data.length === 0)) {
                setRawApiResponse(allData);
              }
            }
          }
        } catch (fallbackErr) {
          console.warn('Fallback ReviewClientData notice:', fallbackErr);
        }
      }

      let matchedItem: any = null;
      if (Array.isArray(apiCandidates) && apiCandidates.length > 0) {
        if (targetId) {
          const q = targetId.toLowerCase().trim();
          matchedItem = apiCandidates.find(
            (item: any, idx: number) =>
              String(item.id || '').toLowerCase() === q ||
              String(item.RequestId || item.requestId || '').toLowerCase() === q ||
              String(item.EmployeeCode || item.employeeId || '').toLowerCase() === q ||
              `vr-2026-${1000 + idx}` === q
          ) || apiCandidates[0];
        } else {
          matchedItem = apiCandidates[0];
        }
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        matchedItem = data.data || data;
      }

      if (!matchedItem) {
        if ((location.state as any)?.record) {
          const fallback = (location.state as any).record;
          setRecord(fallback);
          setActionStatus(fallback.status || 'Pending');
          setOverallRemarks(fallback.remarks || '');
          fetchContributorMasterData(fallback);
        } else {
          throw new Error(`Record with ID "${targetId || 'default'}" could not be found in API response.`);
        }
        return;
      }

      const fullName =
        [matchedItem.FirstName, matchedItem.MiddleName, matchedItem.LastName].filter(Boolean).join(' ') ||
        matchedItem.candidateName ||
        matchedItem.CandidateName ||
        'Candidate';

      const mappedRecord: VerificationRecord = {
        id: matchedItem.id ? String(matchedItem.id) : (matchedItem.RequestId || `api-${targetId || '1'}`),
        requestId: matchedItem.RequestId || matchedItem.requestId || targetId || 'VR-2026-1001',
        candidateName: fullName,
        employeeId: matchedItem.EmployeeCode || matchedItem.employeeId || '—',
        candidateEmail: matchedItem.Email || matchedItem.candidateEmail || '',
        contactNumber: matchedItem.MobileNo || matchedItem.contactNumber || '',
        verifierId: matchedItem.OrganizationID ? String(matchedItem.OrganizationID) : '1',
        verifierName: matchedItem.Contributor || matchedItem.verifierName || 'Registered Enterprise',
        verifierCategory: 'Registered Organization',
        verifierCode: `ORG-${matchedItem.OrganizationID || '1'}`,
        dateOfJoining: matchedItem.DateOfJoining || '—',
        dateOfLeaving: matchedItem.DateOfLeaving || 'Present',
        isCurrentlyEmployed: !matchedItem.DateOfLeaving || matchedItem.DateOfLeaving.toLowerCase() === 'present',
        designation: matchedItem.LastPositionHeld || matchedItem.designation || '—',
        department: matchedItem.Department || matchedItem.department || '—',
        verificationType: matchedItem.verificationType || 'Standard Employment Verification',
        remarks: matchedItem.remarks || 'Client Database Record',
        uploadedFilesCount: matchedItem.LOA ? 1 : 0,
        submittedBy: matchedItem.Clientemail || matchedItem.submittedBy || user?.username || 'Client User',
        submittedAt: matchedItem.created_at ? matchedItem.created_at.split('T')[0] : (matchedItem.submittedAt || new Date().toISOString().split('T')[0]),
        status: (matchedItem.status as any) || 'Pending',
        amount: matchedItem.Amount || matchedItem.amount || 1499,
        transactionId: matchedItem.TransactionId || matchedItem.transactionId,
        paymentId: matchedItem.PaymentId || matchedItem.paymentId,
        orderId: matchedItem.OrderId || matchedItem.orderId,
        customFields: matchedItem,
        dynamicData: matchedItem,
      };

      setRecord(mappedRecord);
      setActionStatus(mappedRecord.status);
      setOverallRemarks(mappedRecord.remarks || '');
      fetchContributorMasterData(mappedRecord);
      setFetchError(null);
    } catch (err: any) {
      console.error('Fetch error in ServiceRequestReview:', err);
      setFetchError(err?.message || 'Failed to fetch record from the verification API.');
      if ((location.state as any)?.record && !record) {
        const fallback = (location.state as any).record;
        setRecord(fallback);
        setActionStatus(fallback.status || 'Pending');
        setOverallRemarks(fallback.remarks || '');
        fetchContributorMasterData(fallback);
      }
    } finally {
      setLoadingRecord(false);
    }
  }, [user, location.state, fetchContributorMasterData]);

  // Sync state if URL query params change
  useEffect(() => {
    const urlId = searchParams.get('id') || searchParams.get('requestId') || '';
    if (urlId && urlId !== selectedRecordId) {
      setSelectedRecordId(urlId);
      setInputRecordId(urlId);
    }
  }, [searchParams]);

  // Fetch data when mounted or when a specific record ID changes
  useEffect(() => {
    fetchDataForRecord(selectedRecordId);
  }, [selectedRecordId, fetchDataForRecord]);

  // Handle single field checkbox toggle (Yes / No)
  const handleToggleFieldVerification = (fieldId: string, value: boolean) => {
    setFieldChecks((prev) => {
      const current = prev[fieldId] || { verified: null };
      const nextVerified = current.verified === value ? null : value;
      return {
        ...prev,
        [fieldId]: {
          verified: nextVerified
        }
      };
    });
  };

  // Quick Action: Mark all fields as Yes
  const handleMarkAllYes = () => {
    if (!record) return;
    const fields = getComparisonFields(record, contributorData);
    const updated: Record<string, FieldVerificationState> = {};
    fields.forEach((f) => {
      updated[f.id] = {
        verified: true
      };
    });
    setFieldChecks(updated);
    setActionStatus('Verified');
    showToast('All fields marked as YES (Verified). Verdict set to Verified Clean.', 'info');
  };

  // Save Final Verification Decision via POST
  const handleSaveVerification = async () => {
    if (!record) return;
    setIsUpdating(true);

    try {
      const totalFields = Object.keys(fieldChecks).length;
      const yesCount = Object.values(fieldChecks).filter((f) => f.verified === true).length;
      const finalRemarks = overallRemarks.trim() || record.remarks || '';

      const now = new Date();
      const verifiedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const verifiedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      const payload = {
        id: record.id,
        requestId: record.requestId,
        status: actionStatus,
        remarks: finalRemarks,
        verifiedAt: now.toISOString(),
        verifiedDate,
        verifiedTime,
        verifiedBy: user?.username || user?.Email || user?.email || 'Facilitator',
        fieldChecks,
        Clientemail: record.submittedBy || '',
        EmployeeCode: record.employeeId || '',
      };

      try {
        await fetch(REVIEW_CLIENT_DATA_API_URL, {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify(payload),
        });
      } catch (postErr) {
        console.warn('POST ReviewClientData save notice:', postErr);
      }

      const updatedRecord = {
        ...record,
        status: actionStatus,
        remarks: finalRemarks,
        verifiedAt: now.toISOString(),
        verifiedDate,
        verifiedTime
      };
      setRecord(updatedRecord);

      showToast(
        `Service Request ${record.requestId} verified (${yesCount}/${totalFields} fields Matched)!`,
        'success'
      );

      // Navigate smoothly back to /ServiceRequest after short delay
      setTimeout(() => {
        navigate('/ServiceRequest', {
          state: {
            toast: {
              text: `Request ${record.requestId} updated to '${actionStatus}' successfully.`,
              type: 'success'
            }
          }
        });
      }, 700);
    } catch (err: any) {
      showToast(`Failed to update status: ${err?.message || 'Error'}`, 'error');
      setIsUpdating(false);
    }
  };

  const comparisonFields = useMemo(() => {
    if (!record) return [];
    return getComparisonFields(record, contributorData);
  }, [record, contributorData]);

  const verifiedYesCount = useMemo(() => {
    return Object.values(fieldChecks).filter((f) => f.verified === true).length;
  }, [fieldChecks]);

  const verifiedNoCount = useMemo(() => {
    return Object.values(fieldChecks).filter((f) => f.verified === false).length;
  }, [fieldChecks]);

  // Loading State
  if (loadingRecord && !record) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-5 font-sans text-slate-700 animate-in fade-in">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 text-emerald-600 flex items-center justify-center shadow-sm">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="text-lg font-extrabold text-slate-900">Loading Verification Audit Workspace...</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {selectedRecordId ? (
              <>Querying ReviewClientData API for Record ID: <span className="font-mono font-bold text-emerald-600">{selectedRecordId}</span></>
            ) : (
              'Querying live verification API database'
            )}
          </p>
        </div>
      </div>
    );
  }

  // Error State when no record is loaded
  if (fetchError && !record) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-5 font-sans text-center p-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-slate-900">Failed to Fetch Record Data</h2>
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium max-w-md mx-auto">
            {fetchError}
          </div>
        </div>

        {/* Input to try a different ID */}
        <div className="flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm p-1 max-w-md w-full">
          <input
            type="text"
            value={inputRecordId}
            onChange={(e) => setInputRecordId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputRecordId.trim()) {
                handleSearchRecord(inputRecordId.trim());
              }
            }}
            placeholder="Try another Record ID (e.g. VR-2026-1001)"
            className="px-3 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none flex-1"
          />
          <button
            type="button"
            onClick={() => handleSearchRecord(inputRecordId.trim())}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Fetch
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchDataForRecord(selectedRecordId)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Fetch</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/ServiceRequest')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Service Requests Queue</span>
          </button>
        </div>

        {rawApiResponse && (
          <div className="w-full max-w-3xl mt-6 text-left">
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Raw API Response Received:</h4>
            <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
              {renderFormattedJson(rawApiResponse)}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not Found State
  if (!record) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 font-sans text-center p-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">Service Request Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md">
          The requested candidate verification record could not be located in the active queue. It may have been cleared or the ID is invalid.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchDataForRecord(selectedRecordId)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Fetch</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/ServiceRequest')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Service Requests Queue</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-fade-in pb-12">
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

      {/* In-Page Error Notice Banner (if fetch error occurred while maintaining current view) */}
      {fetchError && (
        <div className="bg-rose-50 border border-rose-200/90 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-extrabold uppercase text-[10px] tracking-wider block text-rose-900">
                API Data Fetch Notice
              </span>
              <span className="text-rose-700 font-medium">{fetchError}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => fetchDataForRecord(selectedRecordId)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Fetch</span>
            </button>
            <button
              type="button"
              onClick={() => setFetchError(null)}
              className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-colors"
              title="Dismiss error notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* In-Page Loading Feedback Banner */}
      {loadingRecord && (
        <div className="bg-emerald-50/90 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-emerald-800 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
            <span className="font-bold">Fetching latest record data from ReviewClientData API...</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 font-bold">
            Record ID: {selectedRecordId || record.requestId}
          </span>
        </div>
      )}

      {/* Top Navigation & Breadcrumbs Bar with Record ID Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ServiceRequest')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 active:scale-95 border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Queue</span>
          </button>

          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link to="/ServiceRequest" className="hover:text-slate-700 transition-colors">
              Service Requests
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-600 font-bold">Verification Review</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
              {record.requestId}
            </span>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Record ID Search Input Bar */}
          <div className="flex items-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-1">
            <div className="flex items-center px-2 text-slate-400 gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Record ID</span>
            </div>
            <input
              type="text"
              value={inputRecordId}
              onChange={(e) => setInputRecordId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputRecordId.trim()) {
                  handleSearchRecord(inputRecordId.trim());
                }
              }}
              placeholder="e.g. VR-2026-1001"
              className="px-2.5 py-1 text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none w-32 sm:w-40"
            />
            <button
              type="button"
              onClick={() => handleSearchRecord(inputRecordId.trim())}
              disabled={loadingRecord || !inputRecordId.trim()}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              title="Fetch record by specific ID"
            >
              <RefreshCw className={`w-3 h-3 ${loadingRecord ? 'animate-spin' : ''}`} />
              <span>{loadingRecord ? 'Fetching' : 'Fetch'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleMarkAllYes}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 font-extrabold text-xs border border-emerald-300 transition-all cursor-pointer shadow-2xs"
            title="Mark all verification fields as verified (YES)"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All YES</span>
          </button>

          <button
            type="button"
            onClick={() => fetchContributorMasterData(record)}
            disabled={dataLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Re-query Contributor Live Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${dataLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{dataLoading ? 'Re-checking...' : 'Re-check'}</span>
          </button>
        </div>
      </div>

      {/* 1. Hero Summary Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shrink-0">
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {roleName} Review Desk
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {record.verificationType || 'Employment Verification'}
                </span>
                <span className="font-mono text-[11px] font-extrabold bg-slate-800/80 px-3 py-0.5 rounded-full text-slate-200 border border-slate-700">
                  {record.requestId}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                {record.candidateName}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Side-by-side verification audit comparing <b>Contributor Master Database records</b> against <b>Client Provided Submission credentials</b>.
              </p>
            </div>
          </div>

          {/* Key Candidate Metadata Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl backdrop-blur-xs text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Employee Code</div>
              <div className="font-mono font-extrabold text-white mt-0.5">{record.employeeId}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Target Contributor</div>
              <div className="font-bold text-emerald-300 truncate max-w-[130px] mt-0.5">
                {record.verifierName}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Submitted By</div>
              <div className="font-bold text-indigo-300 truncate max-w-[130px] mt-0.5">
                {record.submittedBy || 'Client'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Designation</div>
              <div className="font-bold text-slate-200 truncate max-w-[130px] mt-0.5">
                {record.designation || 'Not Provided'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Submission Date</div>
              <div className="font-medium text-slate-300 mt-0.5">{record.submittedAt}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Status</div>
              <div className="mt-0.5">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    record.status === 'Verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : record.status === 'Rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : record.status === 'In Progress'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {record.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Raw JSON Preview Toggle Strip */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 shadow-xs text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-300">
            Raw API Response Preview
          </span>
          {rawApiResponse && (
            <span className="font-mono text-[10px] text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {`${(new Blob([JSON.stringify(rawApiResponse)]).size / 1024).toFixed(1)} KB`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopyJson(rawApiResponse)}
            disabled={!rawApiResponse}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </button>
          <button
            type="button"
            onClick={() => setShowQuickJson(!showQuickJson)}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <FileCode className="w-3 h-3" />
            <span>{showQuickJson ? 'Hide JSON View' : 'Show Formatted JSON View'}</span>
            {showQuickJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Formatted JSON Accordion View */}
      {showQuickJson && renderRawJsonResponseView()}

      {/* 2. Verification Stats & Audit Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Audit Progress:
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> {verifiedYesCount} Matched (Yes)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <X className="w-3.5 h-3.5 text-rose-600" /> {verifiedNoCount} Discrepancies (No)
          </span>
          <span className="text-slate-500 font-semibold">
            Total Checked: <b className="text-slate-800">{verifiedYesCount + verifiedNoCount}</b> / {comparisonFields.length} Fields
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Workspace Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 font-bold text-xs">
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorkspaceTab === 'comparison'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Comparison Audit</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('jsonView')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorkspaceTab === 'jsonView'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>Raw API Response (JSON)</span>
              {rawApiResponse && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('dynamicRaw')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorkspaceTab === 'dynamicRaw'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dynamic Keys</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2.1 Dynamic LOA / Document Preview Banner */}
      {detectedDoc && (
        <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 rounded-2xl border border-indigo-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200">
                Uploaded Verification Document
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">Letter of Authorization (LOA) / Candidate Proof</h4>
              <p className="text-xs text-slate-500">Document submitted through dynamic client API record</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setPreviewDocUrl(detectedDoc.url);
                setPreviewDocTitle(detectedDoc.title);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Document</span>
            </button>
            <a
              href={detectedDoc.url}
              download={`LOA_${record.requestId || 'Document'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>
      )}

      {/* Workspace Content: JSON View, Dynamic Raw Payload, or Dual Comparison Audit */}
      {activeWorkspaceTab === 'jsonView' ? (
        renderRawJsonResponseView()
      ) : activeWorkspaceTab === 'dynamicRaw' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Code className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Live Dynamic API Payload Inspector (ReviewClientData)
                </h3>
                <p className="text-xs text-slate-400">
                  Full unadulterated response and dynamic properties passed from https://worktrail.ai/api/ReviewClientData
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const combined = {
                  clientSubmittedRecord: record,
                  contributorMatchedData: contributorData,
                  customFields: record?.customFields,
                  dynamicData: record?.dynamicData
                };
                navigator.clipboard.writeText(JSON.stringify(combined, null, 2));
                showToast('Dynamic API payload copied to clipboard!', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Copy JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Client Submitted Raw Properties */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Client Raw Dynamic Data</span>
                <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                  {Object.keys(record?.dynamicData || record?.customFields || record || {}).length} Keys
                </span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed">
                {JSON.stringify(record?.dynamicData || record?.customFields || record, null, 2)}
              </pre>
            </div>

            {/* Right: Contributor Matched Raw Properties */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Contributor Raw Dynamic Data</span>
                <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  {Object.keys(contributorData || {}).length} Keys
                </span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 text-xs font-mono overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed">
                {JSON.stringify(contributorData || { status: 'No separate contributor master object; data unified in primary record' }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* 3. DUAL SIDE-BY-SIDE VERIFICATION WORKSPACE (CONTRIBUTOR vs CLIENT) */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
          {/* Table Column Headers: Left (Contributor) and Right (Client) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Side Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-emerald-200" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    Section 1: Contributor Master Data
                  </span>
                  <span className="text-[10px] text-emerald-100 font-normal">
                    Authentic records stored in contributor repository
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 text-[11px] font-extrabold bg-white/20 rounded-full text-white backdrop-blur-xs">
                {contributorData?.Contributor || record.verifierName}
              </span>
            </div>

            {/* Right Side Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-indigo-200" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    Section 2: Client Provided Data
                  </span>
                  <span className="text-[10px] text-indigo-100 font-normal">
                    Candidate self-claims submitted for verification
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 text-[11px] font-extrabold bg-white/20 rounded-full text-white backdrop-blur-xs">
                Submitted by {record.submittedBy || 'Client'}
              </span>
            </div>
          </div>

          {/* Field by Field Side-by-Side Comparison Rows */}
          <div className="space-y-4">
            {comparisonFields.map((field, idx) => {
              const check = fieldChecks[field.id] || { verified: null };
              const isYes = check.verified === true;
              const isNo = check.verified === false;
              const FieldIcon = field.icon;

              return (
                <div
                  key={field.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isYes
                      ? 'bg-emerald-50/40 border-emerald-200/90 shadow-2xs'
                      : isNo
                      ? 'bg-rose-50/40 border-rose-300 shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Row Header with Label, Dynamic Tag, and Yes/No Checkboxes */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200/60">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <FieldIcon className="w-4 h-4 text-slate-500" />
                      <span className="font-extrabold text-sm text-slate-800">{field.label}</span>

                      {field.isDynamic && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Dynamic API Field
                        </span>
                      )}

                      {isYes && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Matched
                        </span>
                      )}
                      {isNo && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Discrepancy Flagged
                        </span>
                      )}
                    </div>

                    {/* YES / NO Checkboxes */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Checkbox YES */}
                      <button
                        type="button"
                        onClick={() => handleToggleFieldVerification(field.id, true)}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          isYes
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>YES</span>
                      </button>

                      {/* Checkbox NO */}
                      <button
                        type="button"
                        onClick={() => handleToggleFieldVerification(field.id, false)}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          isNo
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-500/20'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>NO</span>
                      </button>
                    </div>
                  </div>

                  {/* Side by Side Data Values */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left: Contributor Data Value */}
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-700 uppercase flex items-center justify-between mb-1">
                          <span>Contributor Master Record</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                            Master Source
                          </span>
                        </div>
                        <div className="font-extrabold text-slate-900 text-sm break-words">
                          {isDocumentOrMediaUrl(field.contributorVal) ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="truncate max-w-[200px] text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                {field.contributorVal}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewDocUrl(field.contributorVal);
                                  setPreviewDocTitle(`${field.label} - Contributor Record`);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            </div>
                          ) : (
                            field.contributorVal
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Client Provided Data Value */}
                    <div className="p-3.5 rounded-xl bg-white border border-indigo-200/80 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-indigo-700 uppercase flex items-center justify-between mb-1">
                          <span>Client Provided Submission</span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                            Claimed Value
                          </span>
                        </div>
                        <div className="font-extrabold text-slate-900 text-sm break-words">
                          {isDocumentOrMediaUrl(field.clientVal) ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="truncate max-w-[200px] text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                {field.clientVal}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewDocUrl(field.clientVal);
                                  setPreviewDocTitle(`${field.label} - Client Submission`);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            </div>
                          ) : (
                            field.clientVal
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remarks Section */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Facilitator Verification Remarks & Observations
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Provide any discrepancy explanations, physical audit references, or summary findings
              </span>
            </div>
            <textarea
              rows={4}
              value={overallRemarks}
              onChange={(e) => setOverallRemarks(e.target.value)}
              placeholder="Enter verification observations, discrepancies, or notes here..."
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none"
            />
          </div>

          {/* 4. Bottom Section: Overall Decision & Verdict Panel */}
          <div className="pt-5 border-t border-slate-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Selector */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-slate-700 block">
                  Final Verification Verdict:
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActionStatus('Verified')}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                      actionStatus === 'Verified'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    ✓ Verified Clean
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionStatus('Rejected')}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                      actionStatus === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-500/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    ✗ Discrepancy / Rejected
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionStatus('In Progress')}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                      actionStatus === 'In Progress'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-500/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    In Review
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionStatus('Pending')}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                      actionStatus === 'Pending'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Audited by <b className="text-slate-800 font-bold">{user?.username || 'Facilitator'}</b> ({roleName})
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                Saving updates the verification decision across the system and synchronizes live storage.
              </span>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => navigate('/ServiceRequest')}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveVerification}
                  disabled={isUpdating}
                  className="px-7 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? 'Saving Decision...' : 'Save & Apply Verification Decision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Document / LOA Preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-900 truncate max-w-lg">{previewDocTitle}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDocUrl}
                  download="Verification_Document"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-all"
                  title="Download / Open in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDocUrl(null)}
                  className="p-2 rounded-xl text-slate-600 hover:bg-rose-100 hover:text-rose-600 transition-all cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-slate-100/50">
              {previewDocUrl.startsWith('data:image') ||
              /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(previewDocUrl) ? (
                <img
                  src={previewDocUrl}
                  alt="Document Preview"
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-md"
                />
              ) : (
                <iframe
                  src={previewDocUrl}
                  title="Document Preview"
                  className="w-full h-[70vh] rounded-xl border border-slate-200 bg-white"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs">
              <span className="text-slate-500 font-medium">Candidate Verification Attachment</span>
              <button
                type="button"
                onClick={() => setPreviewDocUrl(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestReview;

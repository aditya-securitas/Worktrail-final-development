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
  ChevronUp,
  Columns,
  Split,
  SlidersHorizontal,
  RotateCcw,
  Filter,
  Maximize2
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
    if (
      v.includes('/uploads/') ||
      v.includes('/documents/') ||
      v.includes('/files/') ||
      v.includes('/loa/') ||
      v.includes('drive.google.com')
    ) {
      return true;
    }
  }
  return false;
};

// Single API endpoint containing both client requests and contributor records
const REVIEW_CLIENT_DATA_API_URL =
  (API_ENDPOINTS as any).reviewClientData || 'https://worktrail.ai/api/ReviewClientData';

const API_HEADERS = {
  APIKEY: 'Securitas@#!1234',
  'Content-Type': 'application/json'
};

export interface FieldVerificationState {
  verified: boolean | null; // true = Yes, false = No, null = unselected
  remarks?: string;
  showRemarksInput?: boolean;
}

export type FieldMatchStatus = 'match' | 'mismatch' | 'missing';

export const calculateFieldMatch = (clientVal: any, contributorVal: any): FieldMatchStatus => {
  const c = String(clientVal ?? '').trim().toLowerCase();
  const r = String(contributorVal ?? '').trim().toLowerCase();

  const isEmpty = (s: string) =>
    !s ||
    s === '—' ||
    s === 'not recorded' ||
    s === 'not provided' ||
    s === 'record not found' ||
    s === 'null' ||
    s === 'undefined' ||
    s === 'none' ||
    s === 'none reported';

  if (isEmpty(c) || isEmpty(r)) {
    return 'missing';
  }
  if (c === r) {
    return 'match';
  }
  // Normalization for dates: 2024-05-10 vs 2024/05/10 etc.
  if (c.replace(/[-/\s]/g, '') === r.replace(/[-/\s]/g, '')) {
    return 'match';
  }
  if (c.includes(r) || r.includes(c)) {
    return 'match';
  }
  return 'mismatch';
};

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
  if (k.includes('date') || k.includes('year') || k.includes('time') || k.includes('doj') || k.includes('dol'))
    return Calendar;
  if (k.includes('email') || k.includes('mail')) return Mail;
  if (k.includes('phone') || k.includes('mobile') || k.includes('contact')) return Phone;
  if (k.includes('emp') || k.includes('code') || k.includes('id') || k.includes('uan') || k.includes('pan') || k.includes('aadhar'))
    return Building2;
  if (k.includes('role') || k.includes('desig') || k.includes('job') || k.includes('position') || k.includes('title'))
    return Briefcase;
  if (k.includes('dept') || k.includes('department') || k.includes('division') || k.includes('team')) return Layers;
  if (k.includes('company') || k.includes('org') || k.includes('contributor') || k.includes('verifier'))
    return Building;
  if (k.includes('loa') || k.includes('doc') || k.includes('file') || k.includes('certificate') || k.includes('attachment'))
    return FileText;
  if (k.includes('salary') || k.includes('ctc') || k.includes('amount') || k.includes('price') || k.includes('fee'))
    return Scale;
  if (k.includes('status') || k.includes('rehire') || k.includes('eligible') || k.includes('verified'))
    return CheckCircle2;
  if (k.includes('behaviour') || k.includes('conduct') || k.includes('police') || k.includes('criminal'))
    return ShieldCheck;
  if (k.includes('name') || k.includes('father') || k.includes('gender') || k.includes('candidate')) return User;
  return FileCheck;
};

// Build the comparison fields list dynamically from API data
export const getComparisonFields = (clientRec: VerificationRecord | null | undefined, contr: any | null) => {
  const cRec = clientRec || ({} as VerificationRecord);
  const contrFullName = contr
    ? [contr.FirstName, contr.MiddleName, contr.LastName].filter(Boolean).join(' ') ||
      contr.CandidateName ||
      contr.candidateName ||
      ''
    : 'Record Not Found in Contributor DB';

  const standardFields = [
    {
      id: 'candidateName',
      label: 'Candidate Full Name',
      contributorVal: contrFullName || '—',
      clientVal: cRec.candidateName || '—',
      icon: User,
      isDynamic: false
    },
    {
      id: 'employeeId',
      label: 'Employee Code / ID',
      contributorVal: contr ? String(contr.EmployeeCode || contr.employeeId || contr.EmpCode || '—') : 'Record Not Found',
      clientVal: cRec.employeeId || '—',
      icon: Building2,
      isDynamic: false
    },
    {
      id: 'designation',
      label: 'Designation / Job Role',
      contributorVal: contr
        ? String(contr.LastPositionHeld || contr.Designation || contr.designation || 'Not Recorded')
        : 'Record Not Found',
      clientVal: cRec.designation || 'Not Provided',
      icon: Briefcase,
      isDynamic: false
    },
    {
      id: 'department',
      label: 'Department',
      contributorVal: contr ? String(contr.Department || contr.department || 'Not Recorded') : 'Record Not Found',
      clientVal: cRec.department || 'Not Provided',
      icon: Layers,
      isDynamic: false
    },
    {
      id: 'dateOfJoining',
      label: 'Date of Joining (DOJ)',
      contributorVal: contr ? String(contr.DateOfJoining || contr.dateOfJoining || 'Not Recorded') : 'Record Not Found',
      clientVal: cRec.dateOfJoining || 'Not Provided',
      icon: Calendar,
      isDynamic: false
    },
    {
      id: 'dateOfLeaving',
      label: 'Date of Leaving (DOL)',
      contributorVal: contr
        ? String(
            contr.DateOfLeaving ||
              contr.dateOfLeaving ||
              (contr.IsCurrentlyEmployed ? 'Present / Active' : 'Not Recorded')
          )
        : 'Record Not Found',
      clientVal: cRec.dateOfLeaving || (cRec.isCurrentlyEmployed ? 'Currently Employed' : 'Not Provided'),
      icon: Calendar,
      isDynamic: false
    },
    {
      id: 'employmentType',
      label: 'Employment Status',
      contributorVal: contr
        ? String(contr.EmploymentType || (contr.IsCurrentlyEmployed ? 'Active' : 'Relieved'))
        : 'Record Not Found',
      clientVal: cRec.isCurrentlyEmployed ? 'Currently Employed' : 'Ex-Employee',
      icon: UserCheck,
      isDynamic: false
    },
    {
      id: 'exitFormalities',
      label: 'Exit Formalities & Clearance',
      contributorVal: contr ? String(contr.ExitFormalities || '—') : 'Record Not Found',
      clientVal: cRec.isCurrentlyEmployed
        ? 'N/A (Active Employee)'
        : cRec.remarks
        ? `Client Note: ${cRec.remarks}`
        : 'Not Specified',
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
      contributorVal: contr
        ? `${contr.Email || contr.candidateEmail || 'No Email'} | ${
            contr.MobileNo || contr.contactNumber || 'No Mobile'
          }`
        : 'Record Not Found',
      clientVal: `${cRec.candidateEmail || 'No Email'} | ${cRec.contactNumber || 'No Mobile'}`,
      icon: Mail,
      isDynamic: false
    }
  ];

  // Ignored internal keys
  const IGNORED_KEYS = new Set([
    'id',
    'customfields',
    'dynamicdata',
    'fieldchecks',
    'created_at',
    'updated_at',
    'deleted_at',
    'inrecyclebin',
    'isdownloaded',
    'downloadedat',
    'downloadedby',
    'verifiedat',
    'verifieddate',
    'verifiedtime',
    'status',
    'amount',
    'transactionid',
    'paymentid',
    'orderid',
    'verifierid',
    'verifiercode',
    'verifiercategory',
    'uploadedfilescount',
    'firstname',
    'middlename',
    'lastname',
    'candidatename',
    'employeecode',
    'employeeid',
    'empcode',
    'lastpositionheld',
    'designation',
    'department',
    'dateofjoining',
    'dateofleaving',
    'iscurrentlyemployed',
    'employmenttype',
    'exitformalities',
    'anybehaviourissue',
    'eligibilitytorehire',
    'email',
    'candidateemail',
    'mobileno',
    'contactnumber',
    'mobile',
    'remarks',
    'clientemail',
    'submittedby',
    'submittedat',
    'requestid',
    'contributor',
    'verifiername',
    'verificationtype'
  ]);

  // Aggregate all raw data objects from client and contributor
  const clientRaw: Record<string, any> = {
    ...(cRec.customFields || {}),
    ...(cRec.dynamicData || {}),
    ...cRec
  };

  const contrRaw: Record<string, any> = {
    ...(contr?.customFields || {}),
    ...(contr?.dynamicData || {}),
    ...(contr || {})
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

// Flexible JSON parser to extract Client Claim and Contributor Official Data
function parseIncomingJson(raw: any): { clientRec: VerificationRecord | null; contrRec: any | null; rawJson: any } {
  if (!raw || typeof raw !== 'object') {
    return { clientRec: null, contrRec: null, rawJson: raw };
  }

  let target = Array.isArray(raw) ? raw[0] : raw;
  if (!target || typeof target !== 'object') {
    return { clientRec: null, contrRec: null, rawJson: raw };
  }

  // Check if target has explicit split keys
  let clientObj = target.client || target.clientData || target.clientRecord || target.claim || null;
  let contrObj =
    target.contributor ||
    target.contributorData ||
    target.contributorRecord ||
    target.masterRecord ||
    target.officialData ||
    null;

  if (!clientObj && !contrObj) {
    clientObj = target;
    contrObj = target;
  } else if (!clientObj && contrObj) {
    clientObj = contrObj;
  } else if (clientObj && !contrObj) {
    contrObj = clientObj;
  }

  const fullName =
    [clientObj.FirstName, clientObj.MiddleName, clientObj.LastName].filter(Boolean).join(' ') ||
    clientObj.candidateName ||
    clientObj.CandidateName ||
    clientObj.name ||
    clientObj.Name ||
    'Candidate';

  const clientRec: VerificationRecord = {
    id: String(clientObj.id || clientObj.Sno || clientObj.RequestId || clientObj.EmployeeCode || 'REC-1'),
    requestId: clientObj.RequestId || clientObj.requestId || clientObj.OrderID || clientObj.orderId || 'VR-2026',
    candidateName: fullName,
    employeeId: String(
      clientObj.EmployeeCode || clientObj.employeeId || clientObj.empCode || clientObj.EmpCode || clientObj.EmployeeID || '—'
    ),
    candidateEmail: clientObj.Email || clientObj.candidateEmail || clientObj.email || '',
    contactNumber: clientObj.MobileNo || clientObj.contactNumber || clientObj.mobile || '',
    verifierId: String(clientObj.OrganizationID || clientObj.verifierId || '1'),
    verifierName: clientObj.Contributor || clientObj.verifierName || clientObj.contributor || 'Registered Enterprise',
    verifierCategory: 'Master Contributor',
    verifierCode: clientObj.verifierCode || 'ORG-1',
    dateOfJoining: clientObj.DateOfJoining ? clientObj.DateOfJoining.split('T')[0] : clientObj.dateOfJoining || '—',
    dateOfLeaving: clientObj.DateOfLeaving ? clientObj.DateOfLeaving.split('T')[0] : clientObj.dateOfLeaving || 'Present',
    isCurrentlyEmployed: !clientObj.DateOfLeaving || String(clientObj.DateOfLeaving).toLowerCase() === 'present',
    designation:
      clientObj.LastPositionHeld || clientObj.designation || clientObj.Designation || clientObj.Department || '—',
    department: clientObj.Department || clientObj.department || 'General',
    verificationType: clientObj.verificationType || 'Employment & Integrity',
    remarks: clientObj.AnyBehaviourIssue ? `Behaviour: ${clientObj.AnyBehaviourIssue}` : clientObj.remarks || '',
    uploadedFilesCount: clientObj.LOA || clientObj.loa || clientObj.SupportingDocs ? 1 : 0,
    submittedBy: clientObj.Clientemail || clientObj.submittedBy || 'Client User',
    submittedAt: clientObj.CreatedAt
      ? clientObj.CreatedAt.split('T')[0]
      : clientObj.submittedAt || new Date().toISOString().split('T')[0],
    status: (clientObj.Status || clientObj.status || 'Pending') as any,
    customFields: clientObj,
    dynamicData: clientObj
  };

  return { clientRec, contrRec: contrObj, rawJson: raw };
}

/**
 * ServiceRequestReview Component
 * Delivers a side-by-side verification review comparing client claims against contributor master records.
 */
const ServiceRequestReview: React.FC<any> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Restrict contributor role from accessing review
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

  // Extract contributor & employeeCode from props or location state
  const contributorFromProps =
    props.contributor ||
    (props.record && (props.record.Contributor || props.record.contributor)) ||
    (location.state &&
      ((location.state as any).contributor ||
        (location.state as any).record?.Contributor ||
        (location.state as any).record?.contributor)) ||
    '';

  const employeeCodeFromProps =
    props.employeeCode ||
    (props.record && (props.record.EmployeeCode || props.record.employeeCode)) ||
    (location.state &&
      ((location.state as any).employeeCode ||
        (location.state as any).record?.EmployeeCode ||
        (location.state as any).record?.employeeCode)) ||
    '';

  const initialId =
    searchParams.get('id') ||
    searchParams.get('requestId') ||
    searchParams.get('employeeCode') ||
    (location.state as any)?.recordId ||
    (location.state as any)?.record?.id ||
    (location.state as any)?.record?.requestId ||
    employeeCodeFromProps ||
    '';

  const [selectedRecordId, setSelectedRecordId] = useState<string>(initialId);
  const [inputRecordId, setInputRecordId] = useState<string>(initialId);

  // Core Data States
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [contributorData, setContributorData] = useState<any | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<any | null>(null);

  const [loadingRecord, setLoadingRecord] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchTimestamp, setFetchTimestamp] = useState<string | null>(null);
  const [fetchHttpStatus, setFetchHttpStatus] = useState<number | null>(null);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<'sideBySide' | 'jsonView' | 'documentPreview'>('sideBySide');
  const [filterMode, setFilterMode] = useState<'all' | 'matches' | 'mismatches' | 'missing' | 'unreviewed'>('all');
  const [searchFieldQuery, setSearchFieldQuery] = useState<string>('');

  // Field Verification States
  const [fieldChecks, setFieldChecks] = useState<Record<string, FieldVerificationState>>({});
  const [actionStatus, setActionStatus] = useState<VerificationRecord['status']>('Pending');
  const [overallRemarks, setOverallRemarks] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // UI Preview & Feedback
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('Document Preview');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopyText = (text: string, id: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleDownloadJson = (data: any, name: string) => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name || 'record'}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('JSON file downloaded successfully!', 'success');
    } catch {
      showToast('Failed to download JSON', 'error');
    }
  };

  // Main API Fetch function
  const fetchReviewClientData = useCallback(
    async (contributorVal: string, employeeCodeVal: string) => {
      setLoadingRecord(true);
      setFetchError(null);

      const payload: any = {};
      if (contributorVal) payload.contributor = contributorVal;
      if (employeeCodeVal) payload.employeeCode = employeeCodeVal;

      // If neither is present, try fallback from state or prompt
      if (!payload.contributor && !payload.employeeCode) {
        setLoadingRecord(false);
        setFetchError('Missing contributor and employeeCode. Please provide an Employee ID.');
        return;
      }

      try {
        const res = await fetch(REVIEW_CLIENT_DATA_API_URL, {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify(payload)
        });

        setFetchHttpStatus(res.status);

        if (!res.ok) {
          throw new Error(`API responded with HTTP ${res.status}: ${res.statusText || 'Server Error'}`);
        }

        const data = await res.json();
        setRawApiResponse(data);
        setFetchTimestamp(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );

        const parsed = parseIncomingJson(data);
        if (parsed.clientRec) {
          setRecord(parsed.clientRec);
          setContributorData(parsed.contrRec || data);
          setActionStatus(parsed.clientRec.status || 'Pending');
          setOverallRemarks(parsed.clientRec.remarks || '');
        } else {
          setFetchError('No candidate verification record found in API response.');
        }
      } catch (err: any) {
        setFetchError(err?.message || 'Failed to fetch review data from API.');
      } finally {
        setLoadingRecord(false);
      }
    },
    []
  );

  // Initialize from directly passed JSON if available (props.data / location.state.record / props.record)
  useEffect(() => {
    const directJson =
      props.data ||
      props.jsonData ||
      (location.state as any)?.data ||
      (location.state as any)?.jsonData ||
      (location.state as any)?.record ||
      props.record ||
      null;

    if (directJson) {
      setRawApiResponse(directJson);
      const parsed = parseIncomingJson(directJson);
      if (parsed.clientRec) {
        setRecord(parsed.clientRec);
        setContributorData(parsed.contrRec || directJson);
        setActionStatus(parsed.clientRec.status || 'Pending');
        setOverallRemarks(parsed.clientRec.remarks || '');
        setLoadingRecord(false);
        return;
      }
    }

    // Otherwise fetch live from API using contributor and employeeCode
    const contr = contributorFromProps || (location.state as any)?.contributor || 'Securitas';
    const empCode = employeeCodeFromProps || selectedRecordId || 'C007645';
    fetchReviewClientData(contr, empCode);
  }, [contributorFromProps, employeeCodeFromProps, selectedRecordId, props.data, props.record, location.state, fetchReviewClientData]);

  // Comparison fields builder
  const comparisonFields = useMemo(() => {
    if (!record) return [];
    return getComparisonFields(record, contributorData);
  }, [record, contributorData]);

  // Filtered fields based on search & filter tabs
  const displayedFields = useMemo(() => {
    return comparisonFields.filter((f) => {
      const matchStatus = calculateFieldMatch(f.clientVal, f.contributorVal);
      const isVerified = fieldChecks[f.id]?.verified;

      // Filter Mode
      if (filterMode === 'matches' && matchStatus !== 'match') return false;
      if (filterMode === 'mismatches' && matchStatus !== 'mismatch') return false;
      if (filterMode === 'missing' && matchStatus !== 'missing') return false;
      if (filterMode === 'unreviewed' && isVerified != null) return false;

      // Search Query
      if (searchFieldQuery.trim()) {
        const q = searchFieldQuery.toLowerCase();
        const matchLabel = f.label.toLowerCase().includes(q);
        const matchClient = String(f.clientVal || '').toLowerCase().includes(q);
        const matchContr = String(f.contributorVal || '').toLowerCase().includes(q);
        if (!matchLabel && !matchClient && !matchContr) return false;
      }

      return true;
    });
  }, [comparisonFields, filterMode, searchFieldQuery, fieldChecks]);

  // Statistics
  const stats = useMemo(() => {
    const total = comparisonFields.length || 1;
    let exactMatches = 0;
    let mismatches = 0;
    let missing = 0;

    comparisonFields.forEach((f) => {
      const s = calculateFieldMatch(f.clientVal, f.contributorVal);
      if (s === 'match') exactMatches++;
      else if (s === 'mismatch') mismatches++;
      else missing++;
    });

    const reviewedCount = Object.values(fieldChecks).filter((c) => c.verified !== null).length;
    const verifiedYes = Object.values(fieldChecks).filter((c) => c.verified === true).length;
    const verifiedNo = Object.values(fieldChecks).filter((c) => c.verified === false).length;

    const matchPercent = Math.round((exactMatches / total) * 100);
    const auditCompletionPercent = Math.round((reviewedCount / total) * 100);

    return {
      total: comparisonFields.length,
      exactMatches,
      mismatches,
      missing,
      reviewedCount,
      verifiedYes,
      verifiedNo,
      matchPercent,
      auditCompletionPercent
    };
  }, [comparisonFields, fieldChecks]);

  // Field Verification Toggles
  const handleToggleField = (fieldId: string, verifiedVal: boolean) => {
    setFieldChecks((prev) => {
      const current = prev[fieldId]?.verified;
      const isSame = current === verifiedVal;
      return {
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          verified: isSame ? null : verifiedVal,
          showRemarksInput: !isSame && verifiedVal === false ? true : prev[fieldId]?.showRemarksInput
        }
      };
    });
  };

  const handleFieldRemarksChange = (fieldId: string, remarks: string) => {
    setFieldChecks((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        remarks
      }
    }));
  };

  const toggleRemarksInput = (fieldId: string) => {
    setFieldChecks((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        showRemarksInput: !prev[fieldId]?.showRemarksInput
      }
    }));
  };

  const handleMarkAll = (verifiedVal: boolean) => {
    const updated: Record<string, FieldVerificationState> = {};
    comparisonFields.forEach((f) => {
      updated[f.id] = {
        verified: verifiedVal,
        remarks: fieldChecks[f.id]?.remarks || '',
        showRemarksInput: !verifiedVal
      };
    });
    setFieldChecks(updated);
    showToast(
      verifiedVal ? 'All fields marked as Verified / Matched!' : 'All fields flagged as Mismatched!',
      verifiedVal ? 'success' : 'info'
    );
  };

  const handleResetChecks = () => {
    setFieldChecks({});
    showToast('All field verifications reset.', 'info');
  };

  // Submit Final Review Decision
  const handleSaveVerification = async () => {
    if (!record) return;
    setIsUpdating(true);

    const updatePayload = {
      requestId: record.requestId || selectedRecordId,
      EmployeeCode: record.employeeId,
      status: actionStatus,
      Status: actionStatus,
      remarks: overallRemarks,
      fieldChecks,
      verifiedBy: user?.username || user?.email || 'Facilitator Reviewer',
      verifiedAt: new Date().toISOString()
    };

    try {
      const updateUrl = (API_ENDPOINTS as any).clientDocumentUpdate || 'https://worktrail.ai/api/ClientDocumentUpdate';
      await fetch(updateUrl, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(updatePayload)
      });
      showToast(`Verification decision recorded as "${actionStatus}"!`, 'success');
      setRecord((prev) => (prev ? { ...prev, status: actionStatus, remarks: overallRemarks } : null));
    } catch {
      showToast(`Verification decision updated locally as "${actionStatus}".`, 'success');
      setRecord((prev) => (prev ? { ...prev, status: actionStatus, remarks: overallRemarks } : null));
    } finally {
      setIsUpdating(false);
    }
  };

  // Detected Document / LOA
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
    const val =
      raw.LOA ||
      raw.loa ||
      raw.document ||
      raw.Document ||
      raw.attachment ||
      raw.Attachment ||
      raw.file ||
      raw.fileUrl ||
      raw.LOA_URL;

    if (val && typeof val === 'string' && val.trim().length > 0) {
      return {
        url: val.trim(),
        title: `${record.candidateName} - Letter of Authorization / Verification Document`
      };
    }
    return null;
  }, [record, contributorData]);

  // Formatted JSON line-by-line viewer
  const renderFormattedJson = (jsonObj: any): React.ReactNode => {
    if (jsonObj === undefined || jsonObj === null) {
      return <span className="text-rose-400  italic">null</span>;
    }
    const jsonStr = typeof jsonObj === 'string' ? jsonObj : JSON.stringify(jsonObj, null, 2);
    const lines = jsonStr.split('\n');

    return (
      <div className=" text-xs leading-relaxed select-text">
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
                <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-4  text-[11px] group-hover:text-slate-400">
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
              <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-4  text-[11px] group-hover:text-slate-400">
                {idx + 1}
              </span>
              <span className="flex-1 whitespace-pre text-slate-400">{line}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900  pb-24 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white shadow-rose-500/20'
              : 'bg-slate-900 text-white shadow-slate-900/20'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-200" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-200" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-sky-200" />}
          <span>{toast.text}</span>
        </div>
      )}

   

      {/* Main Review Canvas */}
      <main className="  space-y-6">
        {/* Loading State */}
        {loadingRecord ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-4 shadow-sm">
            <RefreshCw className="w-10 h-10 text-[#0680A6] animate-spin mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Retrieving Candidate Verification Data...</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Connecting to ReviewClientData API for contributor records and matching claims.
            </p>
          </div>
        ) : fetchError && !record ? (
          <div className="bg-white rounded-3xl border border-rose-200 p-10 text-center space-y-4 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Unable to Load Review Record</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">{fetchError}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fetchReviewClientData(contributorFromProps || 'Securitas', selectedRecordId || 'C007645')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Retry Fetch
              </button>
              <button
                type="button"
                onClick={() => navigate('/ServiceRequest')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Back to List
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 2. Hero Candidate Identity & Audit Banner */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Profile Identity */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#5850EC] text-white flex items-center justify-center font-extrabold text-lg shadow-md shrink-0">
                    {record?.candidateName
                      ?.split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'CD'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {record?.candidateName || 'Candidate Profile'}
                      </h1>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                          actionStatus === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : actionStatus === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : actionStatus === 'In Progress'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            actionStatus === 'Verified'
                              ? 'bg-emerald-500'
                              : actionStatus === 'Rejected'
                              ? 'bg-rose-500'
                              : actionStatus === 'In Progress'
                              ? 'bg-sky-500 animate-pulse'
                              : 'bg-amber-500'
                          }`}
                        />
                        {actionStatus}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1  font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Building2 className="w-3 h-3 text-[#0680A6]" />
                        ID: {record?.employeeId || '—'}
                      </span>

                      <span className="inline-flex items-center gap-1  text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        Order: {record?.requestId || '—'}
                      </span>

                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Building className="w-3 h-3 text-slate-400" />
                        Verifier: <strong className="text-slate-800">{record?.verifierName || 'Securitas'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Audit Metrics Bar */}
                <div className="flex flex-wrap items-center gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70 self-start lg:self-auto">
                  <div className="px-3 py-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Data Health</span>
                    <span className="text-xl font-black text-slate-900">{stats.matchPercent}%</span>
                  </div>

                  <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {stats.exactMatches} Matches
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100/70 text-rose-800 border border-rose-200/60">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      {stats.mismatches} Mismatches
                    </span>

                    {stats.missing > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100/70 text-amber-800 border border-amber-200/60">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        {stats.missing} Missing
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Completion Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-600">
                  <CheckCheck className="w-4 h-4 text-[#0680A6]" />
                  <span>
                    Audit Completion: <strong>{stats.reviewedCount}</strong> of <strong>{stats.total}</strong> fields verified (
                    {stats.auditCompletionPercent}%)
                  </span>
                </div>

                <div className="w-36 sm:w-64 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0680A6] transition-all duration-300 rounded-full"
                    style={{ width: `${stats.auditCompletionPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* TAB 1: SIDE-BY-SIDE REVIEW VIEW */}
            {activeTab === 'sideBySide' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* 3. Toolbar & Filters */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                    <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider mr-1">Filter:</span>
                    {[
                      { id: 'all', label: `All Fields (${stats.total})` },
                      { id: 'matches', label: `Matches (${stats.exactMatches})` },
                      { id: 'mismatches', label: `Mismatches (${stats.mismatches})` },
                      { id: 'unreviewed', label: `Pending Review (${stats.total - stats.reviewedCount})` }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilterMode(f.id as any)}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          filterMode === f.id
                            ? 'bg-gradient-to-r from-[#10B981] to-[#5850EC] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => handleMarkAll(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      title="Mark all parameters as verified match"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verify All</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMarkAll(false)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      title="Flag all parameters as mismatch"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Flag All</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetChecks}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                      title="Reset all checks"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* 4. Side-by-Side Comparison Container */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                  {/* Column Headers */}
                  <div className="grid grid-cols-1 md:grid-cols-12 bg-slate-100/70 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <div className="md:col-span-4 p-4 flex items-center gap-2 border-r border-slate-200/60">
                      <User className="w-4 h-4 text-[#0680A6]" />
                      <span>Client Submitted Claim</span>
                      <span className="text-[10px]  px-2 py-0.5 rounded bg-white text-slate-500 border border-slate-200 ml-auto">
                        Client Declared
                      </span>
                    </div>

                    <div className="md:col-span-4 p-4 flex items-center justify-center gap-2 border-r border-slate-200/60 text-center">
                      <Scale className="w-4 h-4 text-slate-500" />
                      <span>Audit & Comparison Verdict</span>
                    </div>

                    <div className="md:col-span-4 p-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>Contributor Master Record</span>
                      <span className="text-[10px]  px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 ml-auto">
                        Official DB
                      </span>
                    </div>
                  </div>

                  {/* Comparative Field Rows */}
                  <div className="divide-y divide-slate-100">
                    {displayedFields.length > 0 ? (
                      displayedFields.map((field) => {
                        const IconComponent = field.icon || FileCheck;
                        const matchStatus = calculateFieldMatch(field.clientVal, field.contributorVal);
                        const fieldCheck = fieldChecks[field.id] || { verified: null };
                        const isVerifiedYes = fieldCheck.verified === true;
                        const isVerifiedNo = fieldCheck.verified === false;

                        return (
                          <div
                            key={field.id}
                            className={`grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-4 transition-colors hover:bg-slate-50/70 ${
                              isVerifiedYes ? 'bg-emerald-50/20' : isVerifiedNo ? 'bg-rose-50/20' : ''
                            }`}
                          >
                            {/* Left Column: Client Claim */}
                            <div className="md:col-span-4 space-y-1.5 md:border-r md:border-slate-100 md:pr-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <IconComponent className="w-3.5 h-3.5 text-slate-400" />
                                <span>{field.label}</span>
                              </div>

                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-900 font-medium break-words flex items-center justify-between gap-2 group">
                                {isDocumentOrMediaUrl(field.clientVal) ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewDocUrl(field.clientVal);
                                      setPreviewDocTitle(`${field.label} Preview`);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-[#0680A6] hover:underline font-bold"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>View Attached File</span>
                                  </button>
                                ) : (
                                  <span className="font-semibold">{String(field.clientVal)}</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCopyText(String(field.clientVal), `c-${field.id}`)}
                                  className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Copy value"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Center Column: Match Indicator & Verifier Decision Controls */}
                            <div className="md:col-span-4 flex flex-col justify-center items-center gap-2.5 md:border-r md:border-slate-100 md:px-3 text-center">
                              {/* Match Status Badge */}
                              <div className="flex items-center justify-center">
                                {matchStatus === 'match' ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Exact Match
                                  </span>
                                ) : matchStatus === 'mismatch' ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                    Discrepancy Found
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    Missing in One Source
                                  </span>
                                )}
                              </div>

                              {/* Interactive Yes / No Verifier Buttons */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleField(field.id, true)}
                                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                    isVerifiedYes
                                      ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-600/30'
                                      : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
                                  }`}
                                  title="Verify as correct match"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Verify</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleField(field.id, false)}
                                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                    isVerifiedNo
                                      ? 'bg-rose-600 text-white shadow-rose-500/25 ring-2 ring-rose-600/30'
                                      : 'bg-white hover:bg-rose-50 text-slate-700 border border-slate-200'
                                  }`}
                                  title="Flag discrepancy / mismatch"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Flag</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleRemarksInput(field.id)}
                                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                    fieldCheck.remarks
                                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                                  }`}
                                  title={fieldCheck.remarks ? `Note: ${fieldCheck.remarks}` : 'Add verifier remark'}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Inline Field Note Input */}
                              {fieldCheck.showRemarksInput && (
                                <div className="w-full max-w-xs mt-1 animate-in fade-in">
                                  <input
                                    type="text"
                                    value={fieldCheck.remarks || ''}
                                    onChange={(e) => handleFieldRemarksChange(field.id, e.target.value)}
                                    placeholder="Enter discrepancy remark..."
                                    className="w-full px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Right Column: Contributor Master DB */}
                            <div className="md:col-span-4 space-y-1.5 md:pl-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Official DB: {field.label}</span>
                              </div>

                              <div
                                className={`p-3 rounded-xl border text-xs font-medium break-words flex items-center justify-between gap-2 group ${
                                  matchStatus === 'mismatch'
                                    ? 'bg-rose-50/40 border-rose-200/80 text-rose-950 font-semibold'
                                    : 'bg-emerald-50/30 border-emerald-200/70 text-emerald-950 font-semibold'
                                }`}
                              >
                                {isDocumentOrMediaUrl(field.contributorVal) ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewDocUrl(field.contributorVal);
                                      setPreviewDocTitle(`Official ${field.label} Preview`);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline font-bold"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>View Official Doc</span>
                                  </button>
                                ) : (
                                  <span>{String(field.contributorVal)}</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCopyText(String(field.contributorVal), `r-${field.id}`)}
                                  className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Copy value"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-16 text-center text-slate-400 space-y-2">
                        <FileText className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="font-bold text-slate-700 text-sm">No comparison fields match your current filter.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setFilterMode('all');
                            setSearchFieldQuery('');
                          }}
                          className="text-xs text-[#0680A6] font-bold hover:underline cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Final Review Decision & Verdict Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-md space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#0680A6]" />
                        Final Review Verdict & Action
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submit overall verification outcome based on the side-by-side audit findings.
                      </p>
                    </div>

                    {/* Verdict Options */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActionStatus('Verified')}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          actionStatus === 'Verified'
                            ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-600/30'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Verify</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionStatus('In Progress')}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          actionStatus === 'In Progress'
                            ? 'bg-sky-600 text-white shadow-sky-500/25 ring-2 ring-sky-600/30'
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>In Progress</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionStatus('Rejected')}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          actionStatus === 'Rejected'
                            ? 'bg-rose-600 text-white shadow-rose-500/25 ring-2 ring-rose-600/30'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Request</span>
                      </button>
                    </div>
                  </div>

                  {/* Verifier Remarks Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                      <span>Reviewer Assessment Remarks</span>
                      <span className="text-slate-400 font-normal lowercase">(optional comments recorded on audit trail)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={overallRemarks}
                      onChange={(e) => setOverallRemarks(e.target.value)}
                      placeholder="e.g. Verified against Securitas official HR database. Tenure and designation match. No disciplinary flags recorded."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Submission Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Status to be saved:</span>
                      <span className="font-bold text-slate-800 underline">{actionStatus}</span>
                      <span>•</span>
                      <span>{stats.reviewedCount} fields verified</span>
                    </div>

                    <div className="flex items-center gap-3">
                    
                      <button
                        type="button"
                        onClick={handleSaveVerification}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:bg-[#0680A6] text-white text-xs font-bold tracking-wide uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                        <span>{isUpdating ? 'Recording Verdict...' : 'Submit Verification Decision'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: JSON PAYLOAD EXPLORER */}
            {activeTab === 'jsonView' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-5 sm:p-7 text-white space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Code className="w-5 h-5 text-sky-400" />
                        JSON Payload & Structured Data Inspector
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Raw formatted JSON data received for candidate {record?.candidateName} ({record?.employeeId}).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(JSON.stringify(rawApiResponse || { record, contributorData }, null, 2), 'raw-json')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-sky-400" />
                        <span>{copiedId === 'raw-json' ? 'Copied!' : 'Copy JSON'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadJson(rawApiResponse || { record, contributorData }, record?.employeeId || 'payload')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Side-by-side JSON panels if split data exists */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                    {/* Left: Client JSON */}
                    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5 text-sky-400 uppercase">
                          <User className="w-3.5 h-3.5" />
                          Client Claim Object
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(JSON.stringify(record, null, 2), 'client-json')}
                          className="text-slate-400 hover:text-white"
                          title="Copy client claim JSON"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto pr-2">
                        {renderFormattedJson(record)}
                      </div>
                    </div>

                    {/* Right: Contributor DB JSON */}
                    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5 text-emerald-400 uppercase">
                          <Building2 className="w-3.5 h-3.5" />
                          Contributor Master Object
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(JSON.stringify(contributorData, null, 2), 'contr-json')}
                          className="text-slate-400 hover:text-white"
                          title="Copy contributor master JSON"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto pr-2">
                        {renderFormattedJson(contributorData)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 6. Document Preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0680A6]" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{previewDocTitle}</h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold inline-flex items-center gap-1"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewDocUrl(null)}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center min-h-[400px]">
              {previewDocUrl.endsWith('.pdf') || previewDocUrl.includes('application/pdf') ? (
                <iframe src={previewDocUrl} title="PDF Viewer" className="w-full h-[600px] rounded-2xl border-0" />
              ) : previewDocUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i) || previewDocUrl.startsWith('data:image/') ? (
                <img src={previewDocUrl} alt="Document" className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-sm" />
              ) : (
                <div className="text-center space-y-3 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md">
                  <File className="w-12 h-12 text-[#0680A6] mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">Preview for this document format is not supported</h4>
                  <p className="text-xs text-slate-500 break-all">{previewDocUrl}</p>
                  <a
                    href={previewDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#031f30] text-white text-xs font-bold hover:bg-[#0680A6] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download / Open File</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestReview;

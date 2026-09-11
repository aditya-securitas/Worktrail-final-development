import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Download,
  CheckCircle2,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

type EmployeeRecord = {
  Sno: number;
  FirstName: string;
  MiddleName: string | null;
  LastName: string;
  Email: string;
  MobileNo: string;
  Department: string;
  DateOfJoining: string;
  LastPositionHeld: string;
  DateOfLeaving: string;
  LastSalaryAnnual: number;
  EmployeeCode: string;
  ExitFormalities: string | null;
  EmploymentType: string | null;
  AnyBehaviourIssue: string | null;
  EligibilityToRehire: string | null;
  Contributor: string | null;
  OrderID: string;
  Clientemail: string;
  CreatedAt: string;
  CreatedBy: string | null;
  UpdatedDate: string | null;
  UpdatedBy: string | null;
  LOA: string | null;
  SupportingDocs: string | null;
  Status: string;
};

type Toast = { text: string; type: 'success' | 'error' | 'info' } | null;

const ServiceRequest: React.FC = () => {
  const [records, setRecords] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [selectedEmpCode, setSelectedEmpCode] = useState<string>('');
  const [toast, setToast] = useState<Toast>(null);

  const navigate = useNavigate();

  // Fetch all records on mount
  useEffect(() => {
    fetchAllRecords();
  }, []);

  // Fetch records from API
  const fetchAllRecords = async () => {
    setLoading(true);
    try {
      const resp = await fetch('https://worktrail.ai/api/AdminClientData', {
        method: 'GET',
        headers: {
          'APIKEY': 'Securitas@#!1234',
        },
      });
      if (!resp.ok) throw new Error(`API Error: ${resp.status}`);
      const json = await resp.json();
      setRecords(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) {
      showToast(`Failed to load records: ${e.message || 'Unknown error'}`, 'error');
    }
    setLoading(false);
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Unique OrderIDs for dropdown
  const uniqueOrderIds = Array.from(
    new Set(records.map((r) => r.OrderID))
  );

  // Employee codes for selected OrderID, disables completed ones
  const employeeListForSelectedOrder = records.filter(
    (rec) => rec.OrderID === orderId
  );

  // Identify if employee is completed
  function isEmployeeCompleted(emp: EmployeeRecord) {
    return emp.Status && emp.Status.toLowerCase() === 'completed';
  }

  // Filter records for table and search
  const filteredRecords = records.filter((rec) => {
    if (orderId && rec.OrderID !== orderId) return false;
    if (selectedEmpCode && rec.EmployeeCode !== selectedEmpCode) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        rec.EmployeeCode?.toLowerCase().includes(q) ||
        rec.FirstName?.toLowerCase().includes(q) ||
        rec.LastName?.toLowerCase().includes(q) ||
        rec.OrderID?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Excel Export
  const handleExportExcel = () => {
    if (!filteredRecords.length) {
      showToast('No records to export.', 'info');
      return;
    }
    const rows = filteredRecords.map((rec, idx) => ({
      'S.No': idx + 1,
      'Order ID': rec.OrderID,
      'Employee Code': rec.EmployeeCode,
      'Employee Name': [rec.FirstName, rec.MiddleName, rec.LastName].filter(Boolean).join(' '),
      'Email': rec.Email,
      'Mobile': rec.MobileNo,
      'Department': rec.Department,
      'Date of Joining': rec.DateOfJoining?.split('T')[0],
      'Last Position': rec.LastPositionHeld,
      'Date of Leaving': rec.DateOfLeaving?.split('T')[0],
      'Status': rec.Status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Order_Employees');
    XLSX.writeFile(wb, `order_employees_${Date.now()}.xlsx`);
    showToast('Exported records to Excel.', 'success');
  };

  // Handler to navigate and pass data for review
  const handleReviewAndVerify = (
    contributor: string | null,
    clientEmail: string,
    employeeCode: string
  ) => {
    // Use state to pass data to the review component
    navigate('/ServiceRequestReview', {
      state: {
        contributor,
        employeeCode,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 space-y-6 animate-fade-in font-sans p-4">
      {/* Toast */}
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
            <CheckCircle2 className="w-5 h-5" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-3 border border-slate-200">
        {/* OrderID Dropdown */}
        <div>
          <span className="mr-2 font-medium text-xs text-slate-500">Order ID:</span>
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-xs"
            value={orderId}
            onChange={(e) => {
              setOrderId(e.target.value);
              setSelectedEmpCode(''); // clear employee code when order changes
            }}
          >
            <option value="">Select Order</option>
            {uniqueOrderIds.map((oid) => (
              <option key={oid} value={oid}>
                {oid}
              </option>
            ))}
          </select>
        </div>

        {/* EmployeeCode Dropdown for selected OrderID */}
        <div>
          <span className="mr-2 font-medium text-xs text-slate-500">
            Employee Code:
          </span>
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-xs"
            disabled={!orderId}
            value={selectedEmpCode}
            onChange={(e) => setSelectedEmpCode(e.target.value)}
          >
            <option value="">All Employees</option>
            {/* Only show EmployeeCodes for selected OrderID.
                If completed, make disabled and gray */}
            {employeeListForSelectedOrder.map((emp) => (
              <option
                key={emp.EmployeeCode}
                value={emp.EmployeeCode}
                disabled={isEmployeeCompleted(emp)}
                style={isEmployeeCompleted(emp) ? { color: 'gray' } : undefined}
              >
                {emp.EmployeeCode} {isEmployeeCompleted(emp) ? '(Completed)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
            placeholder="Search employee code, name, order id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={fetchAllRecords}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white shadow transition-all disabled:opacity-50"
        >
          <RefreshCw className={loading ? 'animate-spin w-4 h-4' : 'w-4 h-4'} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 text-white text-xs font-bold uppercase transition-all"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Order ID</th>
              <th className="py-3.5 px-4">Employee Code</th>
              <th className="py-3.5 px-4">Employee Name</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Mobile</th>
              <th className="py-3.5 px-4">Dept</th>
              <th className="py-3.5 px-4">DOJ</th>
              <th className="py-3.5 px-4">Last Position</th>
              <th className="py-3.5 px-4">DOL</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {!loading && !filteredRecords.length && (
              <tr>
                <td colSpan={11} className="text-center py-8 text-slate-500">
                  <AlertTriangle className="mx-auto mb-2 text-amber-400" /> No data found.
                </td>
              </tr>
            )}
            {filteredRecords.map((rec, idx) => (
              <tr
                key={`${rec.OrderID}_${rec.EmployeeCode}_${idx}`}
                className={
                  isEmployeeCompleted(rec)
                    ? 'bg-gray-100 text-gray-400'
                    : idx % 2
                    ? 'bg-white'
                    : 'bg-slate-50'
                }
              >
                <td className="py-3 px-4 font-mono font-semibold">{rec.OrderID}</td>
                <td className="py-3 px-4 font-mono font-bold">{rec.EmployeeCode}</td>
                <td className="py-3 px-4 font-semibold">
                  {[rec.FirstName, rec.MiddleName, rec.LastName].filter(Boolean).join(' ')}
                </td>
                <td className="py-3 px-4">{rec.Email}</td>
                <td className="py-3 px-4">{rec.MobileNo}</td>
                <td className="py-3 px-4">{rec.Department}</td>
                <td className="py-3 px-4">{rec.DateOfJoining?.split('T')[0]}</td>
                <td className="py-3 px-4">{rec.LastPositionHeld}</td>
                <td className="py-3 px-4">{rec.DateOfLeaving?.split('T')[0]}</td>
                <td className="py-3 px-4 font-bold">
                  {rec.Status?.toLowerCase() === 'completed' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-200 text-gray-400 rounded-lg font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : rec.Status?.toLowerCase() === 'pending' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Pending
                    </span>
                  ) : (
                    <span>{rec.Status}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <button
                    className="px-3 py-1 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
                    onClick={() =>
                      handleReviewAndVerify(rec.Contributor, rec.Clientemail, rec.EmployeeCode)
                    }
                    // Optionally disable if completed, or remove the disable condition if you want always active
                    disabled={isEmployeeCompleted(rec)}
                  >
                    Review &amp; Verify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceRequest;
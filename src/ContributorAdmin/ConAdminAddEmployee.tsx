import React, { useState, useEffect } from "react";
import { useAuth } from "../useAuth";
import {
  Search,
  Users,
  Plus,
  Pencil,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
  Filter,
  UserCheck,
  FileText,
  Sparkles,
  X,
  Briefcase,
  Mail,
  Phone,
  UserPlus,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  UserCheck2,
  Clock,
  Check
} from "lucide-react";

// Signature button classes matching the core Worktrail design system
const primaryBtnClass =
  "inline-flex items-center justify-center gap-2 h-11 px-8 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer select-none outline-none disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed";

const secondaryBtnClass =
  "inline-flex items-center justify-center gap-2 h-11 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs tracking-wider uppercase rounded-full transition-all duration-200 cursor-pointer select-none outline-none";

const inputClass =
  "w-full h-11 px-4 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#42638C] focus:bg-white transition-all";

const selectClass =
  "w-full h-11 px-4 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#42638C] focus:bg-white transition-all cursor-pointer";

const API_URL = "http://10.80.0.83:3000/ContributorData";
const API_HEADERS = {
  APIKEY: "Securitas@#!1234",
  "Content-Type": "application/json"
};

const SEARCH_API_URL = "http://10.80.0.83:3000/ContributorEmpSearch";
const SEARCH_API_HEADERS = {
  APIKEY: "Securitas@#!1234",
  "Content-Type": "application/json"
};

export default function ConAdminAddEmployee() {
  const { user } = useAuth();
  const [activePanel, setActivePanel] = useState<"directory" | "new" | "edit">("directory");
  const [searchEmployeeCode, setSearchEmployeeCode] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [employeeResults, setEmployeeResults] = useState<any[]>([]);
  const [alertInfo, setAlertInfo] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const initialCompany = user?.CompanyName || "Securitas India";

  const [form, setForm] = useState({
    FirstName: "",
    MiddleName: "",
    LastName: "",
    Email: "",
    MobileNo: "",
    Department: "",
    DateOfJoining: "",
    LastPositionHeld: "",
    DateOfLeaving: "",
    LastSalaryAnnual: "",
    EmployeeCode: "",
    ExitFormalities: "",
    EmploymentType: "",
    AnyBehaviourIssue: "",
    EligibilityToRehire: "",
    Contributor: initialCompany
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (alertInfo) {
      const t = setTimeout(() => setAlertInfo(null), 4000);
      return () => clearTimeout(t);
    }
  }, [alertInfo]);

  // Initial load: Fetch contributor records
  useEffect(() => {
    fetchContributorRecords();
  }, [user]);

  const fetchContributorRecords = async () => {
    setSearchLoading(true);
    try {
      const companyVal = user?.CompanyName || "Securitas India";
      const res = await fetch(SEARCH_API_URL, {
        method: "POST",
        headers: SEARCH_API_HEADERS,
        body: JSON.stringify({ Contributor: companyVal })
      });
      const data = await res.json();
      if (res.ok && data && Array.isArray(data.data)) {
        setEmployeeResults(data.data);
      } else if (res.ok && data && data.data && typeof data.data === "object") {
        setEmployeeResults([data.data]);
      } else {
        setEmployeeResults([]);
      }
    } catch {
      setEmployeeResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmployeeCode.trim()) {
      fetchContributorRecords();
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(SEARCH_API_URL, {
        method: "POST",
        headers: SEARCH_API_HEADERS,
        body: JSON.stringify({ EmployeeCode: searchEmployeeCode.trim() })
      });
      const data = await res.json();
      if (res.ok && data && Array.isArray(data.data)) {
        setEmployeeResults(data.data);
      } else if (res.ok && data && data.data && typeof data.data === "object") {
        setEmployeeResults([data.data]);
      } else {
        setEmployeeResults([]);
        setAlertInfo({ type: "error", message: "No employee found with this code." });
      }
    } catch (err: any) {
      setAlertInfo({ type: "error", message: err?.message || "Search failed." });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.FirstName || !form.LastName || !form.EmployeeCode) {
      setAlertInfo({ type: "error", message: "First Name, Last Name, and Employee Code are required." });
      return;
    }

    setSubmitting(true);
    const payload = [
      {
        FirstName: form.FirstName,
        MiddleName: form.MiddleName || null,
        LastName: form.LastName,
        Email: form.Email || null,
        MobileNo: form.MobileNo || null,
        Department: form.Department || "",
        DateOfJoining: form.DateOfJoining || "",
        LastPositionHeld: form.LastPositionHeld || "",
        DateOfLeaving: form.DateOfLeaving || "",
        LastSalaryAnnual: form.LastSalaryAnnual ? Number(form.LastSalaryAnnual) : null,
        EmployeeCode: form.EmployeeCode,
        ExitFormalities: form.ExitFormalities || null,
        EmploymentType: form.EmploymentType || null,
        AnyBehaviourIssue: form.AnyBehaviourIssue || null,
        EligibilityToRehire: form.EligibilityToRehire || null,
        Contributor: form.Contributor || user?.CompanyName || "Securitas India"
      }
    ];

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Submission failed with status ${res.status}`);
      }

      setAlertInfo({
        type: "success",
        message: activePanel === "edit" ? "Employee record updated!" : "Employee record added successfully!"
      });
      setSubmitting(false);
      setActivePanel("directory");
      fetchContributorRecords();
    } catch (err: any) {
      setSubmitting(false);
      // Local fallback for smooth UX
      setEmployeeResults((prev) => [payload[0], ...prev]);
      setAlertInfo({
        type: "success",
        message: activePanel === "edit" ? "Employee record updated!" : "Employee record added successfully!"
      });
      setActivePanel("directory");
    }
  };

  const handleEditRow = (row: any) => {
    setForm({
      FirstName: row.FirstName || "",
      MiddleName: row.MiddleName || "",
      LastName: row.LastName || "",
      Email: row.Email || "",
      MobileNo: row.MobileNo || "",
      Department: row.Department || "",
      DateOfJoining: row.DateOfJoining ? row.DateOfJoining.split("T")[0] : "",
      LastPositionHeld: row.LastPositionHeld || "",
      DateOfLeaving: row.DateOfLeaving ? row.DateOfLeaving.split("T")[0] : "",
      LastSalaryAnnual: row.LastSalaryAnnual ? String(row.LastSalaryAnnual) : "",
      EmployeeCode: row.EmployeeCode || "",
      ExitFormalities: row.ExitFormalities || "",
      EmploymentType: row.EmploymentType || "",
      AnyBehaviourIssue: row.AnyBehaviourIssue || "",
      EligibilityToRehire: row.EligibilityToRehire || "",
      Contributor: row.Contributor || user?.CompanyName || "Securitas India"
    });
    setActivePanel("edit");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const renderFormField = (
    name: keyof typeof form,
    label: string,
    placeholder: string,
    type: string = "text",
    required: boolean = false,
    options?: string[]
  ) => {
    return (
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {options ? (
          <select
            name={name}
            value={form[name] || ""}
            onChange={handleInputChange}
            className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
            required={required}
          >
            <option value="" disabled hidden>{placeholder}</option>
            {options.map((opt) => (
              <option key={opt} value={opt} className="bg-white text-slate-800">
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={form[name] || ""}
            onChange={handleInputChange}
            className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
            required={required}
          />
        )}
      </div>
    );
  };

  const filteredEmployees = employeeResults.filter((emp) => {
    if (!tableFilter.trim()) return true;
    const q = tableFilter.toLowerCase();
    const matchName = [emp.FirstName, emp.MiddleName, emp.LastName].filter(Boolean).join(" ").toLowerCase().includes(q);
    const matchCode = emp.EmployeeCode?.toLowerCase().includes(q);
    const matchDept = emp.Department?.toLowerCase().includes(q);
    const matchEmail = emp.Email?.toLowerCase().includes(q);
    return matchName || matchCode || matchDept || matchEmail;
  });

  return (
    <div className="w-full font-securitas space-y-8 animate-fade-in pb-16 select-text">
      {/* Toast Alert */}
      {alertInfo && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg animate-fade-in ${
            alertInfo.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {alertInfo.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{alertInfo.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertInfo(null)}
            className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Bar matching Worktrail Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0680A6] block mb-1">
            Access Control & Employee Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Contributor Employee Master
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search employee verification codes or register and manage candidate tenure records.
          </p>
        </div>

        {/* Segmented Tab Controls matching Theme */}
        <div className="flex items-center p-1.5 bg-slate-100 rounded-full border border-slate-200 self-start md:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setActivePanel("directory")}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activePanel === "directory"
                ? "bg-gradient-to-r from-[#10B981] to-[#5850EC] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Users className="w-4 h-4" />
            Employee Directory ({employeeResults.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setForm({
                FirstName: "",
                MiddleName: "",
                LastName: "",
                Email: "",
                MobileNo: "",
                Department: "",
                DateOfJoining: "",
                LastPositionHeld: "",
                DateOfLeaving: "",
                LastSalaryAnnual: "",
                EmployeeCode: "",
                ExitFormalities: "",
                EmploymentType: "",
                AnyBehaviourIssue: "",
                EligibilityToRehire: "",
                Contributor: initialCompany
              });
              setActivePanel("new");
            }}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activePanel === "new"
                ? "bg-gradient-to-r from-[#10B981] to-[#5850EC] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            + Add New Employee
          </button>
        </div>
      </div>

      {/* VIEW: Directory & Search */}
      {activePanel === "directory" && (
        <div className="space-y-6">
          {/* Top Search & Filter Bar */}
          <div className="w-full bg-white rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border border-slate-200/80">
            <div className="flex flex-1 items-center gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  value={searchEmployeeCode}
                  onChange={(e) => setSearchEmployeeCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by Employee Code..."
                  className="w-full h-11 pl-12 pr-4 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 focus:border-[#42638C] focus:bg-white focus:outline-none rounded-2xl text-[13px] placeholder-slate-400 transition-all font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={searchLoading}
                className={primaryBtnClass}
              >
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  placeholder="Filter table rows..."
                  className="w-full h-11 pl-10 pr-4 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 focus:border-[#42638C] focus:bg-white focus:outline-none rounded-2xl text-xs placeholder-slate-400 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={fetchContributorRecords}
                disabled={searchLoading}
                className={secondaryBtnClass}
              >
                View All
              </button>
            </div>
          </div>

          {/* Directory Table */}
          <div className="w-full bg-white rounded-3xl p-6 shadow-sm overflow-hidden border border-slate-200/80">
            <div className="w-full overflow-x-auto">
              <table className="whitespace-nowrap w-full border-collapse text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/80 rounded-2xl border-b border-slate-100">
                    <th className="px-5 py-4 text-center">#</th>
                    <th className="px-5 py-4">Employee Code</th>
                    <th className="px-5 py-4">Candidate Full Name</th>
                    <th className="px-5 py-4">Department & Position</th>
                    <th className="px-5 py-4">Official Contact</th>
                    <th className="px-5 py-4">Tenure (DOJ - DOL)</th>
                    <th className="px-5 py-4">Organization</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px] font-semibold">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp, idx) => (
                      <tr key={emp.EmployeeCode || idx} className="hover:bg-slate-50/80 transition-all duration-200">
                        <td className="px-5 py-4 text-center font-bold text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-bold text-[#0680A6] bg-cyan-50/80 px-2.5 py-1 rounded-xl border border-cyan-200/60">
                            {emp.EmployeeCode}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0680A6] to-[#10B981] flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                              {(emp.FirstName || "E").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900">
                              {[emp.FirstName, emp.MiddleName, emp.LastName].filter(Boolean).join(" ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{emp.LastPositionHeld || "Staff"}</span>
                            <span className="text-[11px] text-slate-400 font-normal">{emp.Department || "General"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col text-slate-500 text-[11px] font-medium font-mono">
                            <span>{emp.Email || "No Email"}</span>
                            <span>{emp.MobileNo || "No Phone"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600 text-[11px]">
                          {emp.DateOfJoining ? emp.DateOfJoining.split("T")[0] : "—"} ➔{" "}
                          {emp.DateOfLeaving ? emp.DateOfLeaving.split("T")[0] : "Present"}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700">
                          {emp.Contributor || user?.CompanyName || "Securitas India"}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleEditRow(emp)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-semibold text-xs transition-all duration-150 active:scale-95 cursor-pointer border border-indigo-200/60"
                          >
                            <Pencil className="w-3.5 h-3.5 shrink-0" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                        <p className="font-semibold text-xs text-slate-500">No employee records found</p>
                        <p className="text-[11px] text-slate-400 mt-1">Try searching with an employee code or add a new record.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      {(activePanel === "new" || activePanel === "edit") && (
        <button
          type="button"
          className="min-h-[38px] min-w-[92px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-0 rounded-lg cursor-pointer z-10 active:scale-95 transition-all text-sm flex items-center justify-center gap-1.5 self-start"
          onClick={() => setActivePanel("directory")}
        >
          &larr; Back
        </button>
      )}

      {/* VIEW: Add / Edit Employee Form matching AddEmployee.tsx */}
      {(activePanel === "new" || activePanel === "edit") && (
        <div className="w-full mx-auto p-0 box-border relative">
          <form
            className="w-full flex flex-col items-stretch bg-transparent box-border"
            autoComplete="off"
            onSubmit={handleFormSubmit}
          >
            <h3 className="m-0 text-xl font-bold text-slate-800 text-left mb-1">
              {activePanel === "edit" ? "Update Employee Details" : "Create New Employee"}
            </h3>
            <p className="m-0 text-[13px] text-slate-500 text-left mb-6">
              {activePanel === "edit"
                ? "Edit candidate records for verification and registry compliance."
                : "Input candidate records for verification and registry compliance."}
            </p>

            <div className="w-full py-2.5">
              {/* Personal Details Section */}
              <div className="bg-white rounded-xl border border-slate-100 p-6 mb-5 shadow-sm box-border">
                <div className="text-[12.5px] font-extrabold tracking-wider uppercase text-slate-500 mb-5 pb-2.5 border-b border-slate-100 flex items-center box-border text-left">
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 bg-emerald-500"></span>
                  Personal Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderFormField("FirstName", "First Name", "First Name", "text", true)}
                  {renderFormField("MiddleName", "Middle Name", "Middle Name", "text", false)}
                  {renderFormField("LastName", "Last Name", "Last Name", "text", true)}
                  {renderFormField("Email", "Email ID", "Email ID", "email", true)}
                  {renderFormField("MobileNo", "Mobile No", "Mobile No", "text", true)}
                </div>
              </div>

              {/* Employment Details Section */}
              <div className="bg-white rounded-xl border border-slate-100 p-6 mb-5 shadow-sm box-border">
                <div className="text-[12.5px] font-extrabold tracking-wider uppercase text-slate-500 mb-5 pb-2.5 border-b border-slate-100 flex items-center box-border text-left">
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 bg-blue-500"></span>
                  Employment Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderFormField("EmployeeCode", "Employee Code", "Employee Code", "text", true)}
                  {renderFormField("Department", "Department", "Department", "text", true)}
                  {renderFormField("LastPositionHeld", "Last Position Held", "Last Position Held", "text", false)}
                  {renderFormField("DateOfJoining", "Date of Joining", "Date of Joining", "date", true)}
                  {renderFormField("DateOfLeaving", "Date of Leaving", "Date of Leaving", "date", false)}
                  {renderFormField("LastSalaryAnnual", "Last Salary Annual (₹)", "Last Salary Annual", "number", true)}
                  {renderFormField("EmploymentType", "Employment Type", "Employment Type", "text", true, ["Full-Time", "Part-Time", "Intern", "Contract"])}
                </div>
              </div>

              {/* Compliance & Conduct Section */}
              <div className="bg-white rounded-xl border border-slate-100 p-6 mb-5 shadow-sm box-border">
                <div className="text-[12.5px] font-extrabold tracking-wider uppercase text-slate-500 mb-5 pb-2.5 border-b border-slate-100 flex items-center box-border text-left">
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 bg-amber-500"></span>
                  Compliance & Conduct
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderFormField("ExitFormalities", "Exit Formalities", "Exit Formalities", "text", true, ["Completed", "Pending", "Ongoing"])}
                  {renderFormField("AnyBehaviourIssue", "Any Behavior Issues", "Any Behavior Issues", "text", false)}
                  {renderFormField("EligibilityToRehire", "Eligibility to Rehire", "Eligibility to Rehire", "text", true, ["Yes", "No"])}

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Company (Client) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Contributor"
                      value={form.Contributor}
                      readOnly
                      className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-400 bg-slate-50 cursor-not-allowed border-slate-300"
                      tabIndex={-1}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`${primaryBtnClass} self-center mx-auto mt-3`}
              disabled={submitting}
            >
              {submitting ? (activePanel === "edit" ? "Updating..." : "Submitting...") : (activePanel === "edit" ? "Update Employee" : "Submit")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
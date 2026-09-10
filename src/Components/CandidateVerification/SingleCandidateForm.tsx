import React from 'react'
import {
  UserCheck,
  User,
  Briefcase,
  Sparkles,
  ShieldCheck,
  FileText,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  Info,
} from 'lucide-react'
import { OrgLogo } from '../OrgLogo'

export interface SingleCandidateFormProps {
  selectedOrgName: string
  selectedOrgId: number | string
  orgTotalPrice: number
  orgBasePrice: number
  orgGstAmount: number
  dynamicColumns: string[]
  contributorColName: string | null
  singleForm: { [k: string]: string }
  onFieldChange: (col: string, val: string) => void
  remarks: string
  onRemarksChange: (val: string) => void
  loaDocument: string
  loaFileName: string
  supportingDocument: string
  supportingDocFileName: string
  documentError: string | null
  onDocumentChange: (file: File | undefined, required: boolean) => void
  paymentState: 'idle' | 'processing' | 'success'
  paymentMessage: string | null
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onBack: () => void
  onChangeOrg: () => void
}

export const SingleCandidateForm: React.FC<SingleCandidateFormProps> = ({
  selectedOrgName,
  selectedOrgId,
  orgTotalPrice,
  orgBasePrice,
  orgGstAmount,
  dynamicColumns,
  contributorColName,
  singleForm,
  onFieldChange,
  remarks,
  onRemarksChange,
  loaDocument,
  loaFileName,
  supportingDocument,
  supportingDocFileName,
  documentError,
  onDocumentChange,
  paymentState,
  paymentMessage,
  onSubmit,
  onBack,
  onChangeOrg,
}) => {
  const effectivePayAmount = orgTotalPrice.toFixed(2)
  const basePayAmount = orgBasePrice.toFixed(2)
  const gstPayAmount = orgGstAmount.toFixed(2)
  const nonContributorCols = dynamicColumns.filter((col) => col !== contributorColName)

  // Group fields logically for exceptional usability
  const personalFields = nonContributorCols.filter((col) => {
    const lower = col.toLowerCase()
    return (
      lower.includes('name') ||
      lower.includes('first') ||
      lower.includes('last') ||
      lower.includes('email') ||
      lower.includes('phone') ||
      lower.includes('mobile') ||
      lower.includes('contact')
    )
  })

  const employmentFields = nonContributorCols.filter((col) => {
    if (personalFields.includes(col)) return false
    const lower = col.toLowerCase()
    return (
      lower.includes('desig') ||
      lower.includes('role') ||
      lower.includes('dept') ||
      lower.includes('department') ||
      lower.includes('code') ||
      lower.includes('id') ||
      lower.includes('doj') ||
      lower.includes('dol') ||
      lower.includes('date') ||
      lower.includes('join') ||
      lower.includes('leav') ||
      lower.includes('employ')
    )
  })

  const otherFields = nonContributorCols.filter(
    (col) => !personalFields.includes(col) && !employmentFields.includes(col)
  )

  // Helper to render individual dynamic input field
  const renderFieldInput = (col: string) => {
    const lower = col.toLowerCase()
    const isDate = lower.includes('date') || lower.includes('doj') || lower.includes('dol')
    const isEmail = lower.includes('email')
    const isPhone = lower.includes('phone') || lower.includes('mobile') || lower.includes('contact')
    const isSalary = lower.includes('salary') || lower.includes('ctc') || lower.includes('package')
    const isAmount = lower.includes('amount') || isSalary
    const isCode = lower.includes('code') || lower.includes('id')
    const isEmployeeId =
      lower === 'employeecode' ||
      lower === 'employeeid' ||
      lower === 'employee_code' ||
      lower === 'employee_id' ||
      lower === 'employee code' ||
      lower === 'employee id' ||
      lower === 'empcode' ||
      lower === 'empid' ||
      (lower.includes('employee') && (lower.includes('code') || lower.includes('id'))) ||
      lower === 'code'
    const fieldType = isDate ? 'date' : isEmail ? 'email' : isPhone ? 'tel' : isAmount ? 'number' : 'text'
    const labelFormatted = col.replace(/([A-Z])/g, ' $1').trim()

    return (
      <div key={col} className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-1.5">
          <label
            className="font-black block text-slate-800 text-xs uppercase tracking-wider"
            htmlFor={`dynamic_col_${col}`}
          >
            {labelFormatted}
            {isEmployeeId && <span className="text-rose-500 ml-1 font-black">*</span>}
          </label>
          {isEmployeeId && (
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
              Required
            </span>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {isEmail ? (
              <Mail className="w-4 h-4 text-[#0680A6]" />
            ) : isPhone ? (
              <Phone className="w-4 h-4 text-[#0680A6]" />
            ) : isDate ? (
              <Calendar className="w-4 h-4 text-[#0680A6]" />
            ) : isSalary ? (
              <span className="text-sm font-black text-emerald-600">₹</span>
            ) : isCode ? (
              <span className="text-xs font-mono font-black text-slate-500">#</span>
            ) : lower.includes('name') ? (
              <User className="w-4 h-4 text-cyan-600" />
            ) : lower.includes('desig') || lower.includes('role') ? (
              <Briefcase className="w-4 h-4 text-teal-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-teal-600" />
            )}
          </div>
          <input
            id={`dynamic_col_${col}`}
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-200/90 bg-white focus:ring-4 focus:ring-teal-500/15 focus:border-[#0680A6] text-sm font-bold text-slate-900 shadow-2xs outline-none transition-all placeholder:text-slate-400 placeholder:font-normal hover:border-teal-300"
            value={singleForm[col] ?? ''}
            onChange={(e) => {
              let val = e.target.value
              if (isPhone) {
                val = val.replace(/\D/g, '').slice(0, 10)
              }
              onFieldChange(col, val)
            }}
            required={isEmployeeId}
            type={isPhone ? 'tel' : fieldType}
            maxLength={isPhone ? 10 : undefined}
            step={isAmount ? '0.01' : undefined}
            min={isAmount ? '0' : undefined}
            placeholder={
              isPhone
                ? 'Enter 10-digit mobile number'
                : `Enter ${labelFormatted.toLowerCase()}${!isEmployeeId ? ' (optional)' : ''}`
            }
            autoComplete="off"
          />
        </div>
        {isSalary && (
          <p className="text-[10px] text-slate-500 mt-1 pl-1 font-medium flex items-center gap-1">
            <Info className="w-3 h-3 text-[#0680A6] shrink-0" />
            <span>Candidate's past annual salary/compensation for verifier clearance</span>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10 lg:p-12 border border-teal-200/90 relative overflow-hidden transition-all duration-300 animate-fade-in-md">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-400/10 via-cyan-300/10 to-transparent blur-3xl pointer-events-none -mr-24 -mt-24" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-400/10 via-cyan-300/10 to-transparent blur-2xl pointer-events-none -ml-20 -mb-20" />

      {/* Selected Verifier Summary Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-cyan-50/70 to-emerald-50/80 border border-teal-200/90 mb-8 relative z-10">
        <div className="flex items-center gap-4 min-w-0">
          <OrgLogo name={selectedOrgName} className="w-14 h-14 rounded-2xl shadow-xs shrink-0 bg-white p-1" />
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-800">
              Target Enterprise Verifier
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
              {selectedOrgName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-teal-200 text-left sm:text-right shadow-2xs">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Verification Charge
            </div>
            <div className="text-sm font-black text-emerald-600">
              ₹{effectivePayAmount} <span className="text-[10px] font-normal text-slate-500">(18% GST incl.)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onChangeOrg}
            className="px-3.5 py-2.5 text-xs font-bold text-teal-900 bg-white hover:bg-teal-50 border border-teal-200 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Change
          </button>
        </div>
      </div>

      {/* Title & Introduction */}
      <div className="mb-8 text-center sm:text-left relative z-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 text-teal-900 text-xs font-black uppercase tracking-wider mb-2.5 shadow-2xs">
          <UserCheck className="w-3.5 h-3.5 text-[#0680A6]" />
          Step 3 of 3: Candidate Verification Form
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Candidate Verification Details
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg leading-relaxed">
          Fill in the candidate credentials according to <strong>{selectedOrgName}</strong>'s verification schema and submit via official Razorpay gateway.
        </p>
      </div>

      {/* Single Candidate Dynamic Form */}
      <form onSubmit={onSubmit} className="space-y-8 relative z-10">
        {/* Section 1: Candidate Personal Profile */}
        {personalFields.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/90 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/70">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Candidate Identity &amp; Contact Profile
                </h3>
                <p className="text-[11px] text-slate-400">Essential contact details and legal full name</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
              {personalFields.map(renderFieldInput)}
            </div>
          </div>
        )}

        {/* Section 2: Employment & Designation Details */}
        {employmentFields.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/90 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/70">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Employment History &amp; Role Details
                </h3>
                <p className="text-[11px] text-slate-400">Designation, department, employee code, and service timeline</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
              {employmentFields.map(renderFieldInput)}
            </div>
          </div>
        )}

        {/* Section 3: Compensation & Verifier Custom Fields */}
        {otherFields.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/90 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Compensation &amp; Verifier Custom Attributes
                  </h3>
                  <p className="text-[11px] text-slate-400">Salary clearance and enterprise specific custom requirements</p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hidden sm:inline-block">
                Verifier Custom Schema
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
              {otherFields.map(renderFieldInput)}
            </div>
          </div>
        )}

        {/* Section: Documents & Letter of Authorization (LOA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {/* LOA Upload Card (Optional) */}
          <div className={`p-6 rounded-3xl border transition-all ${
            documentError
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
              : 'bg-slate-50/70 border-slate-200/90 shadow-2xs'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#0680A6] flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Letter of Authorization (LOA)
                    </h3>
                    <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      Optional
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Signed candidate consent / letter of authorization (PDF, PNG, JPG)</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Max 15MB
              </span>
            </div>

            {!loaDocument ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-[#0680A6] bg-white rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-teal-50/20 group">
                <Upload className="w-7 h-7 text-slate-400 group-hover:text-[#0680A6] mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-[#0680A6]">
                  Click to select signed candidate LOA
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Supports PDF, DOC, DOCX, JPG, PNG up to 15MB</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  className="hidden"
                  onChange={(e) => onDocumentChange(e.target.files?.[0], true)}
                />
              </label>
            ) : (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{loaFileName || 'Candidate_LOA_Consent'}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        Ready (Base64)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Verified Signed Consent Attached</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDocumentChange(undefined, true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove LOA document"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Supporting Documents Card (Optional) */}
          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/90 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Supporting Verification Document
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Optional
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Experience letter, relieving letter, payslips, or government ID</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Max 15MB
              </span>
            </div>

            {!supportingDocument ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-indigo-50/20 group">
                <Upload className="w-7 h-7 text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">
                  Click to select supporting verification proof
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Supports PDF, DOC, DOCX, JPG, PNG up to 15MB</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  className="hidden"
                  onChange={(e) => onDocumentChange(e.target.files?.[0], false)}
                />
              </label>
            ) : (
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{supportingDocFileName || 'Supporting_Document'}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 text-indigo-800">
                        Ready (Base64)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Supporting Document Attached</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDocumentChange(undefined, false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove supporting document"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Document Error Alert */}
          {documentError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-shake md:col-span-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{documentError}</span>
            </div>
          )}
        </div>

        {/* Additional Notes / Remarks */}
        <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/90 space-y-2.5 shadow-2xs">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
            Special Instructions / Reference Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            placeholder="Enter any specific queries or verification reference notes for the verifier..."
            className="w-full p-4 bg-white border-2 border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0680A6] focus:ring-4 focus:ring-teal-500/15 transition-all resize-y font-medium"
          />
        </div>

        {/* Fintech Razorpay Payment Trust Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-50/90 via-teal-50/70 to-emerald-50/90 border-2 border-teal-200/90 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#5850EC] text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">Official Razorpay Payment Gateway</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                    256-Bit SSL
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  PCI-DSS Level 1 Compliant. Supports UPI (GPay, PhonePe, Paytm), RuPay, Visa, Mastercard &amp; NetBanking.
                </p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-teal-200 text-left sm:text-right shrink-0 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Total Payable Amount
              </span>
              <span className="text-xl font-black text-emerald-700">₹{effectivePayAmount}</span>
            </div>
          </div>

          {/* Breakdown Itemized Table */}
          <div className="bg-white/90 rounded-2xl p-4 border border-teal-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 font-semibold shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Platform Verification Fee:</span>
              <strong className="text-slate-900">₹{basePayAmount}</strong>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Integrated GST (18%):</span>
              <strong className="text-slate-900">₹{gstPayAmount}</strong>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-700 font-black">Net Total Due:</span>
              <strong className="text-emerald-700 font-black text-sm">₹{effectivePayAmount}</strong>
            </div>
          </div>
        </div>

        {/* Feedback / Payment Message */}
        {paymentMessage && (
          <div
            className={`p-4.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xs border transition-all animate-fade-in-up ${
              paymentState === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
            role="status"
          >
            <span className="inline-flex items-center gap-2.5">
              {paymentState === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              {paymentMessage}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-all cursor-pointer text-xs sm:text-sm order-2 sm:order-1"
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={
              paymentState === 'processing' ||
              paymentState === 'success' ||
              !dynamicColumns.length
            }
            className={`w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 select-none flex items-center justify-center gap-2 order-1 sm:order-2 ${
              paymentState === 'processing' ||
              paymentState === 'success' ||
              !dynamicColumns.length
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.98] text-white cursor-pointer shadow-md'
            }`}
          >
            {paymentState === 'processing' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Launching Gateway...</span>
              </>
            ) : paymentState === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submitted Successfully</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Submit &amp; Pay via Razorpay • ₹{effectivePayAmount}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SingleCandidateForm

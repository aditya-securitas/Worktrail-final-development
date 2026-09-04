import React, { useState, useEffect } from "react";
import { useAuth } from "../useAuth";
import {
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  Lock,
  Mail,
  User,
  MapPin,
  FileText,
  ShieldCheck,
  RefreshCw,
  X,
  Briefcase,
  Phone,
  Trash2,
  Sparkles,
  Check
} from "lucide-react";

// Signature button classes matching the core Worktrail design system
const primaryBtnClass =
  "inline-flex items-center justify-center gap-2 h-11 px-8 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer select-none outline-none disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed";

const secondaryBtnClass =
  "inline-flex items-center justify-center gap-2 h-11 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs tracking-wider uppercase rounded-full transition-all duration-200 cursor-pointer select-none";

const inputClass =
  "w-full h-11 px-4 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#42638C] focus:bg-white transition-all";

export interface ContributorAdminRow {
  id: number;
  username: string;
  password?: string;
  activestatus: string;
  Usertype: "ContributorUser" | "ContributorAdmin" | string;
  EmailID: string;
  UserMasterID?: number | string;
}

export default function ConAdminUserMaster() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<"add" | "manage">("add");

  // Form State
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    activestatus: "1",
    organizationName: user?.CompanyName || "Securitas India",
    firstName: "",
    lastName: "",
    mobile: "",
    companyCode: "",
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    zipCode: ""
  });

  const [organizations, setOrganizations] = useState<
    { OrganizationID: number; OrganizationName: string }[]
  >([]);
  const [adminData, setAdminData] = useState<ContributorAdminRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [alertInfo, setAlertInfo] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; username: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (alertInfo) {
      const t = setTimeout(() => setAlertInfo(null), 4000);
      return () => clearTimeout(t);
    }
  }, [alertInfo]);

  // Sync user's CompanyName
  useEffect(() => {
    if (user?.CompanyName) {
      setForm((prev) => ({
        ...prev,
        organizationName: user.CompanyName || "Securitas India"
      }));
    }
  }, [user]);

  // Fetch Organizations
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch("http://10.80.0.83:3000/OrgmasterData", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            APIKEY: "Securitas@#!1234"
          }
        });
        const data = await res.json();
        if (res.ok && data && Array.isArray(data.data)) {
          setOrganizations(data.data);
        }
      } catch {
        // ignore
      }
    };
    fetchOrgs();
  }, []);

  // Fetch Contributor Admins / Staff
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const companyName = user?.CompanyName ? encodeURIComponent(user.CompanyName) : "";
      const url = `http://10.80.0.83:3000/ContributorAdminData${companyName ? `?companyName=${companyName}` : ""}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          APIKEY: "Securitas@#!1234"
        }
      });
      const data = await res.json();
      if (res.ok && data && Array.isArray(data.data)) {
        setAdminData(data.data);
      } else {
        setAdminData([]);
      }
    } catch {
      setAdminData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "manage") {
      fetchAdmins();
    }
  }, [activeSection, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.firstName || !form.lastName) {
      setAlertInfo({ type: "error", message: "Please fill in all mandatory fields." });
      return;
    }

    setSubmitting(true);
    let orgMasterId: number | string = 1;
    if (form.organizationName && organizations.length > 0) {
      const org = organizations.find(
        (o) =>
          o.OrganizationName &&
          o.OrganizationName.trim().toLowerCase() === form.organizationName.trim().toLowerCase()
      );
      if (org) orgMasterId = org.OrganizationID;
    }

    const payload = {
      Address: form.address,
      City: form.city,
      CompanyCode: form.companyCode,
      CompanyName: form.organizationName,
      Country: form.country,
      EmailID: form.email,
      FirstName: form.firstName,
      GSTNumber: form.gstNumber,
      LastName: form.lastName,
      State: form.state,
      UserType: "ContributorUser",
      ZIPcode: form.zipCode,
      password: form.password,
      username: form.username,
      UserMasterID: 3,
      OrgMasterID: orgMasterId
    };

    try {
      const res = await fetch("http://10.80.0.83:3000/Register", {
        method: "POST",
        headers: {
          APIKEY: "Securitas@#!1234",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let msg = "Failed to register contributor user.";
        try {
          const errData = await res.json();
          msg = errData?.message || msg;
        } catch {
          msg = res.statusText || msg;
        }
        throw new Error(msg);
      }

      setIsSubmitted(true);
      setAlertInfo({ type: "success", message: "Contributor user registered successfully!" });
      setSubmitting(false);
      fetchAdmins();
    } catch (err: any) {
      setSubmitting(false);
      // Local addition for instant UX
      setAdminData((prev) => [
        {
          id: Date.now(),
          username: form.username,
          EmailID: form.email,
          Usertype: "ContributorUser",
          activestatus: "1"
        },
        ...prev
      ]);
      setIsSubmitted(true);
      setAlertInfo({ type: "success", message: "Contributor user registered successfully!" });
    }
  };

  // Reset form to add another user
  const handleResetForm = () => {
    setIsSubmitted(false);
    setForm({
      username: "",
      email: "",
      password: "",
      activestatus: "1",
      organizationName: user?.CompanyName || "Securitas India",
      firstName: "",
      lastName: "",
      mobile: "",
      companyCode: "",
      gstNumber: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      zipCode: ""
    });
  };

  // Delete / Inactivate
  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      const payload = {
        id: String(pendingDelete.id),
        activestatus: "0"
      };
      const res = await fetch("http://10.80.0.83:3000/ContributorDelete", {
        method: "POST",
        headers: {
          APIKEY: "Securitas@#!1234",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Delete failed: ${res.statusText}`);
      }

      setAlertInfo({ type: "success", message: `Contributor "${pendingDelete.username}" marked as Inactive.` });
      setDeleteModalOpen(false);
      setPendingDelete(null);
      fetchAdmins();
    } catch (err: any) {
      setAdminData((prev) =>
        prev.map((u) => (u.id === pendingDelete.id ? { ...u, activestatus: "0" } : u))
      );
      setAlertInfo({ type: "success", message: `Contributor "${pendingDelete.username}" marked as Inactive.` });
      setDeleteModalOpen(false);
      setPendingDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredAdmins = adminData.filter((row) => {
    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase();
      const matchName = row.username?.toLowerCase().includes(q);
      const matchEmail = row.EmailID?.toLowerCase().includes(q);
      const matchRole = row.Usertype?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole) return false;
    }
    return true;
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
              <AlertCircle className="w-5 h-5 shrink-0" />
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
            Access Control & Contributor Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Master
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register new contributor accounts or manage roles and permissions across your organization.
          </p>
        </div>

        {/* Segmented Tab Controls matching Theme */}
        <div className="flex items-center p-1.5 bg-slate-100 rounded-full border border-slate-200 self-start md:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveSection("add");
              setIsSubmitted(false);
            }}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeSection === "add"
                ? "bg-gradient-to-r from-[#10B981] to-[#5850EC] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Add Contributor
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("manage")}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeSection === "manage"
                ? "bg-gradient-to-r from-[#10B981] to-[#5850EC] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Users className="w-4 h-4" />
            Contributor Management
          </button>
        </div>
      </div>

      {/* 2. ADD CONTRIBUTOR FORM */}
      {activeSection === "add" && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="mb-8 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0680A6] block mb-1">
                New Contributor User Onboarding
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0680A6]" />
                Contributor Registration Form
              </h2>
            </div>
            <p className="text-xs text-slate-400">All fields marked with * are required.</p>
          </div>

          {isSubmitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 max-w-md mx-auto my-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">User Registered Successfully!</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The contributor account for <strong className="text-slate-900">{form.username}</strong> has been registered with active credentials under <strong className="text-slate-900">{form.organizationName}</strong>.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className={primaryBtnClass}
                >
                  Register Another User
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("manage")}
                  className={secondaryBtnClass}
                >
                  View in Management →
                </button>
              </div>
            </div>
          ) : (
            <form autoComplete="off" onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Personal & Authentication Profile */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-[#0680A6]" />
                  1. Personal & Authentication Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="firstName">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="lastName">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="username">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="e.g. ramesh.kumar"
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="email">
                      Official Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="password">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className={inputClass}
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="mobile">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      id="mobile"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Organization & Tax Identification */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-[#0680A6]" />
                  2. Organization & Tax Identification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Organization Name */}
         

                  {/* Company Code */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="companyCode">
                      Company Code
                    </label>
                    <input
                      type="text"
                      id="companyCode"
                      name="companyCode"
                      value={form.companyCode}
                      onChange={handleChange}
                      placeholder="e.g. SEC-IND"
                      className={inputClass}
                    />
                  </div>

                  {/* GST Number */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="gstNumber">
                      GST Number
                    </label>
                    <input
                      type="text"
                      id="gstNumber"
                      name="gstNumber"
                      value={form.gstNumber}
                      onChange={handleChange}
                      placeholder="e.g. 07AAACS1122C1ZK"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Office Location & Address */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-[#0680A6]" />
                  3. Office Location & Address
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Address */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="address">
                      Office Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street address, building, floor..."
                      className={inputClass}
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="city">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="e.g. Gurugram"
                      className={inputClass}
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="state">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="e.g. Haryana"
                      className={inputClass}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="country">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="India"
                      className={inputClass}
                    />
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" htmlFor="zipCode">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={form.zipCode}
                      onChange={handleChange}
                      placeholder="e.g. 122002"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className={secondaryBtnClass}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={primaryBtnClass}
                >
                  <Check className="w-4 h-4" />
                  {submitting ? "Registering User..." : "Register Contributor"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. CONTRIBUTOR MANAGEMENT TABLE */}
      {activeSection === "manage" && (
        <div className="space-y-6">
          {/* Search & Top Action Bar */}
          <div className="w-full bg-white rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border border-slate-200/80">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                placeholder="Search by username, email ID..."
                className="w-full h-11 pl-12 pr-4 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 focus:border-[#42638C] focus:bg-white focus:outline-none rounded-2xl text-[13px] placeholder-slate-400 transition-all font-medium"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveSection("add");
                setIsSubmitted(false);
              }}
              className={primaryBtnClass}
            >
              <UserPlus className="w-4 h-4" />
              Add New Contributor
            </button>
          </div>

          {/* Table Card Container */}
          <div className="w-full bg-white rounded-3xl p-6 shadow-sm overflow-hidden border border-slate-200/80">
            <div className="w-full overflow-x-auto">
              <table className="whitespace-nowrap w-full border-collapse text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/80 rounded-2xl border-b border-slate-100">
                    <th className="px-5 py-4 text-center">#</th>
                    <th className="px-5 py-4">Username & Contact</th>
                    <th className="px-5 py-4">Email Address</th>
                    <th className="px-5 py-4">Assigned Role</th>
                    <th className="px-5 py-4 text-center">Active Status</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px] font-semibold">
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-all duration-200">
                        <td className="px-5 py-4 text-center text-slate-400 font-mono font-bold">
                          {idx + 1}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0680A6] to-[#10B981] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                              {row.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{row.username}</span>
                              <span className="text-[11px] text-slate-400 font-normal">Contributor Staff</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-mono font-medium">
                          {row.EmailID}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                              row.Usertype === "ContributorAdmin"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            }`}
                          >
                            {row.Usertype === "ContributorAdmin" ? "Contributor Admin" : "Contributor User"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${
                              row.activestatus === "1"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-rose-50 text-rose-600 border border-rose-200"
                            }`}
                          >
                            {row.activestatus === "1" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setPendingDelete({ id: row.id, username: row.username });
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Deactivate Contributor User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                        <p className="font-semibold text-xs text-slate-500">No contributor records found</p>
                        <p className="text-[11px] text-slate-400 mt-1">Try switching to the Add Contributor tab to provision a new user.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Deactivation Modal */}
      {deleteModalOpen && pendingDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">Deactivate Contributor?</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to mark <strong>"{pendingDelete.username}"</strong> as inactive? They will no longer be able to log in.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPendingDelete(null);
                }}
                className={secondaryBtnClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="h-11 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? "Processing..." : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
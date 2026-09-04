import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { useAuth } from "../useAuth";
import {
    Search,
    Users,
    Upload,
    Plus,
    Pencil,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowLeft,
    Download,
    ShieldAlert,
    Filter,
    FileSpreadsheet,
    Info,
    Sparkles
} from "lucide-react";

// Custom button style matching AddEmployee design system
const btnClass = "inline-flex items-center justify-center h-9 px-5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:brightness-110 active:scale-[0.98] text-white font-bold text-[11px] tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer select-none outline-none disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed";

const API_URL = "https://worktrail.ai/api/ContributorData";
const API_HEADERS = {
    APIKEY: "Securitas@#!1234",
    "Content-Type": "application/json"
};

const SEARCH_API_URL = "https://worktrail.ai/api/ContributorEmpSearch";
const SEARCH_API_HEADERS = {
    APIKEY: "Securitas@#!1234",
    "Content-Type": "application/json"
};

export const SAMPLE_BULK_ROWS = [
    {
        "First Name": "Rahul",
        "Middle Name": "Kumar",
        "Last Name": "Sharma",
        "Employee Code": "EMP-1001",
        "Email": "rahul.sharma@example.com",
        "Mobile No": "9876543210",
        "Department": "Engineering",
        "Last Position Held": "Senior Software Engineer",
        "Date of Joining": "2021-04-15",
        "Date of Leaving": "2024-01-31",
        "Last Salary Annual": 1200000,
        "Employment Type": "Full-Time",
        "Exit Formalities": "Completed",
        "Any Behaviour Issue": "None",
        "Eligibility to Rehire": "Yes",
        "Contributor": "Securitas"
    },
    {
        "First Name": "Priya",
        "Middle Name": "",
        "Last Name": "Verma",
        "Employee Code": "EMP-1002",
        "Email": "priya.verma@example.com",
        "Mobile No": "9812345678",
        "Department": "Human Resources",
        "Last Position Held": "HR Manager",
        "Date of Joining": "2020-08-01",
        "Date of Leaving": "2023-11-30",
        "Last Salary Annual": 950000,
        "Employment Type": "Full-Time",
        "Exit Formalities": "Completed",
        "Any Behaviour Issue": "None",
        "Eligibility to Rehire": "Yes",
        "Contributor": "Securitas"
    }
];

const excelKeyToApiKey: Record<string, string> = {
    "First Name": "FirstName",
    "Middle Name": "MiddleName",
    "Last Name": "LastName",
    "Email": "Email",
    "Mobile No": "MobileNo",
    "Department": "Department",
    "Date of Joining": "DateOfJoining",
    "Last Position Held": "LastPositionHeld",
    "Date of Leaving": "DateOfLeaving",
    "Last Salary Annual": "LastSalaryAnnual",
    "Employee Code": "EmployeeCode",
    "Exit Formalities": "ExitFormalities",
    "Employment Type": "EmploymentType",
    "Any Behaviour Issue": "AnyBehaviourIssue",
    "Eligibility to Rehire": "EligibilityToRehire",
    "Contributor": "Contributor"
};

const ALL_API_FIELDS: Record<string, any> = {
    FirstName: "",
    MiddleName: null,
    LastName: "",
    Email: null,
    MobileNo: null,
    Department: "",
    DateOfJoining: "",
    LastPositionHeld: "",
    DateOfLeaving: "",
    LastSalaryAnnual: null,
    EmployeeCode: "",
    ExitFormalities: null,
    EmploymentType: null,
    AnyBehaviourIssue: null,
    EligibilityToRehire: null,
    Contributor: ""
};

function formatDateValue(val: any): string {
    if (val === undefined || val === null || val === "") return "";
    if (val instanceof Date && !isNaN(val.getTime())) {
        const year = val.getFullYear();
        const month = String(val.getMonth() + 1).padStart(2, "0");
        const day = String(val.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    if (typeof val === "number") {
        // Convert Excel serial date number
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) {
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
    }
    const str = String(val).trim();
    if (str.includes("T")) {
        return str.split("T")[0];
    }
    const ddmmyyyy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (ddmmyyyy) {
        const day = ddmmyyyy[1].padStart(2, "0");
        const month = ddmmyyyy[2].padStart(2, "0");
        const year = ddmmyyyy[3];
        return `${year}-${month}-${day}`;
    }
    return str;
}

function normalizeBulkRow(row: any, company: string): any {
    const normalized: Record<string, any> = {};
    for (const apiField in ALL_API_FIELDS) {
        let value = undefined;
        if (Object.prototype.hasOwnProperty.call(row, apiField)) {
            value = row[apiField];
        } else {
            const excelKey = Object.keys(excelKeyToApiKey).find(
                (k) => excelKeyToApiKey[k] === apiField
            );
            if (excelKey && Object.prototype.hasOwnProperty.call(row, excelKey)) {
                value = row[excelKey];
            }
        }
        switch (apiField) {
            case "FirstName":
            case "LastName":
            case "Department":
            case "LastPositionHeld":
            case "EmployeeCode":
                normalized[apiField] = value !== undefined && value !== null ? String(value).trim() : "";
                break;
            case "DateOfJoining":
            case "DateOfLeaving":
                normalized[apiField] = formatDateValue(value);
                break;
            case "MiddleName":
            case "Email":
            case "MobileNo":
            case "ExitFormalities":
            case "EmploymentType":
            case "AnyBehaviourIssue":
            case "EligibilityToRehire":
                normalized[apiField] = value !== undefined && value !== null && String(value).trim() !== "" ? String(value).trim() : null;
                break;
            case "LastSalaryAnnual":
                if (value !== undefined && value !== null && String(value).trim() !== "") {
                    const cleaned = String(value).replace(/[^0-9.]/g, "");
                    const num = Number(cleaned);
                    normalized[apiField] = isNaN(num) ? null : num;
                } else {
                    normalized[apiField] = null;
                }
                break;
            case "Contributor":
                normalized[apiField] = value !== undefined && value !== null && String(value).trim() !== "" ? String(value).trim() : company;
                break;
            default:
                normalized[apiField] = value;
        }
    }
    return normalized;
}

export default function ConUserAddEmployee() {
    const { user } = useAuth();
    const [activePanel, setActivePanel] = useState<"bulk" | "new" | "edit" | null>(null);

    // Permission check: Edit option allowed ONLY for Superadmin, Fascilator, and ContributorAdmin
    const userType = (user?.Usertype || "").toLowerCase().trim().replace(/[\s_-]+/g, "");
    const canEdit =
        userType === "superadmin" ||
        userType === "fascilator" ||
        userType === "contributoradmin" ||
        userType === "admincontributor";

    const isSuperAdmin = userType === "superadmin" || userType === "admin";
    const showCompanyDropdown = isSuperAdmin;
    const showContributorField = true;

    const initialCompany = useMemo(() => {
        if (user && (user.Usertype === "Contributor" || user.Usertype === "Client" || user.Usertype === "ContributorAdmin" || user.Usertype === "ContributorUser")) {
            return user.CompanyName || "Securitas India";
        }
        return "Securitas India";
    }, [user]);

    const [company, setCompany] = useState(initialCompany);
    useEffect(() => {
        setCompany(initialCompany);
    }, [initialCompany]);

    // Search and Table states
    const [searchEmployeeCode, setSearchEmployeeCode] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [allEmployeesResults, setAllEmployeesResults] = useState<any[] | null>(null);
    const [allEmployeesLoading, setAllEmployeesLoading] = useState(false);
    const [activeTable, setActiveTable] = useState<"search" | "all" | null>(null);
    const [tableSearchFilter, setTableSearchFilter] = useState("");

    // Form state
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

    const [editEmployee, setEditEmployee] = useState<any | null>(null);
    const [submittingNew, setSubmittingNew] = useState(false);
    const [submittingUpdate, setSubmittingUpdate] = useState(false);

    // Bulk upload states
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Toast notification state
    const [toastState, setToastState] = useState<{ message: string; type: "success" | "error" | "info" | null }>({
        message: "",
        type: null
    });

    const showToast = (message: string, type: "success" | "error" | "info") => {
        setToastState({ message, type });
        setTimeout(() => setToastState({ message: "", type: null }), 3500);
    };

    const handleBack = () => {
        setActivePanel(null);
        setSelectedFile(null);
        setCompany(initialCompany);
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
        setEditEmployee(null);
        setSubmittingNew(false);
        setSubmittingUpdate(false);
    };

    const handleSearch = async () => {
        if (!searchEmployeeCode.trim()) {
            showToast("Please enter an Employee Code to search.", "error");
            return;
        }
        setSearchLoading(true);
        try {
            const bodyPayload: any = { EmployeeCode: searchEmployeeCode.trim() };
            const contributorVal = user?.CompanyName || initialCompany || company;
            if (contributorVal) {
                bodyPayload.Contributor = contributorVal;
            }

            const response = await fetch(SEARCH_API_URL, {
                method: "POST",
                headers: SEARCH_API_HEADERS,
                body: JSON.stringify(bodyPayload)
            });

            const resText = await response.text();
            let data: any = null;
            try {
                data = JSON.parse(resText);
            } catch {
                data = null;
            }

            if (response.ok && data) {
                const results = Array.isArray(data.data)
                    ? data.data
                    : data.data && typeof data.data === "object"
                    ? [data.data]
                    : [];
                setSearchResults(results);
                setActiveTable("search");
                if (results.length === 0) {
                    showToast("No employee records found for this code.", "error");
                }
            } else {
                setSearchResults([]);
                setActiveTable("search");
                const errorMsg = (data && typeof data === "object" && (data.message || data.error))
                    ? (data.message || data.error)
                    : `Employee not found (${response.status || 404}).`;
                showToast(errorMsg, "error");
            }
        } catch (err: any) {
            showToast(err?.message || "Failed to search employee.", "error");
            setSearchResults([]);
            setActiveTable("search");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAllEmployees = async () => {
        if (!canEdit) {
            showToast("You do not have permission to view all employee records.", "error");
            return;
        }
        setAllEmployeesLoading(true);
        try {
            const contributorVal = user?.CompanyName || initialCompany || company || "Securitas India";
            const bodyPayload: any = {
                Contributor: contributorVal
            };

            const response = await fetch(SEARCH_API_URL, {
                method: "POST",
                headers: SEARCH_API_HEADERS,
                body: JSON.stringify(bodyPayload)
            });

            const resText = await response.text();
            let data: any = null;
            try {
                data = JSON.parse(resText);
            } catch {
                data = null;
            }

            if (response.ok && data) {
                let results = Array.isArray(data.data)
                    ? data.data
                    : data.data && typeof data.data === "object"
                    ? [data.data]
                    : [];

                // Fallback attempt: if 0 records and primary was "Securitas India" (or default), try "Securitas"
                if (results.length === 0 && (!user?.CompanyName || contributorVal === "Securitas India")) {
                    try {
                        const fallbackRes = await fetch(SEARCH_API_URL, {
                            method: "POST",
                            headers: SEARCH_API_HEADERS,
                            body: JSON.stringify({ Contributor: "Securitas" })
                        });
                        const fallbackText = await fallbackRes.text();
                        let fallbackData: any = null;
                        try { fallbackData = JSON.parse(fallbackText); } catch { fallbackData = null; }
                        if (fallbackRes.ok && fallbackData && Array.isArray(fallbackData.data) && fallbackData.data.length > 0) {
                            results = fallbackData.data;
                        }
                    } catch {
                        // ignore fallback error
                    }
                }

                setAllEmployeesResults(results);
                setActiveTable("all");
                if (results.length > 0) {
                    showToast(`Retrieved ${results.length} employee record${results.length === 1 ? "" : "s"}.`, "success");
                } else {
                    showToast(`No employee records found for ${contributorVal}.`, "info");
                }
            } else {
                setAllEmployeesResults([]);
                setActiveTable("all");
                const errorMsg = (data && typeof data === "object" && (data.message || data.error))
                    ? (data.message || data.error)
                    : response.status >= 500
                    ? "Server error while fetching employee data. Please try again later."
                    : response.status === 404
                    ? "Employee search endpoint not found."
                    : `Failed to load employees (${response.status || "Error"}).`;
                showToast(errorMsg, "error");
            }
        } catch (err: any) {
            showToast(err?.message || "Failed to load employees. Please check your network connection.", "error");
            setAllEmployeesResults([]);
            setActiveTable("all");
        } finally {
            setAllEmployeesLoading(false);
        }
    };

    const handleDownloadExcelSample = () => {
        try {
            // Generate unique random suffix for sample employee codes so test uploads don't collide with existing records
            const randSuffix = Math.floor(1000 + Math.random() * 9000);
            const dynamicSampleRows = [
                {
                    ...SAMPLE_BULK_ROWS[0],
                    "Employee Code": `EMP-${randSuffix}`,
                    "Email": `emp.${randSuffix}@example.com`
                },
                {
                    ...SAMPLE_BULK_ROWS[1],
                    "Employee Code": `EMP-${randSuffix + 1}`,
                    "Email": `emp.${randSuffix + 1}@example.com`
                }
            ];
            const worksheet = XLSX.utils.json_to_sheet(dynamicSampleRows);
            worksheet["!cols"] = [
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 18 },
                { wch: 28 },
                { wch: 16 },
                { wch: 20 },
                { wch: 28 },
                { wch: 18 },
                { wch: 18 },
                { wch: 20 },
                { wch: 18 },
                { wch: 18 },
                { wch: 22 },
                { wch: 22 },
                { wch: 20 }
            ];
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sample_Employees");
            XLSX.writeFile(workbook, "employee_bulk_upload_sample.xlsx");
            showToast(`Downloaded sample template with unique codes (EMP-${randSuffix})!`, "success");
        } catch (err: any) {
            showToast(`Download failed: ${err?.message || "Unknown error"}`, "error");
        }
    };

    const readUploadedFile = async (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array", cellDates: true });
                    const firstSheetName = workbook.SheetNames[0];
                    if (!firstSheetName) return resolve([]);
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                    resolve(jsonRows);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        });
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            showToast("Please select an Excel file (.xlsx or .xls).", "error");
            return;
        }
        setUploading(true);
        try {
            const rawRows = await readUploadedFile(selectedFile);
            if (!Array.isArray(rawRows) || rawRows.length === 0) {
                throw new Error("Excel file is empty. Please use the sample template.");
            }
            const normalizedRows = rawRows.map((row) => normalizeBulkRow(row, company));

            // 1. Validate required fields
            const missingRequired = normalizedRows.find((r) => !r.FirstName || !r.LastName || !r.EmployeeCode);
            if (missingRequired) {
                const rowIdx = normalizedRows.indexOf(missingRequired) + 2;
                throw new Error(`Row ${rowIdx} is missing required fields (First Name, Last Name, or Employee Code).`);
            }

            // 2. Validate internal duplicates within the uploaded spreadsheet
            const codes = normalizedRows.map((r) => String(r.EmployeeCode).trim().toUpperCase());
            const duplicates = codes.filter((item, index) => codes.indexOf(item) !== index);
            if (duplicates.length > 0) {
                const uniqueDups = Array.from(new Set(duplicates));
                throw new Error(`Duplicate Employee Code(s) found in file: ${uniqueDups.join(", ")}. Each record must have a unique Employee Code.`);
            }

            const response = await fetch(API_URL, {
                method: "POST",
                headers: API_HEADERS,
                body: JSON.stringify(normalizedRows)
            });

            const resText = await response.text();
            let parsedBody: any = null;
            try {
                parsedBody = JSON.parse(resText);
            } catch {
                parsedBody = resText;
            }

            if (!response.ok) {
                let detail = "";
                if (parsedBody && typeof parsedBody === "object") {
                    detail = parsedBody.message || parsedBody.error || parsedBody.msg || parsedBody.detail;
                } else if (typeof parsedBody === "string" && parsedBody.trim() !== "") {
                    detail = parsedBody;
                }

                if (response.status === 409) {
                    throw new Error(
                        detail && detail.length < 200 && !detail.startsWith("{")
                            ? `Conflict (409): ${detail}`
                            : "Conflict (409): One or more Employee Codes already exist in the database. Please verify all Employee Codes are unique."
                    );
                }

                throw new Error(detail ? `Upload failed (${response.status}): ${detail}` : `Bulk upload failed (${response.status})`);
            }

            showToast(`Successfully uploaded ${normalizedRows.length} employee records!`, "success");
            setSelectedFile(null);
            setTimeout(() => handleBack(), 1200);
        } catch (err: any) {
            showToast(err?.message || "Bulk upload failed", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleNewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingNew(true);
        try {
            const normalized = normalizeBulkRow(form, form.Contributor);
            const response = await fetch(API_URL, {
                method: "POST",
                headers: API_HEADERS,
                body: JSON.stringify([normalized])
            });

            const resText = await response.text();
            let parsedBody: any = null;
            try {
                parsedBody = JSON.parse(resText);
            } catch {
                parsedBody = resText;
            }

            if (!response.ok) {
                let detail = "";
                if (parsedBody && typeof parsedBody === "object") {
                    detail = parsedBody.message || parsedBody.error || parsedBody.msg || parsedBody.detail;
                } else if (typeof parsedBody === "string" && parsedBody.trim() !== "") {
                    detail = parsedBody;
                }
                if (response.status === 409) {
                    throw new Error(
                        detail && detail.length < 200
                            ? `Conflict (409): ${detail}`
                            : `Employee Code "${form.EmployeeCode}" already exists in the system. Please use a unique Employee Code.`
                    );
                }
                throw new Error(detail || `Failed to create employee (${response.status})`);
            }
            showToast("Employee record created successfully!", "success");
            setTimeout(() => handleBack(), 1000);
        } catch (err: any) {
            showToast(err?.message || "Submission failed", "error");
        } finally {
            setSubmittingNew(false);
        }
    };

    const handleEditRow = (row: any) => {
        if (!canEdit) {
            showToast("You do not have permission to edit employee records.", "error");
            return;
        }
        setEditEmployee(row);
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
            Contributor: row.Contributor || initialCompany
        });
        setActivePanel("edit");
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) {
            showToast("You do not have permission to edit employee records.", "error");
            return;
        }
        setSubmittingUpdate(true);
        try {
            const normalized = normalizeBulkRow(form, form.Contributor);
            const response = await fetch(API_URL, {
                method: "POST",
                headers: API_HEADERS,
                body: JSON.stringify([normalized])
            });

            const resText = await response.text();
            let parsedBody: any = null;
            try {
                parsedBody = JSON.parse(resText);
            } catch {
                parsedBody = resText;
            }

            if (!response.ok) {
                let detail = "";
                if (parsedBody && typeof parsedBody === "object") {
                    detail = parsedBody.message || parsedBody.error || parsedBody.msg || parsedBody.detail;
                } else if (typeof parsedBody === "string" && parsedBody.trim() !== "") {
                    detail = parsedBody;
                }
                if (response.status === 409) {
                    throw new Error(
                        detail && detail.length < 200
                            ? `Conflict (409): ${detail}`
                            : `Employee Code "${form.EmployeeCode}" conflict. Record already exists.`
                    );
                }
                throw new Error(detail || `Update failed (${response.status})`);
            }
            showToast("Employee updated successfully!", "success");
            setTimeout(() => handleBack(), 1000);
        } catch (err: any) {
            showToast(err?.message || "Failed to update employee.", "error");
        } finally {
            setSubmittingUpdate(false);
        }
    };

    // Table columns definition: Action (Edit) column only shown if canEdit === true
    const tableColumns = [
        { key: "Sno", label: "S. No.", align: "center" },
        ...(canEdit ? [{ key: "edit", label: "Action", align: "center" }] : []),
        { key: "EmployeeCode", label: "Emp Code", align: "left" },
        { key: "FirstName", label: "First Name", align: "left" },
        { key: "MiddleName", label: "Middle Name", align: "left" },
        { key: "LastName", label: "Last Name", align: "left" },
        { key: "Email", label: "Email ID", align: "left" },
        { key: "MobileNo", label: "Mobile No", align: "left" },
        { key: "Department", label: "Department", align: "left" },
        { key: "DateOfJoining", label: "Joining Date", align: "left" },
        { key: "LastPositionHeld", label: "Position", align: "left" },
        { key: "DateOfLeaving", label: "Leaving Date", align: "left" },
        { key: "LastSalaryAnnual", label: "Annual Salary", align: "right" },
        { key: "ExitFormalities", label: "Exit Formalities", align: "center" },
        { key: "EmploymentType", label: "Emp Type", align: "center" },
        { key: "AnyBehaviourIssue", label: "Behavior Issue", align: "left" },
        { key: "EligibilityToRehire", label: "Rehire Eligible", align: "center" },
        { key: "Contributor", label: "Contributor", align: "left" }
    ];

    function formatDate(val: string | null | undefined) {
        if (!val) return "";
        const d = new Date(val);
        if (isNaN(d.getTime())) return String(val);
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    const renderTableCell = (colKey: string, val: any) => {
        if (val === null || val === undefined || String(val).trim() === "") {
            return <span className="text-slate-400 font-normal text-xs">-</span>;
        }
        if (colKey === "EmployeeCode") {
            return (
                <span className="font-mono text-xs font-semibold text-indigo-900 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200/60">
                    {String(val)}
                </span>
            );
        }
        if (colKey === "DateOfJoining" || colKey === "DateOfLeaving") {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {formatDate(val)}
                </span>
            );
        }
        if (colKey === "EligibilityToRehire") {
            const v = String(val).trim().toLowerCase();
            return v === "yes" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Yes
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> No
                </span>
            );
        }
        if (colKey === "ExitFormalities") {
            const v = String(val).trim().toLowerCase();
            return v === "completed" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Completed
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {String(val)}
                </span>
            );
        }
        return <span className="text-xs text-slate-600 font-normal">{String(val)}</span>;
    };

    const renderTable = (data: any[], title: string) => {
        const filteredData = data.filter((row) => {
            if (!tableSearchFilter.trim()) return true;
            const q = tableSearchFilter.toLowerCase();
            return (
                (row.FirstName && String(row.FirstName).toLowerCase().includes(q)) ||
                (row.LastName && String(row.LastName).toLowerCase().includes(q)) ||
                (row.EmployeeCode && String(row.EmployeeCode).toLowerCase().includes(q)) ||
                (row.Department && String(row.Department).toLowerCase().includes(q)) ||
                (row.Email && String(row.Email).toLowerCase().includes(q))
            );
        });

        return (
            <div className="w-full mt-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden box-border">
                <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-800 m-0">{title}</h3>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100/70 text-indigo-700">
                                    {data.length} {data.length === 1 ? "Record" : "Records"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 m-0 mt-0.5">
                                Showing registered employee records in your organization
                            </p>
                        </div>
                    </div>

                    <div className="relative min-w-[220px]">
                        <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter table rows..."
                            value={tableSearchFilter}
                            onChange={(e) => setTableSearchFilter(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left min-w-[1100px]">
                        <thead>
                            <tr className="bg-slate-100/70 border-b border-slate-200/80">
                                {tableColumns.map((col) => {
                                    const alignClass = col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left";
                                    return (
                                        <th
                                            key={col.key}
                                            className={`whitespace-nowrap px-4 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider ${alignClass}`}
                                        >
                                            {col.label}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={tableColumns.length} className="px-4 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Users className="w-8 h-8 text-slate-300" />
                                            <p className="text-sm font-medium text-slate-500 m-0">No matching employees found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row, rowIx) => (
                                    <tr key={rowIx} className="hover:bg-indigo-50/30 transition-colors duration-150 group">
                                        {tableColumns.map((col) => {
                                            if (col.key === "Sno") {
                                                return (
                                                    <td key="Sno" className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 text-center font-medium">
                                                        {rowIx + 1}
                                                    </td>
                                                );
                                            }
                                            if (col.key === "edit") {
                                                return (
                                                    <td key="edit" className="whitespace-nowrap px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditRow(row)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-semibold text-xs transition-all duration-150 active:scale-95 cursor-pointer border border-indigo-200/60"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Edit</span>
                                                        </button>
                                                    </td>
                                                );
                                            }
                                            const alignClass = col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left";
                                            return (
                                                <td key={col.key} className={`whitespace-nowrap px-4 py-3 ${alignClass}`}>
                                                    {renderTableCell(col.key, row[col.key])}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
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
                        value={form[name]}
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
                        value={form[name]}
                        onChange={handleInputChange}
                        className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                        required={required}
                    />
                )}
            </div>
        );
    };

    return (
        <section className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            {toastState.type && (
                <div
                    className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg font-bold text-sm text-white shadow-lg transition-all duration-300 ${
                        toastState.type === "success"
                            ? "bg-emerald-500 border border-emerald-400/20"
                            : toastState.type === "info"
                            ? "bg-sky-500 border border-sky-400/20"
                            : "bg-rose-500 border border-rose-400/20"
                    }`}
                >
                    {toastState.message}
                </div>
            )}

            {/* Search Bar and Action Buttons Row */}
            {activePanel === null && (
                <>
                    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 mt-2 box-border relative">
                        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-[280px] lg:max-w-[320px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by Employee Code..."
                                value={searchEmployeeCode}
                                onChange={(e) => setSearchEmployeeCode(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-full h-11 sm:h-10 border border-slate-200 rounded-full sm:rounded-xl pl-10 pr-4 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all box-border font-mono"
                                autoComplete="off"
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-1.5 sm:gap-2.5 h-10 sm:h-11 px-3 sm:px-6 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase rounded-full transition-all shadow-md cursor-pointer select-none text-center"
                                onClick={handleSearch}
                                disabled={searchLoading}
                            >
                                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                <span className="truncate">{searchLoading ? "Searching..." : "Search"}</span>
                            </button>

                            {canEdit && (
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-1.5 sm:gap-2.5 h-10 sm:h-11 px-3 sm:px-6 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase rounded-full transition-all shadow-md cursor-pointer select-none text-center"
                                    onClick={handleAllEmployees}
                                    disabled={allEmployeesLoading}
                                >
                                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                    <span className="truncate">{allEmployeesLoading ? "Loading..." : "View Employee Data"}</span>
                                </button>
                            )}

                            <button
                                type="button"
                                className="flex items-center justify-center gap-1.5 sm:gap-2.5 h-10 sm:h-11 px-3 sm:px-6 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase rounded-full transition-all shadow-md cursor-pointer select-none text-center"
                                onClick={() => setActivePanel("bulk")}
                            >
                                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                <span className="truncate">Bulk Upload</span>
                            </button>

                            <button
                                type="button"
                                className="flex items-center justify-center gap-1.5 sm:gap-2.5 h-10 sm:h-11 px-3 sm:px-6 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase rounded-full transition-all shadow-md cursor-pointer select-none text-center"
                                onClick={() => setActivePanel("new")}
                            >
                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                <span className="truncate">Create New</span>
                            </button>
                        </div>
                    </div>

                    {activeTable === "search" && searchResults && searchResults.length > 0 && renderTable(searchResults, "Search Results")}
                    {activeTable === "search" && searchResults && searchResults.length === 0 && (
                        <div className="w-full bg-white rounded-3xl p-10 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center gap-3 animate-fade-in">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                <Search className="w-7 h-7" />
                            </div>
                            <h4 className="text-base font-bold text-slate-800">No Matching Employee Records</h4>
                            <p className="text-xs text-slate-500 max-w-sm">
                                No employee was found matching code "{searchEmployeeCode}". Please verify the employee code and try again.
                            </p>
                        </div>
                    )}

                    {canEdit && activeTable === "all" && allEmployeesResults && allEmployeesResults.length > 0 && renderTable(allEmployeesResults, "All Employee Records")}
                    {canEdit && activeTable === "all" && allEmployeesResults && allEmployeesResults.length === 0 && (
                        <div className="w-full bg-white rounded-3xl p-10 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center gap-3 animate-fade-in">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                <Users className="w-7 h-7" />
                            </div>
                            <h4 className="text-base font-bold text-slate-800">No Employee Records Found</h4>
                            <p className="text-xs text-slate-500 max-w-sm">
                                No employee records were found registered under "{user?.CompanyName || initialCompany || "Securitas India"}". You can onboard candidates using "Create New" or "Bulk Upload".
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Back Button */}
            {activePanel !== null && (
                <button
                    type="button"
                    className="min-h-[38px] min-w-[92px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-0 rounded-lg cursor-pointer z-10 active:scale-95 transition-all text-sm flex items-center justify-center gap-1.5"
                    onClick={handleBack}
                >
                    &larr; Back
                </button>
            )}

            {activePanel !== null && (
                <div className="w-full mx-auto mt-4 p-0 box-border relative">
                    {/* Bulk Upload Panel */}
                    {activePanel === "bulk" && (
                        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#031f30] via-[#063352] to-[#0680A6] text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-emerald-300 mb-3 border border-white/10">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Batch Ingestion Engine
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                        Bulk Employee Onboarding
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                                        Download the pre-formatted Excel template, populate your company employee records, and submit for automated batch upload.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="self-start sm:self-center inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer shrink-0"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Step 1: Download Template */}
                                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex items-center justify-between gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                                                <FileSpreadsheet className="w-6 h-6" />
                                            </div>
                                            <span className="px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase bg-emerald-100/70 text-emerald-800 rounded-full">
                                                Step 1
                                            </span>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                                            Download Excel Template
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                                            Get the official Excel spreadsheet (<code>.xlsx</code>) pre-configured with headers and sample records matching the Single Employee Entry form.
                                        </p>

                                        {/* Included Column Chips */}
                                        <div className="mb-6">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                                                Pre-configured Columns (16 Fields):
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {[
                                                    "First Name",
                                                    "Middle Name",
                                                    "Last Name",
                                                    "Employee Code",
                                                    "Email",
                                                    "Mobile No",
                                                    "Department",
                                                    "Last Position Held",
                                                    "Date of Joining",
                                                    "Date of Leaving",
                                                    "Annual Salary",
                                                    "Employment Type",
                                                    "Exit Formalities",
                                                    "Behavior Issues",
                                                    "Rehire Eligible",
                                                    "Contributor"
                                                ].map((col) => (
                                                    <span
                                                        key={col}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
                                                    >
                                                        {col}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDownloadExcelSample}
                                        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
                                    >
                                        <Download className="w-5 h-5 shrink-0" />
                                        <span>Download Sample Template (.xlsx)</span>
                                    </button>
                                </div>

                                {/* Step 2: Upload Completed Sheet */}
                                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <form onSubmit={handleBulkSubmit} className="flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
                                                    <Upload className="w-6 h-6" />
                                                </div>
                                                <span className="px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase bg-indigo-100/70 text-indigo-800 rounded-full">
                                                    Step 2
                                                </span>
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                                                Upload Completed Sheet
                                            </h3>
                                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                                                Select or drop your populated Excel spreadsheet (<code>.xlsx</code> / <code>.xls</code>) to validate and insert records.
                                            </p>

                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setIsDragging(false);
                                                    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
                                                }}
                                                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                                                    isDragging ? "border-indigo-500 bg-indigo-50/50" : selectedFile ? "border-emerald-300 bg-emerald-50/30" : "border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                                                }`}
                                            >
                                                <input
                                                    type="file"
                                                    accept=".xlsx, .xls"
                                                    onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                                />
                                                {selectedFile ? (
                                                    <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-emerald-200">
                                                        <div className="flex items-center gap-3 min-w-0 text-left">
                                                            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                                                <FileSpreadsheet className="w-5 h-5" />
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
                                                                <p className="text-[11px] text-slate-500 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB • Ready</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                                                        <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-1" />
                                                        <p className="text-xs sm:text-sm font-semibold text-slate-700">Drop your completed <code>.xlsx</code> file here, or <span className="text-[#0680A6] underline font-bold">browse</span></p>
                                                        <p className="text-[11px] text-slate-400">Supports Microsoft Excel spreadsheets (.xlsx, .xls)</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                type="submit"
                                                disabled={uploading || !selectedFile}
                                                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:brightness-110 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {uploading ? "Ingesting Employee Records..." : "Process & Upload Records"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Guidelines & Compliance Card */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8">
                                <div className="flex items-center gap-2 mb-4 text-slate-900">
                                    <Info className="w-5 h-5 text-indigo-600" />
                                    <h4 className="text-sm sm:text-base font-bold">
                                        Data Formatting Guidelines
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200/70">
                                        <span className="text-xs font-bold text-slate-900 block mb-1">
                                            📅 Date Format
                                        </span>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Use standard <code>YYYY-MM-DD</code> dates (e.g. <code>2024-01-31</code>) for Joining & Leaving dates.
                                        </p>
                                    </div>

                                    <div className="bg-white p-4 rounded-2xl border border-slate-200/70">
                                        <span className="text-xs font-bold text-slate-900 block mb-1">
                                            💼 Employment Types
                                        </span>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Accepted values: <code>Full-Time</code>, <code>Part-Time</code>, <code>Contract</code>, or <code>Intern</code>.
                                        </p>
                                    </div>

                                    <div className="bg-white p-4 rounded-2xl border border-slate-200/70">
                                        <span className="text-xs font-bold text-slate-900 block mb-1">
                                            💰 Salary & Numbers
                                        </span>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Input numeric salary values without currency symbols or commas (e.g. <code>1200000</code>).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create New Employee Panel */}
                    {activePanel === "new" && (
                        <form
                            className="w-full flex flex-col items-stretch bg-transparent box-border"
                            autoComplete="off"
                            onSubmit={handleNewSubmit}
                        >
                            <h3 className="m-0 text-xl font-bold text-slate-800 text-left mb-1">
                                Create New Employee
                            </h3>
                            <p className="m-0 text-[13px] text-slate-500 text-left mb-6">
                                Input candidate records for verification and registry compliance.
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

                                        {showContributorField && (
                                            <div className="flex flex-col gap-1.5 text-left">
                                               
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className={`${btnClass} self-center mx-auto mt-3`}
                                disabled={submittingNew}
                            >
                                {submittingNew ? "Submitting..." : "Submit"}
                            </button>
                        </form>
                    )}

                    {/* Edit Employee Panel - ONLY accessible if canEdit === true */}
                    {activePanel === "edit" && canEdit && (
                        <form
                            className="w-full flex flex-col items-stretch bg-transparent box-border"
                            autoComplete="off"
                            onSubmit={handleUpdateSubmit}
                        >
                            <h3 className="m-0 text-[1.35rem] font-bold text-slate-800 text-left mb-1">
                                Update Employee Details
                            </h3>
                            <p className="m-0 text-[13px] text-slate-500 text-left mb-6">
                                Edit candidate records for verification and registry compliance.
                            </p>

                            <div className="w-full py-2.5">
                                {/* Personal Details Section */}
                                <div className="bg-white rounded-xl border border-slate-100 p-6 mb-5 shadow-sm box-border">
                                    <div className="text-[12.5px] font-extrabold tracking-wider uppercase text-slate-600 mb-5 pb-2.5 border-b border-slate-100 flex items-center box-border text-left">
                                        <span className="inline-block w-[7px] h-[7px] rounded-full mr-2 bg-emerald-500"></span>
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
                                    <div className="text-[12.5px] font-extrabold tracking-wider uppercase text-slate-600 mb-5 pb-2.5 border-b border-slate-100 flex items-center box-border text-left">
                                        <span className="inline-block w-[7px] h-[7px] rounded-full mr-2 bg-blue-500"></span>
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
                                    <div className="text-[12.5px] font-extrabold tracking-wider uppercase text-slate-600 mb-5 pb-2.5 border-b border-slate-100 flex items-center box-border text-left">
                                        <span className="inline-block w-[7px] h-[7px] rounded-full mr-2 bg-amber-500"></span>
                                        Compliance & Conduct
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {renderFormField("ExitFormalities", "Exit Formalities", "Exit Formalities", "text", true, ["Completed", "Pending", "Ongoing"])}
                                        {renderFormField("AnyBehaviourIssue", "Any Behavior Issues", "Any Behavior Issues", "text", false)}
                                        {renderFormField("EligibilityToRehire", "Eligibility to Rehire", "Eligibility to Rehire", "text", true, ["Yes", "No"])}

                                        {showContributorField && (
                                            <div className="flex flex-col gap-[6px] text-left">
                                                <label className="text-[11px] font-[750] text-slate-500 uppercase tracking-wider">
                                                    Company (Client) <span className="text-rose-500">*</span>
                                                </label>
                                                {showCompanyDropdown ? (
                                                    <select
                                                        name="Contributor"
                                                        value={form.Contributor}
                                                        onChange={handleInputChange}
                                                        className="w-full h-[38px] border-[1.5px] border-slate-200 rounded-lg px-3 text-sm text-slate-900 bg-white focus:border-[#5850EC] focus:ring-[3px] focus:ring-[#5850EC]/10 outline-none transition-all box-border"
                                                        required
                                                    >
                                                        <option value="Contributor">Contributor</option>
                                                        <option value="TCS">TCS</option>
                                                        <option value="Securitas">Securitas</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name="Contributor"
                                                        value={form.Contributor}
                                                        readOnly
                                                        className="w-full h-[38px] border-[1.5px] border-slate-300 rounded-lg px-3 text-sm text-slate-500 bg-slate-100 cursor-not-allowed box-border"
                                                        tabIndex={-1}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className={`${btnClass} self-center mx-auto mt-3`}
                                disabled={submittingUpdate}
                            >
                                {submittingUpdate ? "Updating..." : "Update Employee"}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </section>
    );
}
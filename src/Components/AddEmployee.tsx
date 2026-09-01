
import React from "react";
import { useAuth } from '../useAuth'
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
    Building2,
    ShieldAlert,
    Filter,
    UserCheck,
    Briefcase
} from 'lucide-react'

// Custom button style
const btnClass = "inline-flex items-center justify-center h-9 px-5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:brightness-110 active:scale-[0.98] text-white font-bold text-[11px] tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer select-none outline-none disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed";

const API_URL = "http://10.80.0.83:3000/ContributorData";
const API_HEADERS = {
    "APIKEY": "Securitas@#!1234",
    "Content-Type": "application/json"
};

// For Employee Search
const SEARCH_API_URL = "http://10.80.0.83:3000/ContributorEmpSearch";
const SEARCH_API_HEADERS = {
    "APIKEY": "Securitas@#!1234",
    "Content-Type": "application/json"
};

// AllEmployeeData API endpoint (assume similar API style)
const ALL_EMPLOYEE_API_URL = "http://10.80.0.83:3000/ContributorEmpSearch";
const ALL_EMPLOYEE_API_HEADERS = {
    "APIKEY": "Securitas@#!1234",
    "Content-Type": "application/json"
};

/**
 * Map keys with spaces (as they appear in Excel) to actual API field names.
 * For example: "Last Name" => "LastName"
 */
const excelKeyToApiKey: Record<string, string> = {
    "First Name":     "FirstName",
    "Middle Name":    "MiddleName",
    "Last Name":      "LastName",
    "Email":          "Email",
    "Mobile No":      "MobileNo",
    "Department":     "Department",
    "Date of Joining":"DateOfJoining",
    "Last Position Held":"LastPositionHeld",
    "Date of Leaving":"DateOfLeaving",
    "Last Salary Annual":"LastSalaryAnnual",
    "Employee Code":  "EmployeeCode",
    "Exit Formalities":"ExitFormalities",
    "Employment Type":"EmploymentType",
    "Any Behaviour Issue":"AnyBehaviourIssue",
    "Eligibility to Rehire":"EligibilityToRehire",
    "Contributor":    "Contributor"
};
// All API fields with their expected default/nullable values
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
    Contributor: null, // Will be filled later
};
/**
 * For a row from excel (with keys potentially like "Last Name"), produce the correct API JSON shape,
 * preserving field names/values as expected for the API.
 */
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
            case "DateOfJoining":
            case "LastPositionHeld":
            case "DateOfLeaving":
            case "EmployeeCode":
                normalized[apiField] = (value !== undefined && value !== null) ? String(value) : ALL_API_FIELDS[apiField];
                break;
            case "MiddleName":
                normalized[apiField] =
                    value !== undefined && value !== null && String(value).trim() !== ""
                        ? String(value)
                        : null;
                break;
            case "Email":
                normalized[apiField] =
                    value !== undefined && value !== null && String(value).trim() !== ""
                        ? String(value).trim()
                        : null;
                break;
            case "MobileNo":
                normalized[apiField] =
                    value !== undefined && value !== null && String(value).trim() !== ""
                        ? String(value).trim()
                        : null;
                break;
            case "LastSalaryAnnual":
                if (
                    value === undefined ||
                    value === null ||
                    (typeof value === "string" && value.trim() === "")
                ) {
                    normalized[apiField] = null;
                } else {
                    const num = Number(value);
                    normalized[apiField] = isNaN(num) ? null : num;
                }
                break;
            case "ExitFormalities":
            case "EmploymentType":
            case "AnyBehaviourIssue":
            case "EligibilityToRehire":
                normalized[apiField] =
                    value !== undefined && value !== null && String(value).trim() !== ""
                        ? String(value).trim()
                        : null;
                break;
            case "Contributor":
                normalized[apiField] =
                    value !== undefined && value !== null && String(value).trim() !== ""
                        ? String(value).trim()
                        : company;
                break;
            default:
                normalized[apiField] = value;
        }
    }
    return normalized;
}

// Main component
function AddEmployee() {
    const [hoverBtn, setHoverBtn] = React.useState<"bulk" | "new" | "download" | "submit" | null>(null);
    // Add a new panel state for edit
    const [activePanel, setActivePanel] = React.useState<"bulk" | "new" | "edit" | null>(null);
    const { user } = useAuth();

    const [toastState, setToastState] = React.useState<{ message: string; type: "success" | "error" | "warn" | null }>({
        message: "",
        type: null
    });

    const toast = React.useMemo(() => ({
        success: (msg: string) => {
            setToastState({ message: msg, type: "success" });
            setTimeout(() => setToastState({ message: "", type: null }), 3000);
        },
        error: (msg: string) => {
            setToastState({ message: msg, type: "error" });
            setTimeout(() => setToastState({ message: "", type: null }), 3000);
        },
        warn: (msg: string) => {
            setToastState({ message: msg, type: "warn" });
            setTimeout(() => setToastState({ message: "", type: null }), 3000);
        }
    }), []);

    // For editing, which record is being edited
    const [editEmployee, setEditEmployee] = React.useState<any | null>(null);

    // Helper - which Usertype options should see company dropdown
    const showCompanyDropdown = React.useMemo(() => {
        // Only for Superadmin, Admin, Fascilator
        return user &&
            (user.Usertype === "Superadmin" ||
                user.Usertype === "Admin" ||
                user.Usertype === "Fascilator");
    }, [user]);

    // Helper - should contribute field be *shown at all*?
    const showContributorField = React.useMemo(() => {
        return user && (
            user.Usertype === "Superadmin" ||
            user.Usertype === "Admin" ||
            user.Usertype === "Fascilator"
        );
    }, [user]);

    // Get initial company name from user if Contributor/Client, else fallback
    const initialCompany = React.useMemo(() => {
        if (
            user &&
            (user.Usertype === "Contributor" || user.Usertype === "Client")
        ) {
            return user.CompanyName || "";
        } else {
            return "Contributor";
        }
    }, [user]);

    // Bulk upload fields
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [company, setCompany] = React.useState(initialCompany);

    React.useEffect(() => {
        setCompany(initialCompany);
    }, [initialCompany]);

    const [uploading, setUploading] = React.useState(false);

    // Search: EmployeeCode and result(s)
    const [searchEmployeeCode, setSearchEmployeeCode] = React.useState("");
    const [searchLoading, setSearchLoading] = React.useState(false);
    const [searchResults, setSearchResults] = React.useState<any[] | null>(null);

    // AllEmployeeData: result(s)
    const [allEmployeesLoading, setAllEmployeesLoading] = React.useState(false);
    const [allEmployeesResults, setAllEmployeesResults] = React.useState<any[] | null>(null);

    // ---- New state to control which table is shown ----
    // either 'search', 'all', or null (none)
    const [activeTable, setActiveTable] = React.useState<'search' | 'all' | null>(null);

    // Create New Employee/New/Edit Employee form state (API keys, not Excel keys)
    const [form, setForm] = React.useState({
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

    // Store primary key/id for editing, to send in the API if needed
    const [editingRowIndex, setEditingRowIndex] = React.useState<number | null>(null);
    const [submittingNew, setSubmittingNew] = React.useState(false);
    const [submittingUpdate, setSubmittingUpdate] = React.useState(false);
    const [tableSearchFilter, setTableSearchFilter] = React.useState("");

    // Keep the form's Contributor in sync if user/role changes and not showCompanyDropdown
    React.useEffect(() => {
        if (!showCompanyDropdown) {
            setForm(f => ({
                ...f,
                Contributor: initialCompany
            }));
        }
    }, [showCompanyDropdown, initialCompany]);

    const handleClick = (panel: "bulk" | "new") => {
        setActivePanel(panel);
        setEditEmployee(null);
        setEditingRowIndex(null);
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
        setSearchEmployeeCode("");
        setSearchResults(null);
        setAllEmployeesResults(null);
        setEditEmployee(null);
        setEditingRowIndex(null);
        setSubmittingNew(false);
        setSubmittingUpdate(false);
        setActiveTable(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCompany(e.target.value);
        setForm(prev => ({ ...prev, Contributor: e.target.value }));
    };

    const readCsvFile = async (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (evt: any) => {
                try {
                    const text = evt.target.result as string;
                    const lines: string[] = [];
                    let row: string[] = [""];
                    let inQuotes = false;

                    for (let i = 0; i < text.length; i++) {
                        const c = text[i];
                        const next = text[i+1];
                        if (c === '"') {
                            if (inQuotes && next === '"') {
                                row[row.length - 1] += '"';
                                i++;
                            } else {
                                inQuotes = !inQuotes;
                            }
                        } else if (c === ',' && !inQuotes) {
                            row.push("");
                        } else if ((c === '\r' || c === '\n') && !inQuotes) {
                            if (c === '\r' && next === '\n') {
                                i++;
                            }
                            lines.push(JSON.stringify(row));
                            row = [""];
                        } else {
                            row[row.length - 1] += c;
                        }
                    }
                    if (row.length > 1 || row[0] !== "") {
                        lines.push(JSON.stringify(row));
                    }

                    if (lines.length === 0) return resolve([]);
                    const headers = JSON.parse(lines[0]) as string[];
                    const json: any[] = [];
                    for (let i = 1; i < lines.length; i++) {
                        const values = JSON.parse(lines[i]) as string[];
                        const item: Record<string, any> = {};
                        headers.forEach((header, idx) => {
                            item[header.trim()] = values[idx] !== undefined ? values[idx].trim() : "";
                        });
                        json.push(item);
                    }
                    resolve(json);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
        });
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a CSV file.");
            return;
        }
        setUploading(true);

        try {
            const csvRows = await readCsvFile(selectedFile);
            if (!Array.isArray(csvRows) || csvRows.length === 0) {
                throw new Error("CSV file is empty or format is incorrect");
            }
            // Map and normalize each row using the correct company (always correct for Contributor/Client)
            const normalizedRows = xlsxRows.map(row => normalizeBulkRow(row, company));
            const rowsToSend = normalizedRows;

            console.log("Sending bulk JSON to API:", rowsToSend);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: API_HEADERS,
                body: JSON.stringify(rowsToSend)
            });

            const apiRespText = await response.text();
            let apiRespJson;
            try {
                apiRespJson = JSON.parse(apiRespText);
            } catch {
                apiRespJson = apiRespText;
            }
            console.log("API bulk upload response:", apiRespJson);

            if (!response.ok) {
                console.log("Bulk upload error - Sent JSON:", rowsToSend);
                throw new Error(`Bulk upload failed: ${response.statusText} - ${JSON.stringify(apiRespJson)}`);
            }
            setUploading(false);
            setSelectedFile(null);
            setCompany(initialCompany);
            toast.success("Bulk upload submitted!");
            // --- Go back to main screen after success ---
            setTimeout(() => {
                handleBack();
            }, 1200); // Give user time to see toast
        } catch (err: any) {
            setUploading(false);
            toast.error(`Bulk upload failed: ${err?.message || "Unknown error"}`);
            if (selectedFile) {
                console.log("Bulk upload error file:", selectedFile.name);
            }
        }
    };

    // Handler for create new employee form
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle Edit: open the form for editing row at index, with that data
    const handleEditRow = (row: any, rowIx: number) => {
        setEditEmployee(row);
        setActivePanel("edit");
        setEditingRowIndex(rowIx);
        // All keys from ALL_API_FIELDS - auto copy all if present
        const fieldKeys = Object.keys(ALL_API_FIELDS);
        // If missing, fallback to ""
        const fields: {
            FirstName: string;
            MiddleName: string;
            LastName: string;
            Email: string;
            MobileNo: string;
            Department: string;
            DateOfJoining: string;
            LastPositionHeld: string;
            DateOfLeaving: string;
            LastSalaryAnnual: string;
            EmployeeCode: string;
            ExitFormalities: string;
            EmploymentType: string;
            AnyBehaviourIssue: string;
            EligibilityToRehire: string;
            Contributor: string;
        } = {
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
            Contributor: ""
        };
        for(const k of fieldKeys) {
            fields[k as keyof typeof fields] = row[k] !== undefined && row[k] !== null ? String(row[k]) : "";
        }
        setForm(fields);
    };

    const handleNewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingNew(true);

        // Always send form.Contributor, which is initialized and maintained per Usertype
        const normalized = normalizeBulkRow(form, form.Contributor);
        const payload = [normalized];
        console.log("Sending single record JSON to API:", payload);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: API_HEADERS,
                body: JSON.stringify(payload)
            });

            const apiRespText = await response.text();
            let apiRespJson;
            try {
                apiRespJson = JSON.parse(apiRespText);
            } catch {
                apiRespJson = apiRespText;
            }
            console.log("API create new employee response:", apiRespJson);

            if (!response.ok) {
                console.log("Create new employee error JSON:", payload);
                throw new Error(`Failed to add employee. ${response.statusText} - ${JSON.stringify(apiRespJson)}`);
            }

            setSubmittingNew(false);
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

            toast.success("New employee submitted!");
            // --- Go back to main screen after success ---
            setTimeout(() => {
                handleBack();
            }, 1200); // Give user time to see toast
        } catch (err: any) {
            setSubmittingNew(false);
            toast.error(`New employee submission failed: ${err?.message || "Unknown error"}`);
            console.log("Create new employee error JSON:", [normalizeBulkRow(form, form.Contributor)]);
        }
    };

    // Handle Update (Edit form submit)
    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingUpdate(true);

        // Send as 1-element array (same as adding new)
        const normalized = normalizeBulkRow(form, form.Contributor);
        const payload = [normalized];
        console.log("Sending UPDATE employee JSON to API:", payload);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: API_HEADERS,
                body: JSON.stringify(payload)
            });

            const apiRespText = await response.text();
            let apiRespJson;
            try {
                apiRespJson = JSON.parse(apiRespText);
            } catch {
                apiRespJson = apiRespText;
            }
            console.log("API update employee response:", apiRespJson);

            if (!response.ok) {
                throw new Error(`Failed to update employee. ${response.statusText} - ${JSON.stringify(apiRespJson)}`);
            }

            setSubmittingUpdate(false);
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

            toast.success("Employee updated!");
            // After update, go back and refresh table (best effort)
            setTimeout(() => {
                handleBack();
            }, 1200);
        } catch (err: any) {
            setSubmittingUpdate(false);
            toast.error(`Update failed: ${err?.message || "Unknown error"}`);
        }
    };

    // --- SEARCH LOGIC STARTS HERE ---

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchEmployeeCode(e.target.value);
        setSearchResults(null);
        // When input changes, clear previous table
        setActiveTable(null);
        setAllEmployeesResults(null);
    };

    const handleSearch = async () => {
        if (!searchEmployeeCode.trim()) {
            toast.error("Please enter an EmployeeCode to search.");
            return;
        }
        setSearchLoading(true);
        setSearchResults(null);
        setActiveTable(null);
        setAllEmployeesResults(null); // When searching, clear all employees

        try {
            const result = await fetch(SEARCH_API_URL, {
                method: "POST",
                headers: SEARCH_API_HEADERS,
                body: JSON.stringify({ EmployeeCode: searchEmployeeCode.trim() }),
            });

            const text = await result.text();
            let json: any;
            try {
                json = JSON.parse(text);
            } catch {
                json = {};
            }
            if (result.ok && json && Array.isArray(json.data)) {
                setSearchResults(json.data);
                setActiveTable('search'); // Only show search table
                if (json.data.length === 0) {
                    toast.warn("No employee found for this EmployeeCode.");
                }
            } else if(result.ok && json && json.data && typeof json.data === 'object') {
                setSearchResults([json.data]);
                setActiveTable('search');
            } else {
                throw new Error(json?.message || "Employee not found.");
            }
        } catch (err: any) {
            toast.error("Search failed: " + (err?.message || "Unknown error"));
            setSearchResults(null);
            setActiveTable(null);
        } finally {
            setSearchLoading(false);
        }
    };

    // --- ALL EMPLOYEE DATA (BY Contributor) LOGIC ---

    const handleAllEmployees = async () => {
        // Use the contributor from useAuth always
        const contributorValue =
            user && user.CompanyName
                ? user.CompanyName
                : (user && user.Usertype === "Contributor" ? "Contributor" : "");

        if (!contributorValue) {
            toast.error("Contributor not found for AllEmployeeData.");
            return;
        }
        setAllEmployeesLoading(true);
        setAllEmployeesResults(null);
        setSearchResults(null); // Clear search results when viewing all employees
        setActiveTable(null);

        try {
            const result = await fetch(ALL_EMPLOYEE_API_URL, {
                method: "POST",
                headers: ALL_EMPLOYEE_API_HEADERS,
                body: JSON.stringify({ Contributor: contributorValue }),
            });

            const text = await result.text();
            let json: any;
            try {
                json = JSON.parse(text);
            } catch {
                json = {};
            }
            if (result.ok && json && Array.isArray(json.data)) {
                setAllEmployeesResults(json.data);
                setActiveTable('all'); // Only show all employees table
                if (json.data.length === 0) {
                    toast.warn("No employee data found for this Contributor.");
                }
            } else if(result.ok && json && json.data && typeof json.data === 'object') {
                setAllEmployeesResults([json.data]);
                setActiveTable('all');
            } else {
                throw new Error(json?.message || "No employee data found.");
            }
        } catch (err: any) {
            toast.error("AllEmployeeData fetch failed: " + (err?.message || "Unknown error"));
            setAllEmployeesResults(null);
            setActiveTable(null);
        } finally {
            setAllEmployeesLoading(false);
        }
    };

    const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    // Column structure with Edit column after S. No.
    const tableColumns = [
        { key: "Sno", label: "S. No.", align: "center" },
        { key: "edit", label: "Action", align: "center" },
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

    function formatSalary(val: any) {
        if (val === null || val === undefined || val === "") return "-";
        const num = Number(val);
        if (isNaN(num)) return String(val);
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(num);
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

        if (colKey === "DateOfJoining" || colKey === "DateOfLeaving" || colKey === "CreatedAt") {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {formatDate(val)}
                </span>
            );
        }

        if (colKey === "LastSalaryAnnual") {
            return (
                <span className="font-semibold text-slate-800 text-xs">
                    {formatSalary(val)}
                </span>
            );
        }

        if (colKey === "EligibilityToRehire") {
            const v = String(val).trim().toLowerCase();
            if (v === "yes") {
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Yes
                    </span>
                );
            } else if (v === "no") {
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        No
                    </span>
                );
            }
        }

        if (colKey === "ExitFormalities") {
            const v = String(val).trim().toLowerCase();
            if (v === "completed") {
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Completed
                    </span>
                );
            } else if (v === "pending") {
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Pending
                    </span>
                );
            } else if (v === "ongoing") {
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                        Ongoing
                    </span>
                );
            }
        }

        if (colKey === "EmploymentType") {
            return (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                    {String(val)}
                </span>
            );
        }

        if (colKey === "Email") {
            return (
                <span className="text-xs text-indigo-600 font-medium">
                    {String(val)}
                </span>
            );
        }

        if (colKey === "FirstName" || colKey === "LastName") {
            return (
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                    {String(val)}
                </span>
            );
        }

        return <span className="text-xs text-slate-600 font-normal">{String(val)}</span>;
    };

    const renderTable = (data: any[], title: string) => {
        const filteredData = data.filter(row => {
            if (!tableSearchFilter.trim()) return true;
            const q = tableSearchFilter.toLowerCase();
            return (
                (row.FirstName && String(row.FirstName).toLowerCase().includes(q)) ||
                (row.LastName && String(row.LastName).toLowerCase().includes(q)) ||
                (row.EmployeeCode && String(row.EmployeeCode).toLowerCase().includes(q)) ||
                (row.Department && String(row.Department).toLowerCase().includes(q)) ||
                (row.Email && String(row.Email).toLowerCase().includes(q)) ||
                (row.Contributor && String(row.Contributor).toLowerCase().includes(q))
            );
        });

        return (
            <div className="w-full mt-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden box-border">
                {/* Table Header Bar */}
                <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-800 m-0">{title}</h3>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100/70 text-indigo-700">
                                    {data.length} {data.length === 1 ? 'Record' : 'Records'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 m-0 mt-0.5">
                                Showing employee directory and registry compliance records
                            </p>
                        </div>
                    </div>

                    {/* In-Table Quick Filter Input */}
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

                {/* Table Scroll Wrapper */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left min-w-[1100px]">
                        <thead>
                            <tr className="bg-slate-100/70 border-b border-slate-200/80">
                                {tableColumns.map((col) => {
                                    const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';
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
                                    <tr
                                        key={rowIx}
                                        className="hover:bg-indigo-50/30 transition-colors duration-150 group"
                                    >
                                        {tableColumns.map((col) => {
                                            if (col.key === "Sno") {
                                                return (
                                                    <td
                                                        key="Sno"
                                                        className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 text-center font-medium"
                                                    >
                                                        {rowIx + 1}
                                                    </td>
                                                );
                                            }
                                            if (col.key === "edit") {
                                                return (
                                                    <td key="edit" className="whitespace-nowrap px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditRow(row, rowIx)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-semibold text-xs transition-all duration-150 active:scale-95 cursor-pointer border border-indigo-200/60"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Edit</span>
                                                        </button>
                                                    </td>
                                                );
                                            }
                                            const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';
                                            return (
                                                <td
                                                    key={col.key}
                                                    className={`whitespace-nowrap px-4 py-3 ${alignClass}`}
                                                >
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
                        {options.map(opt => (
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
                <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg font-bold text-sm text-white shadow-lg transition-all duration-300 ${
                    toastState.type === 'success' 
                        ? 'bg-emerald-500 border border-emerald-400/20' 
                        : toastState.type === 'error' 
                            ? 'bg-rose-500 border border-rose-400/20' 
                            : 'bg-amber-500 border border-amber-400/20'
                }`}>
                    {toastState.message}
                </div>
            )}

            {/* Search Bar and Action Buttons Row */}
            {activePanel === null && (
                <>
                    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 mt-2 box-border relative">
                        {/* Search Input Box */}
                        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-[280px] lg:max-w-[320px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by Employee Code..."
                                value={searchEmployeeCode}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchInputKeyDown}
                                className="w-full h-11 sm:h-10 border border-slate-200 rounded-full sm:rounded-xl pl-10 pr-4 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all box-border"
                                autoComplete="off"
                            />
                        </div>

                        {/* Action Buttons: 2x2 grid on mobile screens, row on desktop */}
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

                            <button
                                type="button"
                                className="flex items-center justify-center gap-1.5 sm:gap-2.5 h-10 sm:h-11 px-3 sm:px-6 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase rounded-full transition-all shadow-md cursor-pointer select-none text-center"
                                onClick={handleAllEmployees}
                                disabled={allEmployeesLoading}
                            >
                                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                <span className="truncate">{allEmployeesLoading ? "Loading..." : "View Employee Data"}</span>
                            </button>

                            <button
                                type="button"
                                className="flex items-center justify-center gap-1.5 sm:gap-2.5 h-10 sm:h-11 px-3 sm:px-6 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase rounded-full transition-all shadow-md cursor-pointer select-none text-center"
                                onClick={() => handleClick("bulk")}
                            >
                                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                <span className="truncate">Bulk Upload</span>
                            </button>

                            <button
                                type="button"
                                className="flex items-center justify-center gap-1.5 sm:gap-2.5 h-10 sm:h-11 px-3 sm:px-6 bg-gradient-to-r from-[#10B981] to-[#5850EC] hover:brightness-110 hover:shadow-[0_4px_15px_rgba(8,33,54,0.25)] active:scale-[0.98] text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase rounded-full transition-all shadow-md cursor-pointer select-none text-center"
                                onClick={() => handleClick("new")}
                            >
                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                <span className="truncate">Create New</span>
                            </button>
                        </div>
                    </div>

                    {/* Show ONLY ONE TABLE at a time based on activeTable */}
                    {activeTable === 'search' && (searchResults && searchResults.length > 0) && (
                        renderTable(searchResults, "Search Results")
                    )}

                    {/* Show ONLY ONE TABLE at a time based on activeTable */}
                    {activeTable === 'all' && (allEmployeesResults && allEmployeesResults.length > 0) && (
                        renderTable(allEmployeesResults, "All Employee Records")
                    )}
                </>
            )}

            {activePanel !== null && (
                <button
                    type="button"
                    className=" min-h-[38px] min-w-[92px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-0 rounded-lg cursor-pointer z-10 active:scale-95 transition-all text-sm flex items-center justify-center gap-1.5"
                    onClick={handleBack}
                >
                    &larr; Back
                </button>
            )}

            {activePanel === "bulk" && (
                <a
                    href="/sample_bulk_upload.csv"
                    download="sample_bulk_upload.csv"
                    className="absolute left-6 top-[72px] h-[38px] px-5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200/50 rounded-lg shadow-xs active:scale-95 transition-all text-xs inline-flex items-center justify-center cursor-pointer mb-2.5 decoration-0"
                >
                    Download Sample CSV
                </a>
            )}

            {activePanel !== null && (
                <div className={activePanel === 'bulk' 
                    ? 'w-full max-w-[575px] min-h-[40vh] h-auto mx-auto mt-10 relative flex flex-col items-center justify-center gap-4 box-border'
                    : 'w-full mx-auto mt-8 p-0 box-border relative'
                }>
                    {activePanel === "bulk" && (
                        <form
                            className="w-full flex flex-col items-center gap-8 max-w-[550px] mx-auto bg-white p-8 border border-slate-100 rounded-2xl shadow-sm mt-16 box-border"
                            onSubmit={handleBulkSubmit}
                            encType="multipart/form-data"
                            autoComplete="off"
                        >
                            <h3 className="m-0 text-lg font-bold text-slate-800 text-center w-full">Bulk Upload Employees</h3>
                            <div className="w-full flex flex-row items-center justify-center gap-3 flex-wrap">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="flex-[1_1_180px] min-w-0 h-10 border border-slate-200 rounded-lg px-3.5 py-1.5 text-sm text-slate-800 bg-white focus:border-indigo-500 focus:outline-none max-w-[240px]"
                                    required
                                />
                                {showContributorField && (
                                    showCompanyDropdown ? (
                                        <select
                                            value={company}
                                            onChange={handleCompanyChange}
                                            className="flex-[1_1_130px] h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-white focus:border-indigo-500 focus:outline-none max-w-[150px]"
                                            required
                                        >
                                            <option value="Contributor">Contributor</option>
                                            <option value="TCS">TCS</option>
                                            <option value="Securitas">Securitas</option>
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={company}
                                            readOnly
                                            className="flex-[1_1_130px] h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-400 bg-slate-50 cursor-not-allowed max-w-[150px]"
                                            tabIndex={-1}
                                        />
                                    )
                                )}
                            </div>
                            <button
                                type="submit"
                                className={btnClass}
                                disabled={uploading}
                            >
                                {uploading ? "Submitting..." : "Submit"}
                            </button>
                        </form>
                    )}

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
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                    Company (Client) <span className="text-rose-500">*</span>
                                                </label>
                                                {showCompanyDropdown ? (
                                                    <select
                                                        name="Contributor"
                                                        value={form.Contributor}
                                                        onChange={handleInputChange}
                                                        className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
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
                                                        className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-400 bg-slate-50 cursor-not-allowed border-slate-300"
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
                                disabled={submittingNew}
                            >
                                {submittingNew ? "Submitting..." : "Submit"}
                            </button>
                        </form>
                    )}

                    {activePanel === "edit" && (
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

export default AddEmployee
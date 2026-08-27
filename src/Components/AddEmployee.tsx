
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { useAuth } from '../useAuth'

// Custom button style
const primaryBtnStyle: React.CSSProperties = {
    minWidth: "160px",
    minHeight: "44px",
    fontSize: "14px",
    border: "none",
    borderRadius: "7px",
    background: "var(--accent)",
    color: "var(--green)",
    fontWeight: 800,
    transition: "background .2s, color .2s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "none",
    outline: "none",
    cursor: "pointer",
    padding: "0 22px",
};

const buttonHoverStyle: React.CSSProperties = {
    background: "#fff",
    color: "#var(--ink)",
};

const backBtnStyle: React.CSSProperties = {
    position: "absolute",
    top: 24,
    left: 24,
    minHeight: "38px",
    minWidth: "92px",
    padding: "0 15px",
    background: "#ececec",
    color: "#333",
    fontWeight: 700,
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    zIndex: 2,
};

const rowContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    gap: "16px",
    marginBottom: "12px",
};

const inputStyle: React.CSSProperties = {
    flex: 1,
    minHeight: "40px",
    border: "1.7px solid #ededec",
    borderRadius: "6px",
    padding: "8px 10px",
    fontSize: "16px",
    background: "#fff",
    color: "#183526",
    outline: "none",
    minWidth: 0,
};

const contributorDropdownStyle: React.CSSProperties = {
    flex: "1 1 130px",
    minHeight: "40px",
    border: "1.7px solid #ededec",
    borderRadius: "6px",
    fontSize: "16px",
    padding: "6px 12px",
    background: "#fff",
    color: "#183526",
    outline: "none",
    maxWidth: "150px"
};

const formContainerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 575,
    height: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    margin: "0 auto",
    marginTop: "100px",
    background: "none",
    boxSizing: "border-box"
};

const scrollableInnerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 575,
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    background: "none",
    padding: "18px 0 0 0",
    marginBottom: 0,
    boxSizing: "border-box"
};

const tableOuterDiv: React.CSSProperties = {
    margin: "24px 0 0 0",
    width: "100%",
    maxWidth: 980,
    maxHeight: "320px",
    overflowX: "auto",
    overflowY: "auto",
    border: "1.2px solid #dedede",
    borderRadius: 8,
    background: "#fff",
    boxSizing: "border-box",
    boxShadow: "0 2.5px 8px 0px #d5f3e2"
};

const API_URL = "http://localhost:3000/ContributorData";
const API_HEADERS = {
    "APIKEY": "Securitas@#!1234",
    "Content-Type": "application/json"
};

// For Employee Search
const SEARCH_API_URL = "http://localhost:3000/ContributorEmpSearch";
const SEARCH_API_HEADERS = {
    "APIKEY": "Securitas@#!1234",
    "Content-Type": "application/json"
};

// AllEmployeeData API endpoint (assume similar API style)
const ALL_EMPLOYEE_API_URL = "http://localhost:3000/ContributorEmpSearch";
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

    const readXlsxFile = async (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (evt: any) => {
                try {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });
                    resolve(json);
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
            toast.error("Please select an xlsx file.");
            return;
        }
        setUploading(true);

        try {
            const xlsxRows = await readXlsxFile(selectedFile);
            if (!Array.isArray(xlsxRows) || xlsxRows.length === 0) {
                throw new Error("XLSX file is empty or format is incorrect");
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
        { key: "Sno", label: "S. No." },
        { key: "edit", label: "Edit" },
        { key: "EmployeeCode", label: "Employee Code" },
        { key: "FirstName", label: "First Name" },
        { key: "MiddleName", label: "Middle Name" },
        { key: "LastName", label: "Last Name" },
        { key: "Email", label: "Email" },
        { key: "MobileNo", label: "Mobile No" },
        { key: "Department", label: "Department" },
        { key: "DateOfJoining", label: "Date Of Joining" },
        { key: "LastPositionHeld", label: "Last Position Held" },
        { key: "DateOfLeaving", label: "Date Of Leaving" },
        { key: "LastSalaryAnnual", label: "Last Salary Annual" },
        { key: "ExitFormalities", label: "Exit Formalities" },
        { key: "EmploymentType", label: "Employment Type" },
        { key: "AnyBehaviourIssue", label: "Any Behaviour Issue" },
        { key: "EligibilityToRehire", label: "Eligibility To Rehire" },
        { key: "Contributor", label: "Contributor" }
    ];

    function formatDate(val: string | null | undefined) {
        if (!val) return "";
        const d = new Date(val);
        if (isNaN(d.getTime())) return String(val);
        return d.toLocaleString();
    }

    return (
        <section
            className="dashboard-page-card"
            style={{
                width: "65vw",
                minHeight: "65vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                boxSizing: "border-box",
                padding: 0,
                margin: 0,
                marginTop: 0,
                position: "relative",
                overflow: "visible"
            }}
        >
            <ToastContainer position="top-center" pauseOnFocusLoss={false} />

            {/* Employee Code Search Bar and AllEmployeeData Button - Always TOP LEFT */}
            {activePanel === null && (
                <div
                    style={{
                        width: "100%",
                        maxWidth: "820px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginBottom: "18px",
                        marginTop: "10px",
                        gap: "13px",
                        justifyContent: "flex-start",
                        position: "relative",
                        marginLeft: "5px"
                    }}
                >
                    <input
                        type="text"
                        placeholder="Employeecode"
                        value={searchEmployeeCode}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchInputKeyDown}
                        style={{
                            minWidth: "150px",
                            maxWidth: "205px",
                            minHeight: "38px",
                            border: "1.7px solid #ededec",
                            borderRadius: "7px",
                            padding: "9px 11px",
                            fontSize: "16px",
                            background: "#fff",
                            color: "#183526",
                            outline: "none",
                            marginLeft: "1px"
                        }}
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        style={{
                            ...primaryBtnStyle,
                            minWidth: "110px",
                            minHeight: "38px",
                            padding: "0 18px",
                            fontSize: "15px",
                            marginLeft: "1px"
                        }}
                        onClick={handleSearch}
                        disabled={searchLoading}
                    >
                        {searchLoading ? "Searching..." : "Search"}
                    </button>
                    <button
                        type="button"
                        style={{
                            ...primaryBtnStyle,
                            minWidth: "148px",
                            minHeight: "38px",
                            padding: "0 18px",
                            fontSize: "15px",
                            marginLeft: "24px"
                        }}
                        onClick={handleAllEmployees}
                        disabled={allEmployeesLoading}
                    >
                        {allEmployeesLoading ? "Loading..." : "ViewEmployeeData"}
                    </button>
                </div>
            )}

            {activePanel === null && (
                <>
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "570px",
                            margin: "0 auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "18px",
                            marginTop: "50px"
                        }}
                    >
                        <button
                            type="button"
                            className="menu-link"
                            style={{
                                ...primaryBtnStyle,
                                ...(hoverBtn === "bulk" ? buttonHoverStyle : {})
                            }}
                            onMouseEnter={() => setHoverBtn("bulk")}
                            onMouseLeave={() => setHoverBtn(null)}
                            onClick={() => handleClick("bulk")}
                        >
                            Bulk Upload
                        </button>
                        <button
                            type="button"
                            className="menu-link"
                            style={{
                                ...primaryBtnStyle,
                                ...(hoverBtn === "new" ? buttonHoverStyle : {})
                            }}
                            onMouseEnter={() => setHoverBtn("new")}
                            onMouseLeave={() => setHoverBtn(null)}
                            onClick={() => handleClick("new")}
                        >
                            Create New
                        </button>
                    </div>

                    {/* Show ONLY ONE TABLE at a time based on activeTable */}
                    {activeTable === 'search' && (searchResults && searchResults.length > 0) && (
                        <div style={{ ...tableOuterDiv, margin: "24px 0 0 0" }}>
                            <table
                                style={{
                                    borderCollapse: "collapse",
                                    width: "max-content",
                                    minWidth: "930px",
                                    background: "#fff",
                                }}
                            >
                                <thead>
                                    <tr>
                                        {tableColumns.map(col => (
                                            <th
                                                key={col.key}
                                                style={{
                                                    whiteSpace: "nowrap",
                                                    padding: "7px 8px",
                                                    border: "1px solid #d1d1f2",
                                                    background: "#e9fcf1",
                                                    fontWeight: 700,
                                                    fontSize: "14px",
                                                    color: "#1a1a1a"
                                                }}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.map((row, rowIx) => (
                                        <tr key={rowIx}>
                                            {tableColumns.map(col => {
                                                if (col.key === "Sno") {
                                                    // Serial number frontend based (1-based)
                                                    return (
                                                        <td
                                                            key="Sno"
                                                            style={{
                                                                whiteSpace: "nowrap",
                                                                padding: "7px 8px",
                                                                border: "1px solid #ececec",
                                                                fontSize: "14px",
                                                                color: "#263925",
                                                                textAlign: "center"
                                                            }}
                                                        >
                                                            {rowIx + 1}
                                                        </td>
                                                    );
                                                } else if (col.key === "edit") {
                                                    return (
                                                        <td
                                                            key="edit"
                                                            style={{
                                                                whiteSpace: "nowrap",
                                                                padding: "7px 8px",
                                                                border: "1px solid #ececec",
                                                                fontSize: "14px",
                                                                textAlign: "center"
                                                            }}
                                                        >
                                                            <button
                                                                style={{
                                                                    padding: "6px 16px",
                                                                    borderRadius: "5px",
                                                                    border: "none",
                                                                    background: "#1bbf56",
                                                                    color: "#fff",
                                                                    fontWeight: 700,
                                                                    cursor: "pointer",
                                                                    fontSize: "13px"
                                                                }}
                                                                onClick={() => handleEditRow(row, rowIx)}
                                                            >
                                                                Edit
                                                            </button>
                                                        </td>
                                                    );
                                                } else {
                                                    return (
                                                        <td
                                                            key={col.key}
                                                            style={{
                                                                whiteSpace: "nowrap",
                                                                padding: "7px 8px",
                                                                border: "1px solid #ececec",
                                                                fontSize: "14px",
                                                                color: "#263925",
                                                                textAlign: "center"
                                                            }}
                                                        >
                                                            {col.key === "DateOfJoining" || col.key === "DateOfLeaving" || col.key === "CreatedAt"
                                                                ? formatDate(row[col.key])
                                                                : (row[col.key] !== null && row[col.key] !== undefined
                                                                    ? String(row[col.key])
                                                                    : "")
                                                            }
                                                        </td>
                                                    );
                                                }
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTable === 'all' && (allEmployeesResults && allEmployeesResults.length > 0) && (
                        <div style={{ ...tableOuterDiv, margin: "24px 0 0 0" }}>
                            <table
                                style={{
                                    borderCollapse: "collapse",
                                    width: "max-content",
                                    minWidth: "930px",
                                    background: "#fff",
                                }}
                            >
                                <thead>
                                    <tr>
                                        {tableColumns.map(col => (
                                            <th
                                                key={col.key}
                                                style={{
                                                    whiteSpace: "nowrap",
                                                    padding: "7px 8px",
                                                    border: "1px solid #d1d1f2",
                                                    background: "#c4eafc",
                                                    fontWeight: 800,
                                                    fontSize: "14px",
                                                    color: "#174757"
                                                }}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {allEmployeesResults.map((row, rowIx) => (
                                        <tr key={rowIx}>
                                            {tableColumns.map(col => {
                                                if (col.key === "Sno") {
                                                    return (
                                                        <td
                                                            key="Sno"
                                                            style={{
                                                                whiteSpace: "nowrap",
                                                                padding: "7px 8px",
                                                                border: "1px solid #ececec",
                                                                fontSize: "14px",
                                                                color: "#124252",
                                                                textAlign: "center"
                                                            }}
                                                        >
                                                            {rowIx + 1}
                                                        </td>
                                                    );
                                                } else if (col.key === "edit") {
                                                    return (
                                                        <td
                                                            key="edit"
                                                            style={{
                                                                whiteSpace: "nowrap",
                                                                padding: "7px 8px",
                                                                border: "1px solid #ececec",
                                                                fontSize: "14px",
                                                                textAlign: "center"
                                                            }}
                                                        >
                                                            <button
                                                                style={{
                                                                    padding: "6px 16px",
                                                                    borderRadius: "5px",
                                                                    border: "none",
                                                                    background: "#1bbf56",
                                                                    color: "#fff",
                                                                    fontWeight: 700,
                                                                    cursor: "pointer",
                                                                    fontSize: "13px"
                                                                }}
                                                                onClick={() => handleEditRow(row, rowIx)}
                                                            >
                                                                Edit
                                                            </button>
                                                        </td>
                                                    );
                                                } else {
                                                    return (
                                                        <td
                                                            key={col.key}
                                                            style={{
                                                                whiteSpace: "nowrap",
                                                                padding: "7px 8px",
                                                                border: "1px solid #ececec",
                                                                fontSize: "14px",
                                                                color: "#124252",
                                                                textAlign: "center"
                                                            }}
                                                        >
                                                            {col.key === "DateOfJoining" || col.key === "DateOfLeaving" || col.key === "CreatedAt"
                                                                ? formatDate(row[col.key])
                                                                : (row[col.key] !== null && row[col.key] !== undefined
                                                                    ? String(row[col.key])
                                                                    : "")
                                                            }
                                                        </td>
                                                    );
                                                }
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {activePanel !== null && (
                <button
                    type="button"
                    style={backBtnStyle}
                    onClick={handleBack}
                >
                    &#8592; Back
                </button>
            )}

            {activePanel === "bulk" && (
                <a
                    href="/sample_bulk_upload.xlsx"
                    download="sample_bulk_upload.xlsx"
                    style={{
                        ...primaryBtnStyle,
                        ...(hoverBtn === "download" ? buttonHoverStyle : {}),
                        position: "absolute",
                        left: 24,
                        top: 72,
                        minHeight: "38px",
                        height: "38px",
                        minWidth: "170px",
                        marginBottom: "10px",
                        background: "var(--accent)",
                        color: "var(--green)",
                        fontWeight: 800
                    }}
                    onMouseEnter={() => setHoverBtn("download")}
                    onMouseLeave={() => setHoverBtn(null)}
                >
                    Download Sample Excel
                </a>
            )}

            {activePanel !== null && (
                <div
                    style={{
                        ...formContainerStyle,
                        minHeight: "70vh",
                        height: "70vh",
                        maxWidth: 575,
                        margin: "0 auto",
                        marginTop: "100px",
                        position: "relative",
                        overflow: "hidden"
                    }}
                >
                    {activePanel === "bulk" && (
                        <form
                            style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "30px",
                                maxWidth: 550,
                                margin: "0 auto"
                            }}
                            onSubmit={handleBulkSubmit}
                            encType="multipart/form-data"
                            autoComplete="off"
                        >
                            <h3 style={{ margin: 0, fontSize: "1.22rem", fontWeight: 600, marginBottom: 12, color: "#fff" }}>Bulk Upload Employees</h3>
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "12px",
                                    flexWrap: "wrap"
                                }}
                            >
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={handleFileChange}
                                    style={{
                                        flex: "1 1 180px",
                                        minWidth: 0,
                                        minHeight: "40px",
                                        border: "1.7px solid #ededec",
                                        borderRadius: "6px",
                                        padding: "8px 10px",
                                        fontSize: "16px",
                                        background: "#fff",
                                        color: "#183526",
                                        outline: "none",
                                        maxWidth: "240px"
                                    }}
                                    required
                                />
                                {showContributorField && (
                                    showCompanyDropdown ? (
                                        <select
                                            value={company}
                                            onChange={handleCompanyChange}
                                            style={contributorDropdownStyle}
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
                                            style={{
                                                ...contributorDropdownStyle,
                                                background: "#f5f5f5",
                                                color: "#666",
                                                cursor: "not-allowed"
                                            }}
                                            tabIndex={-1}
                                        />
                                    )
                                )}
                            </div>
                            <button
                                type="submit"
                                style={{
                                    ...primaryBtnStyle,
                                    ...(hoverBtn === "submit" ? buttonHoverStyle : {})
                                }}
                                onMouseEnter={() => setHoverBtn("submit")}
                                onMouseLeave={() => setHoverBtn(null)}
                                disabled={uploading}
                            >
                                {uploading ? "Submitting..." : "Submit"}
                            </button>
                        </form>
                    )}

                    {activePanel === "new" && (
                        <form
                            style={{
                                width: "100%",
                                maxWidth: 575,
                                margin: "0 auto",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                background: "transparent",
                                boxSizing: "border-box",
                                position: "relative"
                            }}
                            autoComplete="off"
                            onSubmit={handleNewSubmit}
                        >
                            <h3 style={{
                                margin: 0,
                                fontSize: "1.22rem",
                                fontWeight: 600,
                                marginBottom: 12,
                                color: "#fff"
                            }}>
                                Create New Employee
                            </h3>
                            <div
                                style={scrollableInnerStyle}
                            >
                                <div style={rowContainerStyle}>
                                <input
                                        style={inputStyle}
                                        name="EmployeeCode"
                                        type="text"
                                        placeholder="Employee Code"
                                        value={form.EmployeeCode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="FirstName"
                                        type="text"
                                        placeholder="First Name"
                                        value={form.FirstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="MiddleName"
                                        type="text"
                                        placeholder="Middle Name"
                                        value={form.MiddleName}
                                        onChange={handleInputChange}
                                    />
                                    
                                </div>
                                <div style={rowContainerStyle}>
                                <input
                                        style={inputStyle}
                                        name="LastName"
                                        type="text"
                                        placeholder="Last Name"
                                        value={form.LastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="Email"
                                        type="email"
                                        placeholder="Email"
                                        value={form.Email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    
                                    <input
                                        style={inputStyle}
                                        name="Department"
                                        type="text"
                                        placeholder="Department"
                                        value={form.Department}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div style={rowContainerStyle}>
                                    <input
                                        style={inputStyle}
                                        name="DateOfJoining"
                                        type="date"
                                        placeholder="Date of Joining"
                                        value={form.DateOfJoining}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="LastPositionHeld"
                                        type="text"
                                        placeholder="Last Position Held"
                                        value={form.LastPositionHeld}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        style={inputStyle}
                                        name="DateOfLeaving"
                                        type="date"
                                        placeholder="Date of Leaving"
                                        value={form.DateOfLeaving}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div style={rowContainerStyle}>
                                    <input
                                        style={inputStyle}
                                        name="LastSalaryAnnual"
                                        type="number"
                                        placeholder="Last Salary Annual"
                                        value={form.LastSalaryAnnual}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="MobileNo"
                                        type="text"
                                        placeholder="Mobile No"
                                        value={form.MobileNo}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    
                                    <input
                                        style={inputStyle}
                                        name="ExitFormalities"
                                        type="text"
                                        placeholder="Exit Formalities"
                                        value={form.ExitFormalities}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div style={rowContainerStyle}>
                                    <select
                                        name="EmploymentType"
                                        value={form.EmploymentType}
                                        onChange={handleInputChange}
                                        style={{ ...inputStyle, minWidth: 0 }}
                                        required
                                    >
                                        <option value="">Employment Type</option>
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Part-Time">Part-Time</option>
                                        <option value="Intern">Intern</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                    <input
                                        style={inputStyle}
                                        name="AnyBehaviourIssue"
                                        type="text"
                                        placeholder="Any Behaviour Issue"
                                        value={form.AnyBehaviourIssue}
                                        onChange={handleInputChange}
                                    />
                                    <select
                                        name="EligibilityToRehire"
                                        value={form.EligibilityToRehire}
                                        onChange={handleInputChange}
                                        style={{ ...inputStyle, minWidth: 0 }}
                                        required
                                    >
                                        <option value="">Eligibility To Rehire</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                {showContributorField && (
                                    <div style={rowContainerStyle}>
                                        {showCompanyDropdown ? (
                                            <select
                                                name="Contributor"
                                                value={form.Contributor}
                                                onChange={handleInputChange}
                                                style={contributorDropdownStyle}
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
                                                style={{
                                                    ...contributorDropdownStyle,
                                                    background: "#f5f5f5",
                                                    color: "#666",
                                                    cursor: "not-allowed"
                                                }}
                                                tabIndex={-1}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                style={{
                                    ...primaryBtnStyle,
                                    alignSelf: "center",
                                    margin: "22px auto 0 auto",
                                    ...(hoverBtn === "submit" ? buttonHoverStyle : {})
                                }}
                                onMouseEnter={() => setHoverBtn("submit")}
                                onMouseLeave={() => setHoverBtn(null)}
                                disabled={submittingNew}
                            >
                                {submittingNew ? "Submitting..." : "Submit"}
                            </button>
                        </form>
                    )}

                    {activePanel === "edit" && (
                        <form
                            style={{
                                width: "100%",
                                maxWidth: 575,
                                margin: "0 auto",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                background: "transparent",
                                boxSizing: "border-box",
                                position: "relative"
                            }}
                            autoComplete="off"
                            onSubmit={handleUpdateSubmit}
                        >
                            <h3 style={{
                                margin: 0,
                                fontSize: "1.22rem",
                                fontWeight: 600,
                                marginBottom: 12,
                                color: "#fff"
                            }}>
                                Update Employee
                            </h3>
                            <div
                                style={scrollableInnerStyle}
                            >
                                <div style={rowContainerStyle}>
                                    <input
                                        style={inputStyle}
                                        name="FirstName"
                                        type="text"
                                        placeholder="First Name"
                                        value={form.FirstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="MiddleName"
                                        type="text"
                                        placeholder="Middle Name"
                                        value={form.MiddleName}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        style={inputStyle}
                                        name="LastName"
                                        type="text"
                                        placeholder="Last Name"
                                        value={form.LastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div style={rowContainerStyle}>
                                    <input
                                        style={inputStyle}
                                        name="Email"
                                        type="email"
                                        placeholder="Email"
                                        value={form.Email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="MobileNo"
                                        type="text"
                                        placeholder="Mobile No"
                                        value={form.MobileNo}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="Department"
                                        type="text"
                                        placeholder="Department"
                                        value={form.Department}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div style={rowContainerStyle}>
                                    <input
                                        style={inputStyle}
                                        name="DateOfJoining"
                                        type="date"
                                        placeholder="Date of Joining"
                                        value={form.DateOfJoining}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="LastPositionHeld"
                                        type="text"
                                        placeholder="Last Position Held"
                                        value={form.LastPositionHeld}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        style={inputStyle}
                                        name="DateOfLeaving"
                                        type="date"
                                        placeholder="Date of Leaving"
                                        value={form.DateOfLeaving}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div style={rowContainerStyle}>
                                    <input
                                        style={inputStyle}
                                        name="LastSalaryAnnual"
                                        type="number"
                                        placeholder="Last Salary Annual"
                                        value={form.LastSalaryAnnual}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="EmployeeCode"
                                        type="text"
                                        placeholder="Employee Code"
                                        value={form.EmployeeCode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        style={inputStyle}
                                        name="ExitFormalities"
                                        type="text"
                                        placeholder="Exit Formalities"
                                        value={form.ExitFormalities}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div style={rowContainerStyle}>
                                    <select
                                        name="EmploymentType"
                                        value={form.EmploymentType}
                                        onChange={handleInputChange}
                                        style={{ ...inputStyle, minWidth: 0 }}
                                        required
                                    >
                                        <option value="">Employment Type</option>
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Part-Time">Part-Time</option>
                                        <option value="Intern">Intern</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                    <input
                                        style={inputStyle}
                                        name="AnyBehaviourIssue"
                                        type="text"
                                        placeholder="Any Behaviour Issue"
                                        value={form.AnyBehaviourIssue}
                                        onChange={handleInputChange}
                                    />
                                    <select
                                        name="EligibilityToRehire"
                                        value={form.EligibilityToRehire}
                                        onChange={handleInputChange}
                                        style={{ ...inputStyle, minWidth: 0 }}
                                        required
                                    >
                                        <option value="">Eligibility To Rehire</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                {showContributorField && (
                                    <div style={rowContainerStyle}>
                                        {showCompanyDropdown ? (
                                            <select
                                                name="Contributor"
                                                value={form.Contributor}
                                                onChange={handleInputChange}
                                                style={contributorDropdownStyle}
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
                                                style={{
                                                    ...contributorDropdownStyle,
                                                    background: "#f5f5f5",
                                                    color: "#666",
                                                    cursor: "not-allowed"
                                                }}
                                                tabIndex={-1}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                style={{
                                    ...primaryBtnStyle,
                                    alignSelf: "center",
                                    margin: "22px auto 0 auto",
                                    ...(hoverBtn === "submit" ? buttonHoverStyle : {})
                                }}
                                onMouseEnter={() => setHoverBtn("submit")}
                                onMouseLeave={() => setHoverBtn(null)}
                                disabled={submittingUpdate}
                            >
                                {submittingUpdate ? "Updating..." : "Update Employee"}
                            </button>
                        </form>
                    )}
                </div>
            )}
            <style>
                {`
                @media (max-width: 670px) {
                    .dashboard-page-card {
                        min-width: 99vw !important;
                        width: 99vw !important;
                        padding: 0 !important;
                    }
                }
                @media (max-width: 545px) {
                    .dashboard-page-card, form, .dashboard-page-card > div {
                        min-width: 100vw !important;
                        width: 100vw !important;
                        box-sizing: border-box;
                        margin: 0 !important;
                        border-radius: 0 !important;
                        padding: 8px 2vw !important;
                    }
                    .dashboard-page-card form > div {
                        flex-direction: column !important;
                        gap: 10px !important;
                        align-items: stretch !important;
                    }
                    table {
                        min-width: 880px !important;
                    }
                    .dashboard-page-card .table-search-result {
                        overflow-x: auto !important;
                        min-width: 0 !important;
                    }
                }
                `}
            </style>
        </section>
    );
}

export default AddEmployee
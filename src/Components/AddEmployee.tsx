
import React from "react";

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
    color: "var(--ink)",
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

// Responsive container styles for the card
const cardStyle: React.CSSProperties = {
    width: "98%",
    maxWidth: "700px",
    minHeight: "56vh",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    padding: "32px 12px 28px 12px",
    position: "relative",
    borderRadius: "16px",
    background: "var(--page-card, #204134)",
    boxShadow: "0 2px 8px 0 rgba(40,50,50,0.09)",
    color: "#fff"
};

function AddEmployee() {
    const [hoverBtn, setHoverBtn] = React.useState<"bulk" | "new" | "download" | "submit" | null>(null);
    const [activePanel, setActivePanel] = React.useState<"bulk" | "new" | null>(null);

    // Bulk upload fields
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [company, setCompany] = React.useState("Contributor");
    const [uploading, setUploading] = React.useState(false);

    const handleClick = (panel: "bulk" | "new") => setActivePanel(panel);

    const handleBack = () => {
        setActivePanel(null);
        setSelectedFile(null);
        setCompany("Contributor");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCompany(e.target.value);
    };

    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        // Simulate upload (replace with real handler as needed)
        setTimeout(() => {
            setUploading(false);
            setSelectedFile(null);
            setCompany("Contributor");
            alert("Bulk upload submitted!");
        }, 1400);
    };

    return (
        <section
            className="dashboard-page-card"
            style={{
                width: "65vw",
                height: "50vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                padding: 0,
                margin: 0,
                marginTop: 0,
                position: "relative", // Ensure position relative for absolute child
            }}
        >
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
                        fontWeight: 800,
                    }}
                    onMouseEnter={() => setHoverBtn("download")}
                    onMouseLeave={() => setHoverBtn(null)}
                >
                    Download Sample Excel
                </a>
            )}

            {activePanel === null ? (
                <>
                    <span className="form-kicker" style={{fontSize: "1.08rem", marginBottom: 5}}>Superadmin workspace</span>
                    <p style={{color: "#b7e6b6", fontWeight: 400, marginBottom: 32, marginTop: 0}}>Create a new employee record.</p>
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "470px",
                            margin: "0 auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "18px",
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
                </>
            ) : (
                <div
                    style={{
                        width: "100%",
                        maxWidth: 540,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: "30px",
                        margin: "0 auto",
                        marginTop: "48px"
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
                                <select
                                    value={company}
                                    onChange={handleCompanyChange}
                                    style={{
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
                                    }}
                                    required
                                >
                                    <option value="Contributor">Contributor</option>
                                    <option value="TCS">TCS</option>
                                    <option value="Securitas">Securitas</option>
                                </select>
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
                        <div style={{ textAlign: "center" }}>
                            <h3 style={{marginTop: 12, color: "#fff"}}>Create New Employee</h3>
                            <p style={{color: "#aad9aa"}}>(Your create new employee form or UI will go here.)</p>
                        </div>
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
                }
                @media (max-width: 545px) {
                    .dashboard-page-card form > div {
                        flex-direction: column !important;
                        gap: 10px !important;
                        align-items: stretch !important;
                    }
                }
                `}
            </style>
        </section>
    );
}

export default AddEmployee
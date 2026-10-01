import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileCheck2,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
  Users,
  Handshake,
  LogIn,
  CreditCard,
  Cpu,
  Eye,
  FileText,
  Clock,
  AlertTriangle,
  Zap,
  Lock,
  Sun,
  Moon,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion, useInView, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import bannerVideo from "./assets/video/banner-video.mp4";
import logoWhite from "./assets/Img/logo_w.png";
import logoBlack from "./assets/Img/logo_b.png";
import challengeImg from "./assets/Img/Screenshot 2026-09-28 165143.png";

const solutions: Array<[string, string, string, LucideIcon]> = [
  [
    "01",
    "Centralise With Confidence",
    "Keep all exited employee records in one secure location.",
    Database,
  ],
  [
    "02",
    "Automate With Ease",
    "Streamline third-party verifications through real-time APIs or simple file uploads.",
    Sparkles,
  ],
  [
    "03",
    "Control With Clarity",
    "Define how your data is used, shared, and accessed.",
    ShieldCheck,
  ],
  [
    "04",
    "Integrate Seamlessly",
    "Connect effortlessly with your HRMS or run WorkTrail independently, even offline.",
    FileCheck2,
  ],
];

const complianceMarqueeItems = [
  {
    icon: ShieldCheck,
    title: "100% Verified Credentials",
    badge: "Tamper-Proof",
    color: "#10B981",
  },
  {
    icon: Zap,
    title: "Real-Time Direct Verification",
    badge: "Zero Delays",
    color: "#38BDF8",
  },
  {
    icon: Lock,
    title: "Bank-Grade Data Security",
    badge: "SOC-2 Ready",
    color: "#A78BFA",
  },
  {
    icon: FileCheck2,
    title: "Automated Screening Pipeline",
    badge: "AI Powered",
    color: "#34D399",
  },
  {
    icon: CheckCircle2,
    title: "Integrity-First Compliance",
    badge: "Certified",
    color: "#FBBF24",
  },
  {
    icon: Database,
    title: "Authentic Contributor Master",
    badge: "Live Network",
    color: "#60A5FA",
  },
  {
    icon: Sparkles,
    title: "Smart Discrepancy Detection",
    badge: "Instant Flags",
    color: "#F472B6",
  },
  {
    icon: Users,
    title: "Trusted Enterprise Facilitator",
    badge: "Verified",
    color: "#2DD4BF",
  },
];

const process: Array<[string, string, string, any]> = [
  [
    "01",
    "Login & Create Request",
    "Start by creating your request with candidate details.",
    LogIn,
  ],
  [
    "02",
    "Payment",
    "Securely complete the payment.",
    CreditCard,
  ],
  [
    "03",
    "Verification Process",
    "Our system automatically verifies data.",
    Cpu,
  ],
  [
    "04",
    "Review & Clarify",
    "Review results and raise any questions.",
    Eye,
  ],
  [
    "05",
    "Final Report",
    "Get the completed report.",
    FileText,
  ],
];

interface CounterProps {
  value: number;
  suffix?: string;
}

function Counter({ value, suffix = "%" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 2.0,
        ease: "easeOut",
        onUpdate(latest) {
          if (ref.current) {
            ref.current.textContent = Math.round(latest) + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [value, inView, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const businessTypeOptions = [
  "Background Screening Agency",
  "Enterprise Employer",
  "Startup / SME",
  "Other",
];

const employeeCountOptions = [
  "1-99",
  "100-499",
  "500-1999",
  "2000+",
];

function CustomDropdown({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`form-group custom-dropdown-container ${isOpen ? "is-open" : ""}`} ref={dropdownRef}>
      <label>{label}</label>
      <div
        className={`custom-dropdown-trigger ${isOpen ? "open" : ""} ${value ? "has-value" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
          if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
      >
        <span className={value ? "dropdown-selected-text" : "dropdown-placeholder"}>
          {value || placeholder}
        </span>
        <ChevronDown size={17} className={`dropdown-chevron ${isOpen ? "rotate" : ""}`} />
      </div>

      {isOpen && (
        <div className="custom-dropdown-menu" role="listbox">
          {options.map((option) => (
            <div
              key={option}
              className={`custom-dropdown-item ${value === option ? "selected" : ""}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={value === option}
            >
              <span>{option}</span>
              {value === option && <Check size={15} className="dropdown-check-icon" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Home() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("worktrail_home_theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("worktrail_home_theme", next);
      return next;
    });
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [benefitsTab, setBenefitsTab] = useState<"candidate" | "partner">("candidate");
  
  const [formState, setFormState] = useState({
    companyName: "",
    yourName: "",
    workEmail: "",
    jobTitle: "",
    businessType: "",
    phoneNumber: "",
    employeeCount: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // REWRITTEN: This function now sends data to https://worktrail.ai/api/ContactUS as per API doc.
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    if (!formState.businessType) {
      setFormError("Please select your business type.");
      setIsSubmitting(false);
      return;
    }
    if (!formState.employeeCount) {
      setFormError("Please select the number of employees.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (import.meta.env.DEV) {
        console.log("[Contact API] Submit Request:", formState);
      }
      // Map the form state to the API request as per the CURL spec.
      const payload = {
        CompanyName: formState.companyName,
        YourName: formState.yourName,
        WorkEmail: formState.workEmail,
        JobTitle: formState.jobTitle,
        BusinessType: formState.businessType,
        PhoneNumber: formState.phoneNumber,
        EmployeeCount: formState.employeeCount,
        Message: formState.message,
      };
      const response = await fetch("https://worktrail.ai/api/ContactUS", {
        method: "POST",
        headers: {
          APIKEY: "Securitas@#!1234",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Try reading JSON or plain text from response
      let responseData: any;
      let responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(responseData.message || "Something went wrong. Please try again.");
      }

      setFormSuccess("Thank you! We've received your request and will connect with you soon.");
      setFormState({
        companyName: "",
        yourName: "",
        workEmail: "",
        jobTitle: "",
        businessType: "",
        phoneNumber: "",
        employeeCount: "",
        message: ""
      });
    } catch (err: any) {
      setFormError(err.message || "Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveStep((step) => (step + 1) % process.length),
      1500,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className={`home-page ${theme}`}>
      <header className="home-header">
        <div className="home-container home-nav">
          <motion.a
            className="securitas-logo"
            href="https://www.securitas.in"
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              className="public-logo"
              src={theme === "light" ? logoBlack : logoWhite}
              alt="Securitas Logo"
            />
          </motion.a>
          <nav className={menuOpen ? "home-menu open" : "home-menu"}>
            <a href="#solutions" onClick={() => setMenuOpen(false)}>
              Solutions
            </a>
            <a href="#process" onClick={() => setMenuOpen(false)}>
              How It Works
            </a>
            <a href="#resources" onClick={() => setMenuOpen(false)}>
              Resources
            </a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
            <Link className="nav-login" to="/login">
              Login
            </Link>
            <a
              className="nav-cta"
              href="#contact"
              onClick={() => setMenuOpen(false)}
            >
              Get Started <ArrowRight size={15} />
            </a>
            <button
              type="button"
              className="theme-toggle-btn desktop-theme-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <>
                  <Sun size={15} className="theme-toggle-icon sun" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="theme-toggle-icon moon" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </nav>
          <div className="home-nav-mobile-bar">
            <button
              type="button"
              className="theme-toggle-btn mobile-theme-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun size={18} className="theme-toggle-icon sun" />
              ) : (
                <Moon size={18} className="theme-toggle-icon moon" />
              )}
            </button>
            <button
              className="menu-toggle"
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-container hero-layout">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="home-kicker">Secure workforce intelligence</p>
            <h1>
              Worktrail: Drowning in Manual Verification Requests & Compliance Risks?
            </h1>
            <p>
              Hiring for complex work environments? Streamline background screening with a faster, smarter approach. Move beyond outdated checks to get better visibility into employee history and credentials.
            </p>
            <a className="hero-button" href="#contact">
              LET'S TALK <ArrowRight size={17} />
            </a>
          </motion.div>
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
          >
            <div className="hero-video-wrapper">
              <video
                className="hero-video-player"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={bannerVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="hero-video-glass-reflection"></div>
            </div>
          </motion.div>
        </div>
        <div className="hero-fade"></div>
      </section>

      <motion.section
        className="intro-section"
        id="solutions"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, visible: {} }}
      >
        <motion.div
          className="home-container intro-copy"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6 }}
        >
          <p className="home-kicker">One clear source of truth</p>
          <h2>Worktrail: Simplifying the Verification Journey</h2>
          <p className="intro-subtitle">Secure, Scalable, Streamlined Solution</p>
          <p>
            Automate and streamline your employment verification process. Protect your company from bad hires, manual process, and inaccurate data by ensuring quick and reliable results.
          </p>
        </motion.div>
        <div className="home-container solution-grid">
          {solutions.map(([number, title, copy, Icon], index) => (
            <motion.article
              className="solution-card"
              key={number}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="solution-icon"
                whileHover={{ rotate: 8, scale: 1.1 }}
              >
                <Icon size={24} />
              </motion.div>
              <span className="solution-number">{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <div className="compliance-marquee-wrapper">
        <div className="compliance-marquee">
          <motion.div
            className="marquee-track"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
          >
            {[...complianceMarqueeItems, ...complianceMarqueeItems].map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div key={idx} className="marquee-pill-group">
                  <div className="marquee-pill">
                    <span
                      className="marquee-icon-wrapper"
                      style={{
                        color: item.color,
                        background: `${item.color}18`,
                        borderColor: `${item.color}35`,
                      }}
                    >
                      <ItemIcon size={16} />
                    </span>
                    <span className="marquee-pill-title">{item.title}</span>
                    <span
                      className="marquee-pill-badge"
                      style={{
                        color: item.color,
                        background: `${item.color}15`,
                        borderColor: `${item.color}30`,
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <span className="marquee-separator">✦</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <section className="challenge-section" id="resources">
        <div className="home-container challenge-layout">
          <motion.div 
            className="challenge-copy"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2>The Challenge</h2>
            <p className="challenge-subhead">
              The challenge of converting compliance risks into measurable business Impact.
            </p>

            <div className="challenge-image-wrapper">
              <img 
                src={challengeImg} 
                alt="The Challenge - Verification Overview" 
                className="challenge-img" 
              />
            </div>
            
            <p className="challenge-desc">
              A mid-sized supply chain firm with high employee turnover was overwhelmed. Their HR team received
            </p>

            <div className="challenge-callout-highlight">
              50+ emails &amp; calls weekly from third-party verifiers
            </div>

            <p className="challenge-desc">
              asking to confirm details of former employees. This manual process was delaying their own recruitment efforts, creating compliance risks regarding data privacy, &amp; offering zero return on investment.
            </p>
          </motion.div>
          
          <div className="impact-stack">
            {/* The Solution Card */}
            <motion.article 
              className="impact-card solution-impact"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              whileHover={{ 
                y: -6, 
                boxShadow: "0 20px 45px rgba(155, 119, 255, 0.25)",
                borderColor: "rgba(155, 119, 255, 0.6)"
              }}
            >
              <h3>The Solution</h3>
              <p className="impact-card-intro">
                The firm onboarded onto WorkTrail as a &quot;Contributor.&quot; They uploaded their master ex-employee data into our secure, encrypted environment.
              </p>
              
              <div className="card-two-cols">
                <div className="card-feature-item">
                  <div className="feature-icon-wrapper purple">
                    <Cpu size={22} />
                  </div>
                  <p>
                    <strong>Automation:</strong> Instead of HR manually digging through files, our APIs automatically matched incoming requests against the uploaded records.
                  </p>
                </div>

                <div className="card-feature-item">
                  <div className="feature-icon-wrapper purple">
                    <Database size={22} />
                  </div>
                  <p>
                    <strong>Centralization:</strong> All verification requests were redirected to our portal.
                  </p>
                </div>
              </div>
            </motion.article>
            
            {/* The Impact Card */}
            <motion.article 
              className="impact-card result-impact"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              whileHover={{ 
                y: -6, 
                boxShadow: "0 20px 45px rgba(77, 255, 149, 0.25)",
                borderColor: "rgba(77, 255, 149, 0.6)"
              }}
            >
              <h3>The Impact</h3>
              <p className="impact-card-intro">
                Within three months, the firm saw a complete transformation:
              </p>
              
              <div className="card-two-cols">
                <div className="card-feature-item">
                  <div className="feature-icon-wrapper green">
                    <Clock size={22} />
                  </div>
                  <p>
                    <strong>90% Reduction in Admin Work:</strong> The HR team stopped answering verification calls entirely, freeing them to focus on active hiring.
                  </p>
                </div>

                <div className="card-feature-item">
                  <div className="feature-icon-wrapper green">
                    <CreditCard size={22} />
                  </div>
                  <p>
                    <strong>New Revenue Channel:</strong> By leveraging our monetisation feature, they began earning a fee for every verified record, turning a tedious task into measurable business impact.
                  </p>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Key Benefits Stats Strip */}
      <section className="stats-strip-section">
        <div className="home-container stats-strip-grid">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="stat-strip-card"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.03, y: -12 }}
            >
              <div className="stat-card-left">
                <svg width="76" height="76" viewBox="0 0 76 76" className="progress-ring">
                  <circle cx="38" cy="38" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                  <circle 
                    cx="38" 
                    cy="38" 
                    r="32" 
                    stroke="url(#purpleGrad)" 
                    strokeWidth="4" 
                    fill="none" 
                    strokeDasharray="201" 
                    strokeDashoffset="20"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9b77ff" />
                      <stop offset="100%" stopColor="#ec77ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="stat-card-icon-overlay">
                  <Clock size={20} />
                </div>
              </div>
              
              <div className="stat-card-right">
                <strong>
                  <Counter value={90} />
                </strong>
                <span className="stat-subtitle">VERIFICATION TIMELINES REDUCED BY</span>
                <p className="stat-desc">Faster verifications, quicker closures and on-time onboarding.</p>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            <motion.div
              className="stat-strip-card"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
              whileHover={{ scale: 1.03, y: -12 }}
            >
              <div className="stat-card-left">
                <svg width="76" height="76" viewBox="0 0 76 76" className="progress-ring">
                  <circle cx="38" cy="38" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                  <circle 
                    cx="38" 
                    cy="38" 
                    r="32" 
                    stroke="url(#greenGrad)" 
                    strokeWidth="4" 
                    fill="none" 
                    strokeDasharray="201" 
                    strokeDashoffset="2"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4dff95" />
                      <stop offset="100%" stopColor="#00f0ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="stat-card-icon-overlay">
                  <ShieldCheck size={20} />
                </div>
              </div>
              
              <div className="stat-card-right">
                <strong>
                  <Counter value={99} />
                </strong>
                <span className="stat-subtitle">REDUCTION IN NON-COMPLIANCE RISK</span>
                <p className="stat-desc">Stronger compliance, fewer risks and complete audit readiness.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="process-section" id="process">
        <div className="home-container">
          <motion.div
            className="process-heading"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <p className="home-kicker">Simple from start to finish</p>
              <h2>Process to Verify By Employee In & Out Flow</h2>
            </div>
            <p>
              Streamline candidate management and hiring. Get faster results by optimizing your screening workflow and reducing operational steps.
            </p>
          </motion.div>
          <div className="process-list">
            {process.map(([number, title, copy, IconComponent], index) => (
              <motion.article
                className={
                  index === activeStep ? "process-step current" : "process-step"
                }
                animate={{
                  opacity: index <= activeStep ? 1 : 0.55,
                  y: index === activeStep ? -8 : 0,
                }}
                transition={{ duration: 0.45 }}
                key={number}
                onMouseEnter={() => setActiveStep(index)}
              >
                <div className="process-icon-wrapper">
                  <IconComponent size={24} className="process-icon-svg" />
                </div>
                <span className="process-number">{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                {index < process.length - 1 && (
                  <span className="process-line-wrapper">
                    <span className="process-line-bar"></span>
                    <span className="process-line-arrow">
                      <ArrowRight size={10} />
                    </span>
                  </span>
                )}
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="benefits-toggle-section">
        <div className="home-container">
          <motion.div 
            className="benefits-heading"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>What's in it for <em>YOU?</em></h2>
          </motion.div>

          <div className="benefits-tab-wrapper">
            <div className="benefits-tabs">
              <button 
                className={`benefits-tab ${benefitsTab === "candidate" ? "active" : ""}`}
                onClick={() => setBenefitsTab("candidate")}
              >
                <Users size={16} />
                Candidate
              </button>
              <button 
                className={`benefits-tab ${benefitsTab === "partner" ? "active" : ""}`}
                onClick={() => setBenefitsTab("partner")}
              >
                <Handshake size={16} />
                Client
              </button>
            </div>
          </div>

          <div className="benefits-content-layout">
            <motion.div 
              className="benefits-visual-box"
              key={benefitsTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <img  
                src={benefitsTab === "candidate" ? "https://worktrail.ai/static/assets/img/11.png" : "https://worktrail.ai/static/assets/img/22.png"} 
                alt={benefitsTab === "candidate" ? "Candidate" : "Partner"} 
                className="benefits-image"
              />
            </motion.div>

            <div className="benefits-details">
              {benefitsTab === "candidate" ? (
                <div className="benefits-list">
                  <motion.div className="benefit-item" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <div className="benefit-icon"><ShieldCheck size={20} /></div>
                    <div className="benefit-text">
                      <h3>Faster Hiring</h3>
                      <p>Speed up onboarding with seamless workflows & instant verification.</p>
                    </div>
                  </motion.div>
                  <motion.div className="benefit-item" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <div className="benefit-icon"><ShieldCheck size={20} /></div>
                    <div className="benefit-text">
                      <h3>Real-time visibility</h3>
                      <p>Stay updated on application status & screening progress.</p>
                    </div>
                  </motion.div>
                  <motion.div className="benefit-item" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <div className="benefit-icon"><ShieldCheck size={20} /></div>
                    <div className="benefit-text">
                      <h3>Access from anywhere</h3>
                      <p>Access the platform from any device, anywhere, anytime.</p>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="benefits-list">
                  <motion.div className="benefit-item" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <div className="benefit-icon"><ShieldCheck size={20} /></div>
                    <div className="benefit-text">
                      <h3>Direct Integrations</h3>
                      <p>Easily connect via API or HRMS widgets with full documentation.</p>
                    </div>
                  </motion.div>
                  <motion.div className="benefit-item" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <div className="benefit-icon"><ShieldCheck size={20} /></div>
                    <div className="benefit-text">
                      <h3>Monetisation Channel</h3>
                      <p>Turn historical compliance checks into passive revenue streams.</p>
                    </div>
                  </motion.div>
                  <motion.div className="benefit-item" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <div className="benefit-icon"><ShieldCheck size={20} /></div>
                    <div className="benefit-text">
                      <h3>Secure Ecosystem</h3>
                      <p>Data privacy first design with full auditing and access control.</p>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="home-container cta-inner">
          <p className="home-kicker">Ready when you are</p>
          <h2>Modern Verification For Modern Businesses</h2>
          <a className="hero-button" href="#contact">
            LET'S TALK <ArrowRight size={17} />
          </a>
        </div>
      </section>

      {/* New Contact Form Section */}
      <section className="contact-form-section" id="contact">
        <div className="home-container contact-layout">
          <div className="contact-copy-block">
            <p className="home-kicker">Get in touch</p>
            <h2>Ready to Modernize Your Verification Process?</h2>
            <p>
              Tell us about your business, the volume of employees you screen, and we'll connect with you on customized, cost-effective solution.
            </p>
            <div className="contact-data-points">
              <div className="data-point-card">
                <strong>50+</strong>
                <span>Database Checks</span>
              </div>
              <div className="data-point-card">
                <strong>0%</strong>
                <span>Processing Fees</span>
              </div>
              <div className="data-point-card">
                <strong>24x7</strong>
                <span>Average Turnaround</span>
              </div>
            </div>
          </div>
          <div className="contact-form-block">
            <form onSubmit={handleFormSubmit} className="contact-grid-form">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formState.companyName}
                  onChange={handleInputChange}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="yourName"
                  value={formState.yourName}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Your Work Email</label>
                <input
                  type="email"
                  name="workEmail"
                  value={formState.workEmail}
                  onChange={handleInputChange}
                  placeholder="e.g. john@company.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formState.jobTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. HR Director"
                  required
                />
              </div>
              <CustomDropdown
                label="Business Type"
                value={formState.businessType}
                options={businessTypeOptions}
                placeholder="Select business type"
                onChange={(val) => setFormState((prev) => ({ ...prev, businessType: val }))}
              />
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formState.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 98765 43210"
                  required
                />
              </div>
              <CustomDropdown
                label="Number of Employees"
                value={formState.employeeCount}
                options={employeeCountOptions}
                placeholder="Select employee count"
                onChange={(val) => setFormState((prev) => ({ ...prev, employeeCount: val }))}
              />
              <div className="form-group full-width">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about the volume of employees you screen and your requirements..."
                  rows={3}
                  required
                />
              </div>
              
              {formSuccess && <p className="form-feedback success">{formSuccess}</p>}
              {formError && <p className="form-feedback error">{formError}</p>}

              <button type="submit" className="form-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-container footer-inner-grid">
          <div className="footer-brand-col">
            <span className="securitas-logo">
              <img
                className="public-logo"
                src={theme === "light" ? logoBlack : logoWhite}
                alt="Securitas Logo"
              />
            </span>
            <p className="footer-brand-desc">
              Streamlining background screening and credential verification for complex workforce environments.
            </p>
          </div>
          <div className="footer-links-col">
            <h4>Product</h4>
            <a href="#solutions">Product Features</a>
            <a href="#process">How It Works</a>
            <a href="#resources">Resources</a>
            <a href="#careers">Careers</a>
          </div>
          <div className="footer-links-col">
            <h4>Contact</h4>
            <a href="#contact">Talk to us</a>
            <a href="#help">Help Center</a>
            <a href="#status">Status</a>
            <a href="#developers">Developers</a>
            <a href="#about">About Us</a>
          </div>
          <div className="footer-links-col">
            <h4>About</h4>
            <Link to="/Privacypolicy">Legal</Link>
            <a href="#terms">Terms</a>
            <a href="#conditions">Conditions</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div className="home-container footer-bottom">
          <span>© 2026 Worktrail India. All rights reserved.</span>
          <span>Verification, without the wait.</span>
        </div>
      </footer>
    </main>
  );
}

export default Home;

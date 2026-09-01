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
} from "lucide-react";
import { motion, useInView, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "./endpoint";
import bannerVideo from "./assets/video/banner-video.mp4";

const solutions: Array<[string, string, string, LucideIcon]> = [
  [
    "01",
    "Seamlessly integrate",
    "Easily integrate with existing ATS/HR platforms.",
    Database,
  ],
  [
    "02",
    "Instant Verification",
    "Verify identity & employment data in real-time.",
    Sparkles,
  ],
  [
    "03",
    "Real-time Access",
    "Check results & manage requests via a secure web portal.",
    ShieldCheck,
  ],
  [
    "04",
    "Regulatory Compliance",
    "Stay compliant with industry regulations.",
    FileCheck2,
  ],
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

function Home() {
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      if (import.meta.env.DEV) {
        console.log("[Contact API] Submit Request:", formState);
      }
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: "POST",
        headers: {
          APIKEY: "Securitas@#!1234",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formState.yourName.trim().toLowerCase().replace(/\s+/g, "_") + "_lead",
          password: "LeadUserTempPassword@123",
          UserType: "Lead",
          EmailID: formState.workEmail,
          FirstName: formState.yourName,
          LastName: "",
          CompanyName: formState.companyName,
          GSTNumber: "",
          Address: formState.message,
          City: formState.jobTitle,
          State: formState.businessType,
          Country: formState.phoneNumber,
          ZIPcode: formState.employeeCount
        }),
      });

      const responseText = await response.text();
      let responseData: any;
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
    <main className="home-page">
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
            <img className="public-logo" src="https://worktrail.ai/static/assets/img/securitas_ab_logo.svg" alt="" />
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
          </nav>
          <button
            className="menu-toggle"
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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

      <div className="compliance-marquee">
        <motion.div
          className="marquee-track"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          Proven Prevention <b>/</b> Integrity Matters <b>/</b> Minimize Delays <b>/</b> Trusted Service <b>/</b> Integrity Matters <b>/</b> Integrity Matters <b>/</b> Integrity Matters <b>/</b> Trusted Service <b>/</b> Proven Prevention <b>/</b> Integrity Matters <b>/</b> Minimize Delays <b>/</b> Trusted Service <b>/</b>
        </motion.div>
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
            <div className="kicker-pill-wrapper">
              <span className="home-kicker kicker-pill">FROM RISK TO IMPACT</span>
            </div>
            <h2>The <span className="gradient-text-challenge">Challenge</span></h2>
            <div className="challenge-title-bar"></div>
            
            <div className="challenge-left-overlay">
              <div className="overlay-icon-wrapper">
                <Users size={20} />
              </div>
              <p>
                Identifying candidates and <strong>managing manual background</strong> verification and screening.
              </p>
            </div>
            
            <p className="challenge-desc">
              Hiring for complex work environments requires thorough screening. Outdated verification processes with manual steps can be <strong>error-prone, time-consuming</strong>, and hard to track, risking non-compliance.
            </p>
            
            <motion.a 
              className="learn-more-glow-btn" 
              href="#contact"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              LEARN MORE &rarr;
            </motion.a>
          </motion.div>
          
          <div className="impact-stack">
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
              <div className="card-illustration-wrapper">
                <svg width="70" height="70" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="15" y="15" width="40" height="50" rx="6" fill="#080318" stroke="#9b77ff" strokeWidth="2" opacity="0.8"/>
                  <line x1="25" y1="28" x2="45" y2="28" stroke="#9b77ff" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="25" y1="36" x2="38" y2="36" stroke="#9b77ff" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="25" y="44" width="8" height="12" rx="1" fill="#9b77ff"/>
                  <rect x="37" y="48" width="8" height="8" rx="1" fill="#9b77ff" opacity="0.6"/>
                  <circle cx="55" cy="55" r="14" fill="#080318" stroke="#ff4d4d" strokeWidth="2"/>
                  <path d="M55 48V56" stroke="#ff4d4d" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="55" cy="61" r="1.5" fill="#ff4d4d"/>
                </svg>
              </div>

              <span className="card-label">
                <span className="pulse-dot-purple"></span> IMPACT & RISKS
              </span>
              <h3>Operational Inefficiencies</h3>
              
              <div className="challenge-list">
                <motion.div 
                  className="challenge-item"
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="item-icon-circle"><Clock size={16} /></div>
                  <div className="item-copy">
                    <strong>1. Hiring delays</strong>
                    <p>Operational inefficiency slows down critical onboarding and candidate progression.</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="challenge-item"
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="item-icon-circle"><FileText size={16} /></div>
                  <div className="item-copy">
                    <strong>2. Lack of standard reports & audit trails</strong>
                    <p>Compliance issues arise when records are unstructured and hard to audit.</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="challenge-item"
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="item-icon-circle"><Zap size={16} /></div>
                  <div className="item-copy">
                    <strong>3. Lengthy processes & gaps</strong>
                    <p>Reduced candidate satisfaction due to communication voids and slow verifications.</p>
                  </div>
                </motion.div>
              </div>
            </motion.article>
            
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
              <div className="card-illustration-wrapper">
                <svg width="70" height="70" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="22" stroke="#4dff95" strokeWidth="2" strokeDasharray="6 4" />
                  <circle cx="40" cy="40" r="16" fill="#02140a" stroke="#4dff95" strokeWidth="1.5" />
                  <path d="M35 40L38 43L45 36" stroke="#4dff95" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="20" cy="28" r="2.5" fill="#4dff95" opacity="0.7"/>
                  <circle cx="60" cy="52" r="2.5" fill="#4dff95" opacity="0.7"/>
                  <circle cx="58" cy="26" r="2" fill="#4dff95" opacity="0.5"/>
                  <circle cx="24" cy="54" r="1.5" fill="#4dff95" opacity="0.5"/>
                </svg>
              </div>

              <span className="card-label">
                <span className="pulse-dot-green"></span> THE FUTURE
              </span>
              <h3>Agile & Automated</h3>
              <p>
                Embrace the transition from manual, error-prone processes to <span className="gradient-text-green">agile, automated workflows</span>. This shift empowers your HR team to focus on core tasks, making hiring faster and smarter.
              </p>
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
                Partner
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
              <div className="form-group">
                <label>Business Type</label>
                <select
                  name="businessType"
                  value={formState.businessType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select business type</option>
                  <option value="Background Screening Agency">Background Screening Agency</option>
                  <option value="Enterprise Employer">Enterprise Employer</option>
                  <option value="Startup / SME">Startup / SME</option>
                  <option value="Other">Other</option>
                </select>
              </div>
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
              <div className="form-group">
                <label>Number of Employees</label>
                <select
                  name="employeeCount"
                  value={formState.employeeCount}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select employee count</option>
                  <option value="1-99">1-99</option>
                  <option value="100-499">100-499</option>
                  <option value="500-1999">500-1999</option>
                  <option value="2000+">2000+</option>
                </select>
              </div>
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
              <img className="public-logo" src="https://worktrail.ai/static/assets/img/securitas_ab_logo.svg" alt="" />
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

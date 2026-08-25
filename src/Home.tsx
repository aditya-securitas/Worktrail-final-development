import { ArrowRight, CheckCircle2, Database, FileCheck2, Menu, ShieldCheck, Sparkles, X, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const solutions: Array<[string, string, string, LucideIcon]> = [
  ['01', 'Centralise With Confidence', 'Keep all exited employee records in one secure location.', Database],
  ['02', 'Automate With Ease', 'Streamline third-party verifications through real-time APIs or file uploads.', Sparkles],
  ['03', 'Control With Clarity', 'Define how your data is used, shared, and accessed.', ShieldCheck],
  ['04', 'Integrate Seamlessly', 'Connect effortlessly with your HRMS or run WorkTrail independently.', FileCheck2],
]

const process = [
  ['01', 'Login & Create Request', 'Start by creating your request with candidate details.'],
  ['02', 'Payment', 'Securely complete the payment.'],
  ['03', 'Verification Process', 'Our system automatically verifies data.'],
  ['04', 'Review & Clarify', 'Review results and raise any questions.'],
  ['05', 'Final Report', 'Get the completed report.'],
]

function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActiveStep((step) => (step + 1) % process.length), 1500)
    return () => window.clearInterval(timer)
  }, [])

  return <main className="home-page">
    <header className="home-header"><div className="home-container home-nav"><motion.a className="securitas-logo" href="https://www.securitas.in" target="_blank" rel="noreferrer" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}><img className="public-logo" src="/favicon.svg" alt="" /><span>SECURITAS</span></motion.a><nav className={menuOpen ? 'home-menu open' : 'home-menu'}><a href="#solutions" onClick={() => setMenuOpen(false)}>Solutions</a><a href="#process" onClick={() => setMenuOpen(false)}>How it works</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a><Link className="nav-login" to="/login">Login</Link><a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Get Started <ArrowRight size={15} /></a></nav><button className="menu-toggle" type="button" aria-label="Toggle menu" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={24} /> : <Menu size={24} />}</button></div></header>

    <section className="home-hero"><div className="home-container hero-layout"><motion.div className="hero-copy" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7, delay: .15 }}><p className="home-kicker">Secure workforce intelligence</p><h1>Verification,<br /><em>without the wait.</em></h1><p>Stop losing valuable HR hours to endless ex-employee verification emails and calls. WorkTrail centralises, automates, and protects every record.</p><a className="hero-button" href="#contact">Get in touch <ArrowRight size={17} /></a></motion.div><motion.div className="hero-visual" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .25, ease: 'easeOut' }}><motion.div className="visual-orbit orbit-one" animate={{ rotate: [0, 360] }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}></motion.div><motion.div className="visual-orbit orbit-two" animate={{ rotate: [38, -322] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}></motion.div><motion.div className="visual-core" animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}><ShieldCheck size={56} /><span>Verified</span><strong>Workforce</strong></motion.div><motion.div className="data-chip chip-one" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: .3 }}><CheckCircle2 size={15} /> Record matched</motion.div><motion.div className="data-chip chip-two" animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity }}><span>99.8%</span> accuracy</motion.div></motion.div></div><div className="hero-fade"></div></section>

    <motion.section className="intro-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={{ hidden: {}, visible: {} }}><motion.div className="home-container intro-copy" variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: .6 }}><p className="home-kicker">One clear source of truth</p><h2>WorkTrail is the smarter way to manage <em>ex-employee verification.</em></h2><p>Secure, scalable, and instant. Our platform centralises, controls, and automates the entire verification workflow, so your teams can focus on what moves business forward.</p></motion.div><div className="home-container solution-grid" id="solutions">{solutions.map(([number, title, copy, Icon], index) => <motion.article className="solution-card" key={number} initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .5, delay: index * .1 }}><motion.div className="solution-icon" whileHover={{ rotate: 8, scale: 1.1 }}><Icon size={24} /></motion.div><span className="solution-number">{number}</span><h3>{title}</h3><p>{copy}</p></motion.article>)}</div></motion.section>

    <div className="compliance-marquee"><motion.div className="marquee-track" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}>Compliance First <b>/</b> Data Protection <b>/</b> Fraud Prevention <b>/</b> Integrity Matters <b>/</b> Hire with Confidence <b>/</b> Identity Authentication <b>/</b> Trusted Screening <b>/</b> Verified Workforce <b>/</b> Compliance First <b>/</b> Data Protection <b>/</b> Fraud Prevention <b>/</b> Integrity Matters <b>/</b> Hire with Confidence <b>/</b></motion.div></div>

    <section className="challenge-section"><div className="home-container challenge-layout"><div className="challenge-copy"><p className="home-kicker">From risk to impact</p><h2>The challenge of converting compliance risks into measurable business impact.</h2><div className="stat-callout"><strong>50+</strong><span>verification emails and calls every week can disappear with the right system.</span></div><p>Manual processes delay recruitment, create data privacy risks, and offer no measurable return on investment.</p><a className="outline-button" href="#contact">See the difference <ArrowRight size={16} /></a></div><div className="impact-stack"><article className="impact-card solution-impact"><span className="card-label">The solution</span><h3>Built for clarity, designed for control.</h3><p>Upload your master ex-employee data into a secure, encrypted environment. Incoming requests are automatically matched against verified records.</p><div className="impact-points"><span><CheckCircle2 size={16} /> Automated matching</span><span><CheckCircle2 size={16} /> Centralised records</span></div></article><article className="impact-card result-impact"><span className="card-label">The impact</span><h3>Less admin. More momentum.</h3><p>Within three months, teams see a measurable transformation in speed, focus, and operational confidence.</p><div className="impact-points"><span><CheckCircle2 size={16} /> 90% less admin work</span><span><CheckCircle2 size={16} /> A new revenue channel</span></div></article></div></div></section>

    <section className="process-section" id="process"><div className="home-container"><motion.div className="process-heading" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><div><p className="home-kicker">Simple from start to finish</p><h2>Process to verify<br /><em>ex-employees with ease.</em></h2></div><p>Our end-to-end platform streamlines every step with speed, accuracy, and transparency.</p></motion.div><div className="process-list">{process.map(([number, title, copy], index) => <motion.article className={index === activeStep ? 'process-step current' : 'process-step'} animate={{ opacity: index <= activeStep ? 1 : .55, y: index === activeStep ? -8 : 0 }} transition={{ duration: .45 }} key={number}><span className="process-number">{number}</span><h3>{title}</h3><p>{copy}</p>{index < process.length - 1 && <span className="process-line"></span>}</motion.article>)}</div></div></section>

    <section className="home-cta" id="contact"><div className="home-container cta-inner"><p className="home-kicker">Ready when you are</p><h2>Modern verification for<br /><em>modern businesses.</em></h2><p>Talk to our team about making your verification process faster, safer, and easier to scale.</p><a className="hero-button" href="mailto:verify.global@securitas.in">Start a conversation <ArrowRight size={17} /></a></div></section>
    <footer className="home-footer"><div className="home-container footer-inner"><a className="securitas-logo" href="https://www.securitas.in" target="_blank" rel="noreferrer"><img className="public-logo" src="/favicon.svg" alt="" /><span>SECURITAS</span></a><div><span>© 2026 Securitas India</span><span>WorkTrail, made simple.</span></div></div></footer>
  </main>
}

export default Home

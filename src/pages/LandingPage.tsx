import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useCampusTranslation } from "../i18n/campusTranslations";
import AnimatedDataMesh from "../components/AnimatedDataMesh";

export default function LandingPage() {
  const navigate = useNavigate();
  const { text } = useCampusTranslation();
  const reduceMotion = useReducedMotion();
  const rise = reduceMotion ? {} : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: .75, ease: [0.22, 1, 0.36, 1] as const } };
  const inView = reduceMotion ? {} : { initial: { opacity: 0, y: 36 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .18 }, transition: { duration: .7, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <div className="landing-shell university-landing">
      <div className="institution-bar"><span>MMU</span><p>{text("common.brandSubtitle")}</p><small>Cyberjaya · Malaysia</small></div>
      <header className="landing-nav">
        <Link className="brand-lockup" to="/" aria-label="CampusPulse home">
          <span className="brand-mark">CP</span>
          <span><b>CampusPulse</b><small>{text("common.brandSubtitle")}</small></span>
        </Link>
        <nav className="landing-links" aria-label="Primary navigation">
          <a href="#features">{text("landing.features")}</a>
          <a href="#how-it-works">{text("landing.how")}</a>
        </nav>
        <div className="landing-nav-actions"><LanguageSwitcher tone="dark" /><Link className="nav-cta" to="/login">{text("common.signIn")} <ArrowForwardRoundedIcon /></Link></div>
      </header>

      <main>
        <section className="hero-section university-hero">
          <motion.div className="hero-copy" {...rise}>
            <div className="eyebrow"><span /> {text("landing.eyebrow")}</div>
            <h1>{text("landing.title1")} <em>{text("landing.title2")}</em></h1>
            <p>{text("landing.subtitle")}</p>
            <div className="hero-actions">
              <Link className="primary-cta" to="/login">{text("landing.start")} <ArrowForwardRoundedIcon /></Link>
              <a className="secondary-cta" href="#how-it-works">{text("landing.meet")}</a>
            </div>
            <div className="hero-proof">
              <span><strong>01</strong>{text("landing.proof1")}</span>
              <span><strong>24/7</strong>{text("landing.proof2")}</span>
              <span><strong>0</strong>{text("landing.proof3")}</span>
            </div>
          </motion.div>

          <motion.div className="university-hero-visual" initial={reduceMotion ? false : { opacity: 0, x: 44 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .9, delay: .12, ease: [0.22, 1, 0.36, 1] }}>
            <div className="hero-photo-frame"><img src="/campus-stream.png" alt={text("authVisual.alt")} /></div>
            <AnimatedDataMesh variant="hero" />
            <div className="hero-campus-label"><span>MMU / 01</span><strong>{text("authVisual.badge")}</strong></div>
            <motion.article className="hero-deadline-card" animate={reduceMotion ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <CalendarMonthRoundedIcon />
              <div><small>{text("authVisual.deadline")}</small><strong>{text("authVisual.deadlineValue")}</strong></div>
              <span>12:00</span>
            </motion.article>
            <article className="hero-attendance-card"><FactCheckRoundedIcon /><div><small>{text("status.attendance")}</small><strong>78.58%</strong></div><i><b style={{ width: "78.58%" }} /></i></article>
          </motion.div>
        </section>

        <div className="campus-service-ribbon" aria-label="CampusPulse services">
          <span><CalendarMonthRoundedIcon />{text("nav.calendar")}</span>
          <span><FactCheckRoundedIcon />{text("nav.attendance")}</span>
          <span><NotificationsActiveRoundedIcon />{text("nav.notifications")}</span>
        </div>

        <motion.section className="landing-features university-features" id="features" {...inView}>
          <header>
            <span>{text("landing.featureKicker")}</span>
            <h2>{text("landing.featureTitle")} <em>{text("landing.featureAccent")}</em></h2>
            <p>{text("landing.featureText")}</p>
          </header>
          <div className="landing-feature-grid">
            <article><b>01</b><CalendarMonthRoundedIcon /><h3>{text("landing.f1Title")}</h3><p>{text("landing.f1Text")}</p><span>{text("nav.calendar")} <ArrowForwardRoundedIcon /></span></article>
            <article><b>02</b><NotificationsActiveRoundedIcon /><h3>{text("landing.f2Title")}</h3><p>{text("landing.f2Text")}</p><span>{text("nav.notifications")} <ArrowForwardRoundedIcon /></span></article>
            <article><b>03</b><SchoolRoundedIcon /><h3>{text("landing.f3Title")}</h3><p>{text("landing.f3Text")}</p><span>{text("nav.discover")} <ArrowForwardRoundedIcon /></span></article>
          </div>
        </motion.section>

        <motion.section className="product-window-section" {...inView}>
          <div className="product-window-copy">
            <span>{text("landing.storyKicker")}</span>
            <h2>{text("landing.storyTitle1")}<br />{text("landing.storyTitle2")}</h2>
            <p>{text("landing.subtitle")}</p>
            <Link to="/login">{text("landing.enter")} <ArrowForwardRoundedIcon /></Link>
          </div>
          <div className="product-window">
            <div className="product-window-bar"><span /><span /><span /><small>campuspulse.mmu.edu.my</small></div>
            <div className="product-window-body">
              <aside><b>CP</b><i className="active" /><i /><i /><i /></aside>
              <div>
                <header><small>{text("landing.friday")}</small><strong>{text("landing.morning")}</strong></header>
                <section><span>{text("landing.daily")}</span><b>{text("landing.three")}</b><button onClick={() => navigate("/login")}>{text("landing.review")}</button></section>
                <main>
                  <article><h3><CalendarMonthRoundedIcon />{text("landing.today")}</h3><p><time>10:00</time><b>{text("landing.ethics")}</b></p><p><time>14:00</time><b>{text("landing.workshop")}</b></p><p><time>18:30</time><b>{text("landing.briefing")}</b></p></article>
                  <article><h3>{text("status.title")}</h3><div><span>{text("status.attendance")}</span><b>78.58%</b></div><div><span>{text("status.grades")}</span><b>82.4%</b></div><div><span>{text("status.level")}</span><b>{text("status.levelValue")}</b></div></article>
                </main>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section className="landing-story university-story" id="how-it-works" {...inView}>
          <div className="story-intro"><span>{text("landing.storyKicker")}</span><h2>{text("landing.storyTitle1")}<br />{text("landing.storyTitle2")}</h2></div>
          <ol>
            <li><b>01</b><div><strong>{text("landing.gather")}</strong><p>{text("landing.gatherText")}</p></div></li>
            <li><b>02</b><div><strong>{text("landing.understand")}</strong><p>{text("landing.understandText")}</p></div></li>
            <li><b>03</b><div><strong>{text("landing.act")}</strong><p>{text("landing.actText")}</p></div></li>
          </ol>
        </motion.section>

        <section className="landing-stats university-stats">
          <div><strong>12</strong><span>{text("landing.sources")}</span></div>
          <div><strong>1</strong><span>{text("landing.timeline")}</span></div>
          <div><strong>24/7</strong><span>{text("landing.available")}</span></div>
          <div><strong>100%</strong><span>{text("landing.controlled")}</span></div>
        </section>

        <motion.section className="landing-final-cta university-final" {...inView}>
          <span>{text("landing.finalKicker")}</span><h2>{text("landing.finalTitle")}</h2><p>{text("landing.finalText")}</p><Link className="primary-cta" to="/login">{text("landing.enter")} <ArrowForwardRoundedIcon /></Link>
        </motion.section>
      </main>
      <footer className="landing-footer"><span className="brand-mark">CP</span><strong>CampusPulse</strong><small>{text("landing.footer")}</small></footer>
    </div>
  );
}

import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCampusTranslation } from "../i18n/campusTranslations";
import { motion, useReducedMotion } from "framer-motion";
import AnimatedDataMesh from "./AnimatedDataMesh";

export default function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  const { text } = useCampusTranslation();
  const reduceMotion = useReducedMotion();
  const float = (distance: number) => reduceMotion ? undefined : {
    y: [0, -distance, 0],
    x: [0, distance * .18, 0],
  };
  return (
    <div className="auth-page-shell">
      <section className="auth-panel">
        <div className="auth-panel-top">
          <Link className="auth-brand" to="/"><span className="brand-mark">CP</span><span><strong>CampusPulse</strong><small>{text("common.brandSubtitle")}</small></span></Link>
          <LanguageSwitcher />
        </div>
        <div className="auth-form-wrap">
          <span className="auth-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {children}
        </div>
        <footer>{text("authVisual.footer")}</footer>
      </section>

      <aside className="auth-visual">
        <img src="/campus-stream.png" alt={text("authVisual.alt")} />
        <AnimatedDataMesh />
        <div className="auth-visual-overlay">
          <span className="auth-visual-badge"><AutoAwesomeRoundedIcon /> {text("authVisual.badge")}</span>
          <h2>{text("authVisual.title1")}<br />{text("authVisual.title2")}</h2>
          <p>{text("authVisual.description")}</p>
          <div className="auth-mini-cards">
            <motion.article animate={float(8)} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }} whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}><CalendarMonthRoundedIcon /><div><small>{text("authVisual.deadline")}</small><strong>{text("authVisual.deadlineValue")}</strong></div></motion.article>
            <motion.article animate={float(10)} transition={{ duration: 6.4, delay: .8, repeat: Infinity, ease: "easeInOut" }} whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}><NotificationsActiveRoundedIcon /><div><small>{text("authVisual.match")}</small><strong>{text("authVisual.matchValue")}</strong></div></motion.article>
          </div>
        </div>
      </aside>
    </div>
  );
}

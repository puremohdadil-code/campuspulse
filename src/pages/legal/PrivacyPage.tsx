import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useCampusTranslation } from "../../i18n/campusTranslations";

export default function PrivacyPage() {
  const { text } = useCampusTranslation();
  return (
    <main className="legal-page">
      <header className="legal-topbar">
        <Link className="auth-brand" to="/"><span className="brand-mark">CP</span><span><strong>CampusPulse</strong><small>{text("common.brandSubtitle")}</small></span></Link>
        <div className="legal-actions"><LanguageSwitcher /><Link className="legal-back" to="/signup"><ArrowBackRoundedIcon /> {text("legal.back")}</Link></div>
      </header>

      <article className="legal-content">
        <span className="auth-eyebrow">{text("legal.privacyKicker")}</span>
        <h1>{text("legal.privacyTitle")}</h1>
        <p className="legal-updated">{text("legal.effective")}</p>
        <p>{text("legal.privacyIntro")}</p>

        {[1, 2, 3, 4, 5, 6].map((number) => <section key={number}><h2>{text(`legal.p${number}`)}</h2><p>{text(`legal.pp${number}`)}</p></section>)}

        <div className="legal-callout">{text("legal.privacyCallout")}</div>
      </article>
    </main>
  );
}

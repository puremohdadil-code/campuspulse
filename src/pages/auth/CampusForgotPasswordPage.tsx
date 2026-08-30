import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AuthShell from "../../components/AuthShell";
import { useCampusTranslation } from "../../i18n/campusTranslations";
import { apiErrorMessage, authApi } from "../../api/campuspulse";

export default function CampusForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { text } = useCampusTranslation();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await authApi.requestPasswordReset(email);
      setServerMessage(response.message);
      setSent(true);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, text("recovery.failed")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell eyebrow={text("recovery.eyebrow")} title={text("recovery.title")} description={text("recovery.description")}>
      {sent ? (
        <div className="recovery-success"><CheckCircleRoundedIcon /><h2>{text("recovery.success")}</h2><p>{serverMessage || text("recovery.prepared", { email })}</p><Link to="/login"><ArrowBackRoundedIcon /> {text("recovery.back")}</Link></div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label>{text("recovery.email")}<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={text("recovery.emailPlaceholder")} /></label>
          {error ? <div className="auth-error">{error}</div> : null}
          <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? text("recovery.loading") : text("recovery.continue")}</button>
          <Link className="back-to-login" to="/login"><ArrowBackRoundedIcon /> {text("recovery.back")}</Link>
        </form>
      )}
    </AuthShell>
  );
}

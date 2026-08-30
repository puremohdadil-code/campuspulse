import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AuthShell from "../../components/AuthShell";
import { apiErrorMessage, authApi } from "../../api/campuspulse";
import { useCampusTranslation } from "../../i18n/campusTranslations";

export default function CampusVerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { text } = useCampusTranslation();
  const initialEmail = (location.state as { email?: string } | null)?.email ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authApi.verifyEmail({ email, otp });
      navigate("/login", { replace: true, state: { email, message: text("verify.success") } });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, text("verify.failed")));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError("");
    setMessage("");
    try {
      const response = await authApi.resendVerification(email);
      setMessage(response.message);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, text("verify.resendFailed")));
    }
  };

  return (
    <AuthShell eyebrow={text("verify.eyebrow")} title={text("verify.title")} description={text("verify.description")}>
      <form className="auth-form" onSubmit={submit}>
        <label>{text("verify.email")}<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>{text("verify.code")}<input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="000000" /></label>
        {message ? <div className="auth-success">{message}</div> : null}
        {error ? <div className="auth-error">{error}</div> : null}
        <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? text("verify.loading") : text("verify.submit")}</button>
        <button className="auth-secondary-action" type="button" onClick={resend} disabled={!email}>{text("verify.resend")}</button>
        <Link className="back-to-login" to="/login"><ArrowBackRoundedIcon /> {text("recovery.back")}</Link>
      </form>
    </AuthShell>
  );
}

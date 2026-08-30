import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AuthShell from "../../components/AuthShell";
import { useAuth } from "../../auth/AuthContext";
import { useCampusTranslation } from "../../i18n/campusTranslations";
import { apiCode, apiErrorMessage, apiStatus } from "../../api/campuspulse";

export default function CampusLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const { text } = useCampusTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const statusMessage = (location.state as { message?: string } | null)?.message;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes("@") || password.length < 8) {
      setError(text("login.error"));
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(returnTo, { replace: true });
    } catch (requestError) {
      if (apiCode(requestError) === "EMAIL_NOT_VERIFIED" || apiStatus(requestError) === 403) {
        navigate("/verify-email", { state: { email } });
        return;
      }
      setError(apiErrorMessage(requestError, text("login.failed")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell eyebrow={text("login.eyebrow")} title={text("login.title")} description={text("login.description")}>
      <form className="auth-form" onSubmit={submit}>
        <label>{text("login.email")}<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={text("login.emailPlaceholder")} /></label>
        <label>{text("login.password")}<div className="password-field"><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? text("login.hide") : text("login.show")}>{showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</button></div></label>
        <div className="auth-form-row"><label className="remember-check"><input type="checkbox" defaultChecked />{text("login.keep")}</label><Link to="/forgot-password">{text("login.forgot")}</Link></div>
        {statusMessage ? <div className="auth-success">{statusMessage}</div> : null}
        {error ? <div className="auth-error">{error}</div> : null}
        <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? text("login.loading") : text("login.submit")} <ArrowForwardRoundedIcon /></button>
      </form>
      <p className="auth-switch">{text("login.newAccount")} <Link to="/signup">{text("login.create")}</Link></p>
      <small className="auth-demo-note">{text("login.secure")}</small>
    </AuthShell>
  );
}

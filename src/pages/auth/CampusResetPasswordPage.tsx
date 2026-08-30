import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AuthShell from "../../components/AuthShell";
import { apiErrorMessage, authApi } from "../../api/campuspulse";
import { useCampusTranslation } from "../../i18n/campusTranslations";

export default function CampusResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { text } = useCampusTranslation();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(token ? "" : text("reset.missingToken"));
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      setError(text("reset.mismatch"));
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const response = await authApi.resetPassword({ token, password });
      navigate("/login", { replace: true, state: { message: response.message } });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, text("reset.failed")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell eyebrow={text("reset.eyebrow")} title={text("reset.title")} description={text("reset.description")}>
      <form className="auth-form" onSubmit={submit}>
        <label>{text("reset.password")}<input required minLength={8} maxLength={72} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,72}" title="Use 8–72 characters with at least one letter and one number." type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <label>{text("reset.confirm")}<input required minLength={8} maxLength={72} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
        {error ? <div className="auth-error">{error}</div> : null}
        <button className="auth-submit" type="submit" disabled={submitting || !token}>{submitting ? text("reset.loading") : text("reset.submit")}</button>
        <Link className="back-to-login" to="/login"><ArrowBackRoundedIcon /> {text("recovery.back")}</Link>
      </form>
    </AuthShell>
  );
}

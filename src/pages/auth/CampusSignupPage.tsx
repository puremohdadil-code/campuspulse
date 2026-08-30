import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AuthShell from "../../components/AuthShell";
import { useCampusTranslation } from "../../i18n/campusTranslations";
import { apiErrorMessage, authApi } from "../../api/campuspulse";

export default function CampusSignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { text } = useCampusTranslation();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await authApi.signup({ firstName, lastName, addressLine: address, email, password });
      navigate(response.requiresVerification ? "/verify-email" : "/login", {
        replace: true,
        state: { email, message: response.message },
      });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, text("signup.failed")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell eyebrow={text("signup.eyebrow")} title={text("signup.title")} description={text("signup.description")}>
      <form className="auth-form signup-form" onSubmit={submit}>
        <div className="auth-two-column">
          <label>{text("signup.first")}<input required minLength={1} maxLength={50} autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder={text("signup.first")} /></label>
          <label>{text("signup.last")}<input required minLength={1} maxLength={50} autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder={text("signup.last")} /></label>
        </div>
        <label>{text("signup.email")}<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={text("signup.emailPlaceholder")} /></label>
        <div className="auth-two-column">
          <label>{text("signup.address")}<input required minLength={1} maxLength={255} autoComplete="address-line1" value={address} onChange={(event) => setAddress(event.target.value)} placeholder={text("signup.addressPlaceholder")} /></label>
          <label>{text("signup.password")}<input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={text("signup.passwordPlaceholder")} /></label>
        </div>
        <div className="academic-match"><SchoolRoundedIcon /><span><small>{text("roles.academicProfile")}</small><strong>{text("roles.studentAcademy")}</strong></span><b>{text("roles.autoAssigned")}</b></div>
        <label className="remember-check terms-check">
          <input required type="checkbox" />
          <span>{text("signup.agree")} <Link to="/terms">{text("signup.terms")}</Link> {text("signup.and")} <Link to="/privacy">{text("signup.privacy")}</Link>.</span>
        </label>
        {error ? <div className="auth-error">{error}</div> : null}
        <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? text("signup.loading") : text("signup.submit")} <ArrowForwardRoundedIcon /></button>
      </form>
      <p className="auth-switch">{text("signup.existing")} <Link to="/login">{text("signup.signIn")}</Link></p>
    </AuthShell>
  );
}

import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { languageOptions, useCampusTranslation } from "../i18n/campusTranslations";
import { useAuth } from "../auth/AuthContext";
import { settingsApi } from "../api/campuspulse";
import { useState } from "react";

export default function LanguageSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { lang, text, setLanguage } = useCampusTranslation();
  const { session } = useAuth();
  const [syncError, setSyncError] = useState(false);

  const changeLanguage = async (next: typeof lang) => {
    const previous = lang;
    setSyncError(false);
    setLanguage(next);
    if (session) {
      try { await settingsApi.update({ interfaceLanguage: next }); }
      catch { setLanguage(previous); setSyncError(true); }
    }
  };

  return (
    <label className={`language-switcher ${tone}`} title={syncError ? "The language could not be saved to your account." : undefined}>
      <LanguageRoundedIcon />
      <span className="visually-hidden">{text("common.language")}</span>
      <select aria-label={text("common.language")} aria-invalid={syncError} value={lang} onChange={(event) => changeLanguage(event.target.value as typeof lang)}>
        {languageOptions.map((option) => <option value={option.code} key={option.code}>{option.label}</option>)}
      </select>
    </label>
  );
}

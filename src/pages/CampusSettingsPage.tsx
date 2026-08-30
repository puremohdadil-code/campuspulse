import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { settingsApi, apiErrorMessage } from "../api/campuspulse";
import type { EditableSettings, UserSettings } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { ApiError, ApiLoading } from "../components/ApiState";
import { languageOptions, useCampusTranslation } from "../i18n/campusTranslations";
import { useThemeMode } from "../hooks/useThemeMode";

const editableKeys: Array<keyof EditableSettings> = [
  "interfaceLanguage", "timezone", "dailySummary", "deadlineNotifications",
  "courseNotifications", "eventNotifications", "scholarshipNotifications",
  "notificationFrequency", "preferredNotificationTime",
];

export default function CampusSettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { setLanguage, text } = useCampusTranslation();
  const [mode, toggleMode] = useThemeMode();
  const [draft, setDraft] = useState<EditableSettings>({});
  const [saved, setSaved] = useState("");
  const settings = useQuery({ queryKey: ["settings"], queryFn: settingsApi.get, retry: false });

  const changed = useMemo(() => {
    const payload: EditableSettings = {};
    if (!settings.data) return payload;
    for (const key of editableKeys) {
      if (draft[key] !== settings.data[key]) Object.assign(payload, { [key]: draft[key] });
    }
    return payload;
  }, [draft, settings.data]);

  const save = useMutation({
    mutationFn: (payload: EditableSettings) => settingsApi.update(payload),
    onSuccess: (next) => {
      queryClient.setQueryData<UserSettings>(["settings"], next);
      setLanguage(next.interfaceLanguage);
      setDraft({});
      setSaved(text("settings.saved"));
    },
    onError: (error) => setSaved(apiErrorMessage(error)),
  });

  const update = <K extends keyof EditableSettings>(key: K, value: EditableSettings[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSaved("");
    if (Object.keys(changed).length) save.mutate(changed);
  };
  const logout = async () => { await signOut(); navigate("/login", { replace: true }); };

  if (settings.isLoading) return <ApiLoading />;
  if (settings.isError) return <ApiError error={settings.error} onRetry={() => settings.refetch()} />;

  return (
    <div className="settings-page">
      <section className="page-heading"><div><span className="page-kicker">{text("settings.kicker")}</span><h1>{text("settings.title")}</h1><p>{text("settings.subtitle")}</p></div></section>
      <form className="settings-grid" onSubmit={submit}>
        <section className="surface-card settings-section">
          <h2>{text("settings.interface")}</h2>
          <label>{text("settings.language")}<select value={draft.interfaceLanguage ?? settings.data?.interfaceLanguage ?? "en"} onChange={(event) => update("interfaceLanguage", event.target.value as UserSettings["interfaceLanguage"])}>{languageOptions.map((option) => <option value={option.code} key={option.code}>{option.label}</option>)}</select></label>
          <label>{text("settings.timezone")}<input value={draft.timezone ?? settings.data?.timezone ?? ""} onChange={(event) => update("timezone", event.target.value)} placeholder="Asia/Kuala_Lumpur" /></label>
          <button type="button" className="outline-button" onClick={toggleMode}><DarkModeRoundedIcon /> {mode === "dark" ? text("settings.light") : text("settings.dark")}</button>
        </section>
        <section className="surface-card settings-section">
          <h2>{text("settings.delivery")}</h2>
          <label>{text("settings.frequency")}<select value={draft.notificationFrequency ?? settings.data?.notificationFrequency ?? "important"} onChange={(event) => update("notificationFrequency", event.target.value as UserSettings["notificationFrequency"])}><option value="all">{text("settings.all")}</option><option value="important">{text("settings.important")}</option><option value="critical">{text("settings.critical")}</option></select></label>
          <label>{text("settings.preferred")}<input type="time" value={draft.preferredNotificationTime ?? settings.data?.preferredNotificationTime ?? ""} onChange={(event) => update("preferredNotificationTime", event.target.value)} /></label>
          {(["dailySummary", "deadlineNotifications", "courseNotifications", "eventNotifications", "scholarshipNotifications"] as const).map((key) => <label className="settings-toggle" key={key}><input type="checkbox" checked={Boolean(draft[key] ?? settings.data?.[key])} onChange={(event) => update(key, event.target.checked)} /><span>{text(`settings.${key}`)}</span></label>)}
        </section>
        <section className="surface-card settings-section settings-academic">
          <h2>{text("settings.academic")}</h2><p>{text("settings.academicText")}</p>
          <button type="button" className="outline-button" onClick={() => navigate("/onboarding")}><EditRoundedIcon /> {text("settings.edit")}</button>
          <button type="button" className="logout-button" onClick={logout}><LogoutRoundedIcon /> Sign out</button>
        </section>
        {saved ? <div className="toast-banner"><strong>{saved}</strong><button type="button" onClick={() => setSaved("")}>Dismiss</button></div> : null}
        <button className="solid-button settings-save" type="submit" disabled={save.isPending || Object.keys(changed).length === 0}><SaveRoundedIcon /> {save.isPending ? text("settings.saving") : text("settings.save")}</button>
      </form>
    </div>
  );
}

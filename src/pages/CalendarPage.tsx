import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { useCampusTranslation } from "../i18n/campusTranslations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage, attendanceApi, calendarApi, contentApi, notificationsApi } from "../api/campuspulse";
import { addDays, colorOf, formatTime, isNoise, startOfDay } from "../api/content";
import PageLoading from "../components/PageLoading";
import type { CalendarEntry } from "../api/types";
import { ApiEmpty, ApiError } from "../components/ApiState";

const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** Monday of the week the given date falls in. */
function startOfWeek(date: Date) {
  const start = startOfDay(date);
  // getDay() is Sunday-based; the grid starts on Monday.
  const offset = (start.getDay() + 6) % 7;
  return addDays(start, -offset);
}

function startOfMonth(date: Date) {
  const start = startOfDay(date);
  start.setDate(1);
  return start;
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function CalendarPage() {
  const [view, setView] = useState<"Week" | "Month">("Week");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressDirty, setProgressDirty] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<"" | "present" | "absent">("");
  const [submitted, setSubmitted] = useState(false);
  const [markRead, setMarkRead] = useState(false);
  const [dismiss, setDismiss] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [explanation, setExplanation] = useState<{ text: string; factors: string[] } | null>(null);
  const [explanationError, setExplanationError] = useState("");
  const [explaining, setExplaining] = useState(false);
  const { lang, text } = useCampusTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // One window drives both the API query and the grid, so what is fetched
  // and what is drawn can never drift apart.
  const period = useMemo(() => {
    if (view === "Week") {
      const from = startOfWeek(anchor);
      return { from, to: addDays(from, 7), days: 7 };
    }
    const from = startOfMonth(anchor);
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
    return { from, to, days: Math.round((to.getTime() - from.getTime()) / 86_400_000) };
  }, [view, anchor]);

  const calendar = useQuery({
    queryKey: ["calendar", period.from.toISOString(), period.to.toISOString()],
    queryFn: () => calendarApi.get(period.from.toISOString(), period.to.toISOString()),
    retry: false,
  });

  // An item with both a start and a deadline arrives as two entries, so
  // grouping happens on the entry, not on the content it came from.
  const entriesByDay = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of calendar.data?.entries ?? []) {
      if (isNoise(entry.title)) continue;
      const key = dayKey(new Date(entry.date));
      const bucket = map.get(key);
      if (bucket) bucket.push(entry); else map.set(key, [entry]);
    }
    return map;
  }, [calendar.data]);

  const step = (direction: -1 | 1) => {
    setAnchor((current) => view === "Week"
      ? addDays(current, direction * 7)
      : new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  const rangeLabel = useMemo(() => {
    if (view === "Month") return new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(period.from);
    const format = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" });
    return format.formatRange(period.from, addDays(period.from, 6));
  }, [view, lang, period.from]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(period.from, index)), [period.from]);

  // A month starts on any weekday and runs 28–31 days, so the grid needs
  // whole weeks of leading blanks plus however many rows that adds up to.
  const monthCells = useMemo(() => {
    if (view !== "Month") return [];
    const lead = (period.from.getDay() + 6) % 7;
    const rows = Math.ceil((lead + period.days) / 7);
    return Array.from({ length: rows * 7 }, (_, index) => {
      const offset = index - lead;
      return offset >= 0 && offset < period.days ? addDays(period.from, offset) : null;
    });
  }, [view, period.from, period.days]);

  const today = dayKey(new Date());

  // The insight strip used to be fixed copy. It now shows whatever the AI
  // brief actually says, falling back to the static line until it arrives.
  const brief = useQuery({ queryKey: ["daily-brief"], queryFn: notificationsApi.dailyBrief, retry: false });
  const selectedContent = useQuery({
    queryKey: ["campus-content", selectedEntry?.contentId],
    queryFn: () => contentApi.byId(selectedEntry!.contentId),
    enabled: Boolean(selectedEntry),
    retry: false,
  });

  const openEntry = (entry: CalendarEntry) => {
    setSelectedEntry(entry);
    setProgress(0);
    setProgressDirty(false);
    setAttendanceStatus("");
    setSubmitted(false);
    setMarkRead(false);
    setDismiss(false);
    setDialogError("");
    setExplanation(null);
    setExplanationError("");
  };

  const closeDialog = () => setSelectedEntry(null);

  const explainSelection = async () => {
    const notificationId = selectedContent.data?.myState?.notificationId;
    if (!notificationId || explaining) return;
    setExplaining(true);
    setExplanationError("");
    try {
      const result = await notificationsApi.explain(notificationId);
      setExplanation({ text: result.explanation, factors: result.factors });
    } catch (requestError) {
      setExplanationError(apiErrorMessage(requestError));
    } finally {
      setExplaining(false);
    }
  };

  const saveEventActions = async () => {
    const item = selectedContent.data;
    if (!item || !selectedEntry || saving) return;
    setSaving(true);
    setDialogError("");
    try {
      // "Submitted" already writes 100, so a dragged value would only be
      // overwritten a moment later.
      if (progressDirty && !submitted) {
        if (item.myState?.notificationId) await notificationsApi.setProgress(item.myState.notificationId, progress);
        else await notificationsApi.trackContent(item._id, progress);
      }
      // A deadline is handed in, not attended: "submitted" is progress 100,
      // which the API also flips to completed and read.
      if (submitted && !item.myState?.completed) {
        if (item.myState?.notificationId) await notificationsApi.setProgress(item.myState.notificationId, 100);
        else await notificationsApi.trackContent(item._id, 100);
      }
      if (attendanceStatus && item.course) await attendanceApi.markToday(item.course, attendanceStatus);
      if (markRead && item.myState?.notificationId && !item.myState.read) await notificationsApi.markRead(item.myState.notificationId);
      if (dismiss && item.myState?.notificationId && !item.myState.dismissed) await notificationsApi.dismiss(item.myState.notificationId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["campus-content"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["attendance"] }),
        queryClient.invalidateQueries({ queryKey: ["calendar"] }),
      ]);
      closeDialog();
    } catch (requestError) {
      setDialogError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (calendar.isLoading) return <PageLoading />;
  if (calendar.isError) return <ApiError error={calendar.error} onRetry={() => calendar.refetch()} />;

  return (
    <div className="calendar-page">
      <section className="page-heading">
        <div><span className="page-kicker">{text("calendar.kicker")}</span><h1>{text("calendar.title")}</h1><p>{text("calendar.subtitle")}</p></div>
      </section>

      <section className="calendar-toolbar">
        <div className="calendar-title"><button onClick={() => step(-1)}><ChevronLeftRoundedIcon /></button><h2>{rangeLabel}</h2><button onClick={() => step(1)}><ChevronRightRoundedIcon /></button></div>
        <div className="segmented-control"><button className={view === "Week" ? "active" : ""} onClick={() => setView("Week")}>{text("calendar.week")}</button><button className={view === "Month" ? "active" : ""} onClick={() => setView("Month")}>{text("calendar.month")}</button></div>
      </section>

      {view === "Week" ? (
        <section className="week-calendar">
          {weekDays.map((date, index) => (
            <article className={dayKey(date) === today ? "active-day" : ""} key={date.toISOString()}>
              <header><span>{text(`calendar.${dayKeys[index]}`)}</span><strong>{date.getDate()}</strong></header>
              {(entriesByDay.get(dayKey(date)) ?? []).map((entry) => (
                <button className="calendar-event" style={{ borderColor: colorOf(entry.type) }} onClick={() => openEntry(entry)} key={`${entry.contentId}-${entry.kind}`}>
                  <small>{formatTime(new Date(entry.date), lang)}</small>
                  <strong>{entry.title}</strong>
                  <span><PlaceRoundedIcon /> {entry.location || "—"}</span>
                </button>
              ))}
            </article>
          ))}
        </section>
      ) : (
        <section className="month-calendar">
          {monthCells.map((date, index) => {
            const dayEntries = date ? (entriesByDay.get(dayKey(date)) ?? []) : [];
            return (
              <div className={date && dayKey(date) === today ? "month-active" : ""} key={index}>
                <span>{date ? date.getDate() : ""}</span>
                {dayEntries.slice(0, 2).map((entry) => <button className="month-entry" style={{ borderInlineStartColor: colorOf(entry.type) }} onClick={() => openEntry(entry)} key={`${entry.contentId}-${entry.kind}`}>{entry.title}</button>)}
                {dayEntries.length > 2 ? <i>{text("calendar.entryCount", { count: dayEntries.length })}</i> : null}
              </div>
            );
          })}
        </section>
      )}

      {[...entriesByDay.values()].flat().length === 0 ? <ApiEmpty title="No calendar entries" description="Deadlines and events returned by the calendar API will appear here." /> : null}

      <section className="calendar-insight">
        <div className="pulse-orb"><AutoAwesomeRoundedIcon /></div>
        <div><span>{text("calendar.insight")}</span><h3>{brief.isError ? "Daily brief unavailable" : brief.data?.items?.[0]?.title || "No insight for this period"}</h3><p>{brief.isError ? "The server did not return a daily brief." : brief.data?.summary || "No AI calendar insight has been generated yet."}</p></div>
        <button onClick={() => navigate("/dashboard/notifications")}>{text("calendar.resolve")}</button>
      </section>

      {selectedEntry ? (
        <div className="calendar-action-modal" role="dialog" aria-modal="true" aria-label={selectedEntry.title}>
          <button className="explanation-scrim" onClick={closeDialog} aria-label={text("nav.close")} />
          <section className="surface-card calendar-action-panel">
            <button className="modal-close" onClick={closeDialog} aria-label={text("nav.close")}><CloseRoundedIcon /></button>
            <span className="page-kicker">{text("calendarAction.kicker")}</span>
            <h2>{selectedEntry.title}</h2>
            <p>{formatTime(new Date(selectedEntry.date), lang)} · {selectedEntry.location || "—"}</p>
            {selectedContent.isLoading ? <PageLoading /> : null}
            {selectedContent.isError ? <ApiError error={selectedContent.error} onRetry={() => selectedContent.refetch()} /> : null}
            {selectedContent.data ? (
              <div className="calendar-action-form">
                <div className="calendar-item-meta"><span>{selectedContent.data.type}</span><span>{selectedContent.data.source || "—"}</span></div>
                <label>{text("messages.progress")} <strong>{progressDirty ? progress : selectedContent.data.myState?.progress ?? 0}%</strong><input type="range" min={0} max={100} step={5} value={progressDirty ? progress : selectedContent.data.myState?.progress ?? 0} onChange={(event) => { setProgress(Number(event.target.value)); setProgressDirty(true); }} /></label>
                {selectedContent.data.type === "deadline" ? (
                  <fieldset className="attendance-choice-fieldset"><legend>{text("calendarAction.submission")}</legend><div className="attendance-choice-grid">
                    <label className={submitted || selectedContent.data.myState?.completed ? "selected attended" : "attended"}>
                      <input type="radio" name="submission" checked={submitted || !!selectedContent.data.myState?.completed} disabled={!!selectedContent.data.myState?.completed} onChange={() => setSubmitted(true)} />
                      <span className="attendance-choice-dot" /><strong>{selectedContent.data.myState?.completed ? text("calendarAction.alreadySubmitted") : text("calendarAction.markSubmitted")}</strong>
                    </label>
                    <label className={!submitted && !selectedContent.data.myState?.completed ? "selected missed" : "missed"}>
                      <input type="radio" name="submission" checked={!submitted && !selectedContent.data.myState?.completed} disabled={!!selectedContent.data.myState?.completed} onChange={() => setSubmitted(false)} />
                      <span className="attendance-choice-dot" /><strong>{text("calendarAction.notSubmitted")}</strong>
                    </label>
                  </div></fieldset>
                ) : selectedContent.data.type === "event" && selectedContent.data.course ? (
                  <fieldset className="attendance-choice-fieldset"><legend>{text("calendarAction.attendance")}</legend><div className="attendance-choice-grid">
                    <label className={attendanceStatus === "present" ? "selected attended" : "attended"}><input type="radio" name="attendance" checked={attendanceStatus === "present"} onChange={() => setAttendanceStatus("present")} /><span className="attendance-choice-dot" /><strong>{text("attendance.attended")}</strong></label>
                    <label className={attendanceStatus === "absent" ? "selected missed" : "missed"}><input type="radio" name="attendance" checked={attendanceStatus === "absent"} onChange={() => setAttendanceStatus("absent")} /><span className="attendance-choice-dot" /><strong>{text("attendance.missed")}</strong></label>
                  </div></fieldset>
                ) : null}
                {selectedContent.data.myState?.notificationId ? <fieldset><legend>{text("calendarAction.notification")}</legend><label><input type="checkbox" checked={markRead} onChange={(event) => setMarkRead(event.target.checked)} disabled={selectedContent.data.myState.read} /> {selectedContent.data.myState.read ? text("calendarAction.alreadyRead") : text("calendarAction.markRead")}</label><label><input type="checkbox" checked={dismiss} onChange={(event) => setDismiss(event.target.checked)} disabled={selectedContent.data.myState.dismissed} /> {selectedContent.data.myState.dismissed ? text("calendarAction.archived") : text("calendarAction.archive")}</label></fieldset> : null}
                {selectedContent.data.myState?.notificationId ? <div className="calendar-explanation"><button className="outline-button" onClick={explainSelection} disabled={explaining}><HelpOutlineRoundedIcon /> {explaining ? text("why.loading") : text("why.action")}</button>{explanationError ? <div className="auth-error"><span>{explanationError}</span><button onClick={explainSelection}>{text("system.retry")}</button></div> : null}{explanation ? <div className="calendar-explanation-copy"><strong>{explanation.text}</strong>{explanation.factors.length ? <ul>{explanation.factors.map((factor) => <li key={factor}>{factor}</li>)}</ul> : null}</div> : null}</div> : null}
                {dialogError ? <div className="auth-error">{dialogError}</div> : null}
                <button className="solid-button calendar-save" onClick={saveEventActions} disabled={saving}><SaveRoundedIcon /> {saving ? text("calendarAction.saving") : text("calendarAction.save")}</button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}

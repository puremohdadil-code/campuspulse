import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import GradeRoundedIcon from "@mui/icons-material/GradeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AssignmentLateRoundedIcon from "@mui/icons-material/AssignmentLateRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import { useCampusTranslation } from "../i18n/campusTranslations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicApi, attendanceApi, calendarApi, contentApi, notificationsApi } from "../api/campuspulse";
import { addDays, categoryOf, colorOf, contentDate, formatDay, isUrgent, splitTime, startOfDay } from "../api/content";
import PageLoading from "../components/PageLoading";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import { ApiEmpty, ApiError } from "../components/ApiState";
import { useAuth } from "../auth/AuthContext";

// Same four steps the notification rows use, so a "high" task and a "high"
// notification read as the same weight across the dashboard.
const PRIORITY_COLORS: Record<string, string> = {
  critical: "#e55449",
  high: "#ef8c31",
  medium: "#e4b52f",
  low: "#39bda0",
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { lang, text } = useCampusTranslation();
  const queryClient = useQueryClient();

  // The agenda only ever shows the next few entries, so this asks for a
  // week instead of the API default window of 30 days.
  const range = useMemo(() => {
    const from = startOfDay(new Date());
    return { from: from.toISOString(), to: addDays(from, 7).toISOString() };
  }, []);

  const dailyBrief = useQuery({ queryKey: ["daily-brief"], queryFn: notificationsApi.dailyBrief, retry: false });
  const calendar = useQuery({ queryKey: ["calendar", range.from, range.to], queryFn: () => calendarApi.get(range.from, range.to), retry: false });
  const content = useQuery({ queryKey: ["campus-content", "upcoming"], queryFn: () => contentApi.list({ upcoming: true }), retry: false });
  const academic = useQuery({ queryKey: ["academic-profile"], queryFn: academicApi.get, retry: false });
  const messages = useQuery({ queryKey: ["notifications", "messages"], queryFn: notificationsApi.messages, retry: false });
  const attendance = useQuery({ queryKey: ["attendance", "summary"], queryFn: attendanceApi.summary, retry: false });

  const agenda = useMemo(() => (calendar.data?.entries ?? []).slice(0, 3).map((entry) => {
    const date = new Date(entry.date);
    const [clock, suffix] = splitTime(date, lang);
    return {
      key: `${entry.contentId}-${entry.kind}`,
      clock,
      suffix,
      title: entry.title,
      location: entry.location || "—",
      category: categoryOf(entry.type),
      color: colorOf(entry.type),
      urgent: entry.kind === "deadline" && isUrgent(date),
    };
  }), [calendar.data, lang]);

  const upcoming = useMemo(() => content.data ?? [], [content.data]);
  const deadlineCount = upcoming.filter((item) => item.type === "deadline").length;
  const eventCount = upcoming.filter((item) => item.type === "event").length;
  const level = academic.data?.yearOfStudy ? `Year ${academic.data.yearOfStudy}` : "—";

  // Same weighting as the attendance page: sessions attended over sessions
  // held, so both screens can never disagree on the headline number.
  const overallAttendance = useMemo(() => {
    const courses = attendance.data?.courses ?? [];
    const totals = courses.reduce(
      (running, course) => ({
        attended: running.attended + course.present + course.late + course.excused,
        total: running.total + course.total,
      }),
      { attended: 0, total: 0 },
    );
    return totals.total ? Number(((totals.attended / totals.total) * 100).toFixed(2)) : null;
  }, [attendance.data]);

  const opportunities = useMemo(() => upcoming.slice(0, 3).map((item) => {
    const date = contentDate(item);
    return {
      id: item._id,
      title: item.title,
      description: item.description || "",
      category: categoryOf(item.type),
      color: colorOf(item.type),
      date: formatDay(date, lang),
      location: item.location || "—",
      source: item.source || "—",
      tracked: item.myState !== null,
    };
  }), [upcoming, lang]);

  // The plan calls the AI, so it runs on demand rather than on page load.
  const studyPlan = useMutation({ mutationFn: () => notificationsApi.studyPlan() });

  const track = useMutation({
    mutationFn: (contentId: string) => notificationsApi.trackContent(contentId, 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campus-content"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // The agenda and the opportunity rail are the page; waiting on the AI
  // brief or the attendance rollup would hold it back for no reason.
  if (calendar.isLoading || content.isLoading || messages.isLoading) return <PageLoading />;
  if (calendar.isError) return <ApiError error={calendar.error} onRetry={() => calendar.refetch()} />;
  if (content.isError) return <ApiError error={content.error} onRetry={() => content.refetch()} />;
  if (messages.isError) return <ApiError error={messages.error} onRetry={() => messages.refetch()} />;

  return (
    <div className="dashboard-page">
      <section className="page-heading">
        <div>
          <span className="page-kicker">{text("dashboard.kicker")}</span>
          <h1>{text(new Date().getHours() < 12 ? "live.morning" : new Date().getHours() < 18 ? "live.afternoon" : "live.evening")}, {session?.name}.</h1>
          <p>{text("dashboard.subtitle")}</p>
        </div>
        <button className="outline-button" onClick={() => navigate("/dashboard/calendar")}><CalendarMonthRoundedIcon /> {text("dashboard.viewCalendar")}</button>
      </section>

      <section className="daily-pulse-card">
        <div className="pulse-orb"><AutoAwesomeRoundedIcon /></div>
        <div className="daily-pulse-copy">
          <span>{text("dashboard.daily")}</span>
          <h2>{dailyBrief.isError ? "Daily brief unavailable" : dailyBrief.data?.items?.[0]?.title || "No priority item for today"}</h2>
          <p>{dailyBrief.isError ? "The server could not generate your daily brief. Try again from Notifications." : dailyBrief.data?.summary || "Your personalized feed has no daily brief yet."}</p>
        </div>
        <button onClick={() => navigate("/dashboard/calendar")}>{text("dashboard.review")} <ArrowForwardRoundedIcon /></button>
      </section>

      <section className="metric-grid">
        <article><span className="metric-icon academic"><SchoolRoundedIcon /></span><div><small>{text("dashboard.deadlines")}</small><strong>{deadlineCount}</strong><p>{text("dashboard.deadlinesNote")}</p></div></article>
        <article><span className="metric-icon events"><EventRoundedIcon /></span><div><small>{text("dashboard.events")}</small><strong>{eventCount}</strong><p>{text("dashboard.eventsNote")}</p></div></article>
        <article><span className="metric-icon saved"><BookmarkRoundedIcon /></span><div><small>Unread feed items</small><strong>{messages.data?.unreadCount ?? 0}</strong><p>From your personalized database feed</p></div></article>
      </section>

      <section className="dashboard-grid">
        <article className="surface-card today-card">
          <header className="card-header"><div><span>{text("dashboard.today")}</span><h2>{text("dashboard.agenda")}</h2></div><button onClick={() => navigate("/dashboard/calendar")}>{text("dashboard.fullCalendar")}</button></header>
          <div className="timeline-list">
            {agenda.map((item) => (
              <div className={`timeline-item ${item.urgent ? "urgent" : ""}`} key={item.key}>
                <div className="timeline-time"><strong>{item.clock}</strong><small>{item.suffix}</small></div>
                <i style={{ background: item.color }} />
                <div className="timeline-copy"><strong>{item.title}</strong><span><PlaceRoundedIcon /> {item.location}</span></div>
                <span className="category-pill">{text(`discover.${item.category.toLowerCase()}`)}</span>
              </div>
            ))}
          </div>
          {!agenda.length ? <ApiEmpty title="Nothing scheduled in this range" description="Calendar entries supplied by the server will appear here." /> : null}
          <button className="text-button" onClick={() => navigate("/dashboard/calendar")}>{text("dashboard.rest")} <ArrowForwardRoundedIcon /></button>
        </article>

        <article className="surface-card student-status-card">
          <header className="card-header"><div><span>{text("status.kicker")}</span><h2>{text("status.title")}</h2></div></header>
          <div className="student-status-grid">
            <button onClick={() => navigate("/dashboard/attendance")}><span className="status-icon attendance"><SchoolRoundedIcon /></span><small>{text("status.attendance")}</small><strong>{overallAttendance === null || attendance.isError ? "—" : `${overallAttendance}%`}</strong></button>
            <div><span className="status-icon grades"><GradeRoundedIcon /></span><small>{text("status.grades")}</small><strong>—</strong></div>
            <div><span className="status-icon level"><TrendingUpRoundedIcon /></span><small>{text("status.level")}</small><strong>{level}</strong></div>
            <div><span className="status-icon deadlines"><AssignmentLateRoundedIcon /></span><small>{text("status.deadlines")}</small><strong>{deadlineCount}</strong></div>
          </div>
          <button className="attendance-risk-link" onClick={() => navigate("/dashboard/attendance")}><span />{attendance.isError ? text("live.attendanceUnavailable") : (attendance.data?.courses ?? []).some((course) => course.attendanceRate < 70) ? text("status.risk") : text("live.safeAttendance")}<ArrowForwardRoundedIcon /></button>
        </article>
      </section>

      <section className="surface-card study-plan-card">
        <header className="card-header"><div><span>{text("live.feed")}</span><h2>{text("live.inbox")}</h2></div><button onClick={() => navigate("/dashboard/messages")}>{text("live.openInbox")}</button></header>
        <div className="notification-list dashboard-feed-preview">
          {(messages.data?.messages ?? []).slice(0, 4).map((message) => <button className={`notification-row ${message.unread ? "unread" : ""}`} key={message.id} onClick={() => navigate("/dashboard/messages")}><span className="notification-copy"><strong>{message.subject}</strong><p>{message.preview}</p><small>{message.source}{message.courseCode ? ` · ${message.courseCode}` : ""} · {message.priority}</small></span>{message.unread ? <i /> : null}</button>)}
        </div>
        {!messages.data?.messages.length ? <ApiEmpty title={text("live.feedEmpty")} description={text("live.feedEmptyText")} /> : null}
      </section>

      <section className="surface-card study-plan-card">
        <header className="card-header">
          <div><span>{text("studyPlan.kicker")}</span><h2>{text("studyPlan.title")}</h2></div>
          <button onClick={() => studyPlan.mutate()} disabled={studyPlan.isPending}>{studyPlan.isPending ? text("studyPlan.loading") : text("studyPlan.generate")}</button>
        </header>
        <p className="study-plan-intro"><AutoStoriesRoundedIcon /> {text("studyPlan.text")}</p>
        {studyPlan.isError ? <div className="auth-error">{text("studyPlan.failed")}</div> : null}
        {studyPlan.data ? (
          studyPlan.data.plan.length === 0
            ? <p className="study-plan-intro">{text("studyPlan.empty")}</p>
            : studyPlan.data.plan.map((day) => (
              <div className="study-plan-day" key={day.date}>
                <small>{new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "short" }).format(new Date(day.date))}</small>
                <div className="timeline-list">
                  {day.tasks.map((task, index) => (
                    <div className="timeline-item" key={`${day.date}-${index}`}>
                      <div className="timeline-time"><strong>{task.durationMinutes}</strong><small>{text("studyPlan.minutes", { count: task.durationMinutes }).replace(String(task.durationMinutes), "").trim()}</small></div>
                      <i style={{ background: PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.low }} />
                      <div className="timeline-copy"><strong>{task.title}</strong><span>{task.course}</span></div>
                      <span className="category-pill">{task.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
        ) : null}
      </section>

      <section className="section-heading-row">
        <div><span>{text("dashboard.personal")}</span><h2>{text("dashboard.attention")}</h2></div>
        <button className="text-button" onClick={() => navigate("/dashboard/discover")}>{text("dashboard.explore")} <ArrowForwardRoundedIcon /></button>
      </section>

      <section className="opportunity-grid">
        {opportunities.map((item) => (
          <article className="opportunity-card" key={item.id}>
            <div className="opportunity-top"><span className="category-pill" style={{ color: item.color }}>{text(`discover.${item.category.toLowerCase()}`)}</span><button onClick={() => !item.tracked && track.mutate(item.id)} disabled={item.tracked || track.isPending} aria-label={`${item.tracked ? "Tracked" : text("dashboard.save")} ${item.title}`}><BookmarkRoundedIcon /></button></div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="opportunity-meta"><span><CalendarMonthRoundedIcon /> {item.date}</span><span><PlaceRoundedIcon /> {item.location}</span></div>
            <footer><small>{text("dashboard.source")} {item.source}</small><button onClick={() => navigate("/dashboard/discover")}>{text("dashboard.details")}</button></footer>
          </article>
        ))}
      </section>
      {!opportunities.length ? <ApiEmpty title="No campus updates yet" description="Only records returned by the campus-content API are shown here." /> : null}
    </div>
  );
}

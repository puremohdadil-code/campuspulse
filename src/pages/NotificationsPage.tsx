import { useMemo, useState } from "react";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import { useCampusTranslation } from "../i18n/campusTranslations";
import { useQuery } from "@tanstack/react-query";
import { apiErrorMessage, notificationsApi } from "../api/campuspulse";
import { categoryOf, relativeTime, severityOf } from "../api/content";
import PageLoading from "../components/PageLoading";
import { ApiError } from "../components/ApiState";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const [emailing, setEmailing] = useState(false);
  const [emailResult, setEmailResult] = useState("");
  const { lang, text } = useCampusTranslation();
  const remote = useQuery({ queryKey: ["notifications"], queryFn: () => notificationsApi.list(), retry: false });

  // The server already sorts by priority then relevance, so the order it
  // returns is the order the list renders in.
  const items = useMemo(() => (remote.data ?? []).map((item) => ({
    id: item._id,
    title: item.content.title,
    body: item.reason || item.content.description || item.content.title,
    time: relativeTime(item.createdAt, lang),
    type: categoryOf(item.content.type),
    severity: severityOf(item.priority),
    read: item.read,
  })), [remote.data, lang]);

  const visible = useMemo(() => filter === "Unread" ? items.filter((item) => !item.read) : items, [filter, items]);
  const unreadCount = items.filter((item) => !item.read).length;

  // Sends to the account address only — the endpoint takes no body and
  // builds the mail from what is already stored, so there is nothing to
  // confirm beyond the click itself.
  const emailBrief = async () => {
    if (emailing) return;
    setEmailing(true);
    setEmailResult("");
    try {
      const result = await notificationsApi.emailBrief();
      setEmailResult(result.items
        ? text("notifications.emailSent", { email: result.to, count: result.items })
        : text("notifications.emailEmpty", { email: result.to }));
    } catch (requestError) {
      setEmailResult(apiErrorMessage(requestError, text("notifications.emailFailed")));
    } finally {
      setEmailing(false);
    }
  };

  const iconFor = (type: string) => type === "Attendance" ? <FactCheckRoundedIcon /> : type === "Agent" ? <AutoAwesomeRoundedIcon /> : type === "Academic" ? <SchoolRoundedIcon /> : type === "Event" ? <EventRoundedIcon /> : <NotificationsNoneRoundedIcon />;

  if (remote.isLoading) return <PageLoading />;
  if (remote.isError) return <ApiError error={remote.error} onRetry={() => remote.refetch()} />;

  return (
    <div className="notifications-page">
      <section className="page-heading">
        <div><span className="page-kicker">{text("notifications.kicker")}</span><h1>{text("notifications.title")}</h1><p>{text("notifications.subtitle")}</p></div>
        <button className="outline-button" onClick={emailBrief} disabled={emailing}><MailOutlineRoundedIcon /> {emailing ? text("notifications.emailSending") : text("notifications.emailBrief")}</button>
      </section>

      {emailResult ? <div className="toast-banner"><strong>{emailResult}</strong><button onClick={() => setEmailResult("")}>{text("common.dismiss")}</button></div> : null}

      <section className="notification-toolbar">
        <div className="segmented-control"><button className={filter === "All" ? "active" : ""} onClick={() => setFilter("All")}>{text("notifications.all")}</button><button className={filter === "Unread" ? "active" : ""} onClick={() => setFilter("Unread")}>{text("notifications.unread")}</button></div>
        <span>{text("notifications.count", { count: unreadCount })}</span>
      </section>

      <section className="notification-list clean-feed-list">
        {visible.map((item) => (
          <article className={`notification-row ${item.read ? "" : "unread"} severity-${item.severity}`} key={item.id}>
            <span className="notification-icon">{iconFor(item.type)}</span>
            <span className="notification-copy"><strong>{item.title}</strong><p>{item.body}</p><small>{text(`discover.${item.type.toLowerCase()}`)}</small></span>
            <time>{item.time}</time>
            {!item.read ? <i /> : null}
          </article>
        ))}
        {visible.length === 0 ? <div className="empty-state"><DoneAllRoundedIcon /><h2>{text("notifications.empty")}</h2><p>{text("notifications.emptyText")}</p></div> : null}
      </section>
    </div>
  );
}

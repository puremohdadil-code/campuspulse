import { useMemo, useState } from "react";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { useQuery } from "@tanstack/react-query";
import { useCampusTranslation } from "../i18n/campusTranslations";
import { notificationsApi } from "../api/campuspulse";
import { isNoise, relativeTime } from "../api/content";
import PageLoading from "../components/PageLoading";
import { ApiError } from "../components/ApiState";

function channelIcon(source: string) {
  if (source === "Microsoft Teams") return <GroupsRoundedIcon />;
  if (source === "Email" || source === "Outlook") return <EmailRoundedIcon />;
  if (source === "Blackboard" || source === "Moodle") return <MenuBookRoundedIcon />;
  if (source === "Student Portal") return <LanguageRoundedIcon />;
  return <CampaignRoundedIcon />;
}

const priorityColors = { critical: "#dc2626", high: "#ea580c", medium: "#2563eb", low: "#64748b" } as const;

export default function MessagesPage() {
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const { lang, text } = useCampusTranslation();
  const inbox = useQuery({ queryKey: ["notifications", "messages"], queryFn: notificationsApi.messages, retry: false });
  const messages = useMemo(() => (inbox.data?.messages ?? []).filter((item) => !isNoise(item.subject)), [inbox.data]);
  const visible = useMemo(() => filter === "Unread" ? messages.filter((item) => item.unread) : messages, [filter, messages]);

  if (inbox.isLoading) return <PageLoading />;
  if (inbox.isError) return <ApiError error={inbox.error} onRetry={() => inbox.refetch()} />;

  return (
    <div className="notifications-page">
      <section className="page-heading"><div><span className="page-kicker">{text("messages.kicker")}</span><h1>{text("messages.title")}</h1><p>{text("messages.subtitle")}</p></div></section>
      <section className="notification-toolbar"><div className="segmented-control"><button className={filter === "All" ? "active" : ""} onClick={() => setFilter("All")}>{text("messages.all")}</button><button className={filter === "Unread" ? "active" : ""} onClick={() => setFilter("Unread")}>{text("messages.unread")}</button></div><span>{text("messages.count", { count: inbox.data?.unreadCount ?? 0 })}</span></section>
      <section className="notification-list clean-feed-list">
        {visible.map((message) => (
          <article className={`notification-row message-row ${message.unread ? "unread" : ""}`} key={message.id}>
            <span className="notification-icon">{channelIcon(message.source)}</span>
            <span className="notification-copy"><strong>{message.subject}</strong><p>{message.preview}</p><span className="message-chips"><small className="channel-chip">{channelIcon(message.source)} {message.source}</small><small className="priority-chip" style={{ color: priorityColors[message.priority], borderColor: priorityColors[message.priority] }}>{message.priority}</small>{message.courseCode ? <small className="course-chip">{message.courseCode}</small> : null}{message.unread ? <i className="unread-dot" /> : null}{message.trackable ? <small>{message.completed ? text("messages.done") : `${text("messages.progress")} ${message.progress}%`}</small> : null}</span></span>
            <time>{relativeTime(message.receivedAt, lang)}</time>
          </article>
        ))}
        {!visible.length ? <div className="empty-state"><DoneAllRoundedIcon /><h2>{text("messages.empty")}</h2><p>{text("messages.emptyText")}</p></div> : null}
      </section>
    </div>
  );
}

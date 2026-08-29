import { useMemo, useState } from "react";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { initialNotifications } from "../data/campusData";

export default function NotificationsPage() {
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const visible = useMemo(() => filter === "Unread" ? items.filter((item) => !item.read) : items, [filter, items]);

  const iconFor = (type: string) => type === "Agent" ? <AutoAwesomeRoundedIcon /> : type === "Academic" ? <SchoolRoundedIcon /> : type === "Event" ? <EventRoundedIcon /> : <NotificationsNoneRoundedIcon />;

  return (
    <div className="notifications-page">
      <section className="page-heading">
        <div><span className="page-kicker">STAY AHEAD, NOT OVERWHELMED</span><h1>Notifications</h1><p>Only changes that deserve your attention.</p></div>
        <button className="outline-button" onClick={() => setItems((current) => current.map((item) => ({ ...item, read: true })))}><DoneAllRoundedIcon /> Mark all as read</button>
      </section>

      <section className="notification-toolbar">
        <div className="segmented-control"><button className={filter === "All" ? "active" : ""} onClick={() => setFilter("All")}>All</button><button className={filter === "Unread" ? "active" : ""} onClick={() => setFilter("Unread")}>Unread</button></div>
        <span>{items.filter((item) => !item.read).length} unread</span>
      </section>

      <section className="notification-list">
        {visible.map((item) => (
          <button className={`notification-row ${item.read ? "" : "unread"}`} onClick={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry))} key={item.id}>
            <span className="notification-icon">{iconFor(item.type)}</span>
            <span className="notification-copy"><strong>{item.title}</strong><p>{item.body}</p><small>{item.type}</small></span>
            <time>{item.time}</time>
            {!item.read ? <i /> : null}
          </button>
        ))}
        {visible.length === 0 ? <div className="empty-state"><DoneAllRoundedIcon /><h2>You are all caught up</h2><p>New campus updates will appear here.</p></div> : null}
      </section>
    </div>
  );
}

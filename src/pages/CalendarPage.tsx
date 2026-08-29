import { useState } from "react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import { agenda } from "../data/campusData";

const week = [
  { day: "Mon", date: 24 }, { day: "Tue", date: 25 }, { day: "Wed", date: 26 },
  { day: "Thu", date: 27 }, { day: "Fri", date: 28 }, { day: "Sat", date: 29 }, { day: "Sun", date: 30 },
];

export default function CalendarPage() {
  const [view, setView] = useState<"Week" | "Month">("Week");
  const [showAdded, setShowAdded] = useState(false);

  return (
    <div className="calendar-page">
      <section className="page-heading">
        <div><span className="page-kicker">YOUR TIME, IN ONE PLACE</span><h1>Calendar</h1><p>Academic deadlines and campus life, without the collisions.</p></div>
        <button className="solid-button" onClick={() => setShowAdded(true)}><AddRoundedIcon /> Add personal item</button>
      </section>

      {showAdded ? <div className="toast-banner"><strong>Personal item ready.</strong><span>This frontend demo keeps it for the current session.</span><button onClick={() => setShowAdded(false)}>Dismiss</button></div> : null}

      <section className="calendar-toolbar">
        <div className="calendar-title"><button><ChevronLeftRoundedIcon /></button><h2>24–30 August 2026</h2><button><ChevronRightRoundedIcon /></button></div>
        <div className="segmented-control"><button className={view === "Week" ? "active" : ""} onClick={() => setView("Week")}>Week</button><button className={view === "Month" ? "active" : ""} onClick={() => setView("Month")}>Month</button></div>
      </section>

      {view === "Week" ? (
        <section className="week-calendar">
          {week.map((item) => (
            <article className={item.date === 29 ? "active-day" : ""} key={item.date}>
              <header><span>{item.day}</span><strong>{item.date}</strong></header>
              {item.date === 29 ? agenda.slice(0, 3).map((event) => <div className="calendar-event" style={{ borderColor: event.color }} key={event.id}><small>{event.time}</small><strong>{event.title}</strong><span><PlaceRoundedIcon /> {event.location}</span></div>) : null}
              {item.date === 30 ? agenda.slice(3, 4).map((event) => <div className="calendar-event" style={{ borderColor: event.color }} key={event.id}><small>{event.time}</small><strong>{event.title}</strong><span><PlaceRoundedIcon /> {event.location}</span></div>) : null}
            </article>
          ))}
        </section>
      ) : (
        <section className="month-calendar">
          {Array.from({ length: 35 }, (_, index) => {
            const day = index - 1;
            return <div className={day === 29 ? "month-active" : ""} key={index}><span>{day > 0 && day <= 31 ? day : ""}</span>{day === 29 ? <i>3 items</i> : day === 30 ? <i>1 event</i> : null}</div>;
          })}
        </section>
      )}

      <section className="calendar-insight">
        <div className="pulse-orb"><AutoAwesomeRoundedIcon /></div>
        <div><span>PULSE AI INSIGHT</span><h3>Your busiest window is Friday, 12–3 PM.</h3><p>I can move your flexible project check-in so you have a 45-minute focus buffer before the workshop.</p></div>
        <button onClick={() => setShowAdded(true)}>Resolve conflict</button>
      </section>
    </div>
  );
}

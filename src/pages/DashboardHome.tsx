import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import { agenda, opportunities } from "../data/campusData";

export default function DashboardHome() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<number[]>([11]);

  const toggleSaved = (id: number) => {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <div className="dashboard-page">
      <section className="page-heading">
        <div>
          <span className="page-kicker">FRIDAY · 29 AUGUST 2026</span>
          <h1>Good morning, Aina.</h1>
          <p>Here is the clearest path through your campus day.</p>
        </div>
        <button className="outline-button" onClick={() => navigate("/dashboard/calendar")}><CalendarMonthRoundedIcon /> View calendar</button>
      </section>

      <section className="daily-pulse-card">
        <div className="pulse-orb"><AutoAwesomeRoundedIcon /></div>
        <div className="daily-pulse-copy">
          <span>PULSE AI · DAILY BRIEF</span>
          <h2>Three things need your attention today.</h2>
          <p>Your AI Ethics assignment is due at noon. I also found one schedule conflict and a scholarship that closes in three days.</p>
        </div>
        <button onClick={() => navigate("/dashboard/agent")}>Review with Pulse <ArrowForwardRoundedIcon /></button>
      </section>

      <section className="metric-grid">
        <article><span className="metric-icon academic"><SchoolRoundedIcon /></span><div><small>Upcoming deadlines</small><strong>4</strong><p>2 due this week</p></div></article>
        <article><span className="metric-icon events"><EventRoundedIcon /></span><div><small>Events for you</small><strong>8</strong><p>3 newly matched</p></div></article>
        <article><span className="metric-icon saved"><BookmarkRoundedIcon /></span><div><small>Saved opportunities</small><strong>{saved.length + 2}</strong><p>1 closing soon</p></div></article>
      </section>

      <section className="dashboard-grid">
        <article className="surface-card today-card">
          <header className="card-header"><div><span>TODAY</span><h2>Your agenda</h2></div><button onClick={() => navigate("/dashboard/calendar")}>Full calendar</button></header>
          <div className="timeline-list">
            {agenda.slice(0, 3).map((item) => (
              <div className={`timeline-item ${item.urgent ? "urgent" : ""}`} key={item.id}>
                <div className="timeline-time"><strong>{item.time.split(" ")[0]}</strong><small>{item.time.split(" ")[1]}</small></div>
                <i style={{ background: item.color }} />
                <div className="timeline-copy"><strong>{item.title}</strong><span><PlaceRoundedIcon /> {item.location}</span></div>
                <span className="category-pill">{item.category}</span>
              </div>
            ))}
          </div>
          <button className="text-button" onClick={() => navigate("/dashboard/calendar")}>See the rest of your day <ArrowForwardRoundedIcon /></button>
        </article>

        <article className="surface-card focus-card">
          <header className="card-header"><div><span>NEXT UP</span><h2>Focus window</h2></div><AccessTimeRoundedIcon /></header>
          <div className="focus-clock"><strong>01:42</strong><span>until your deadline</span></div>
          <div className="focus-details"><span>AI Ethics assignment</span><small>TDS 2111 · 80% complete</small><div><i /></div></div>
          <button className="solid-button">Open assignment</button>
        </article>
      </section>

      <section className="section-heading-row">
        <div><span>PERSONALISED FOR YOU</span><h2>Worth your attention</h2></div>
        <button className="text-button" onClick={() => navigate("/dashboard/discover")}>Explore everything <ArrowForwardRoundedIcon /></button>
      </section>

      <section className="opportunity-grid">
        {opportunities.slice(0, 3).map((item) => (
          <article className="opportunity-card" key={item.id}>
            <div className="opportunity-top"><span className="category-pill" style={{ color: item.color }}>{item.category}</span><button onClick={() => toggleSaved(item.id)} aria-label={`${saved.includes(item.id) ? "Remove" : "Save"} ${item.title}`}>{saved.includes(item.id) ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}</button></div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="opportunity-meta"><span><CalendarMonthRoundedIcon /> {item.date}</span><span><PlaceRoundedIcon /> {item.location}</span></div>
            <footer><small>Source: {item.source}</small><button onClick={() => navigate("/dashboard/discover")}>View details</button></footer>
          </article>
        ))}
      </section>
    </div>
  );
}

import { useMemo, useState } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { opportunities, type CampusCategory } from "../data/campusData";

const categories: Array<"All" | CampusCategory> = ["All", "Academic", "Event", "Scholarship", "Club"];

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [saved, setSaved] = useState<number[]>([11]);

  const results = useMemo(() => opportunities.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const haystack = `${item.title} ${item.description} ${item.location}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  }), [category, query]);

  return (
    <div className="discover-page">
      <section className="discover-hero">
        <img src="/campus-stream.png" alt="Students moving through a connected digital campus" />
        <div className="discover-overlay">
          <span>DISCOVER YOUR CAMPUS</span>
          <h1>Opportunities that fit<br />where you are going.</h1>
          <p>Events, scholarships, clubs and academic support—filtered around your interests.</p>
        </div>
      </section>

      <section className="discover-controls">
        <label><SearchRoundedIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campus opportunities" /></label>
        <div className="filter-pills">
          {categories.map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}
        </div>
      </section>

      <section className="section-heading-row compact">
        <div><span>CURATED FEED</span><h2>{results.length} matches for you</h2></div>
        <small>Updated from 12 campus sources</small>
      </section>

      <section className="discover-grid">
        {results.map((item) => {
          const isSaved = saved.includes(item.id);
          return (
            <article className="discover-card" key={item.id}>
              <div className="discover-card-band" style={{ background: item.color }} />
              <div className="discover-card-content">
                <div className="opportunity-top"><span className="category-pill" style={{ color: item.color }}>{item.category}</span><button onClick={() => setSaved((current) => isSaved ? current.filter((id) => id !== item.id) : [...current, item.id])}>{isSaved ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}</button></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="opportunity-meta"><span><CalendarMonthRoundedIcon /> {item.date} · {item.time}</span><span><PlaceRoundedIcon /> {item.location}</span></div>
                <footer><small>{item.source}</small><button>Open <ArrowOutwardRoundedIcon /></button></footer>
              </div>
            </article>
          );
        })}
      </section>

      {results.length === 0 ? <div className="empty-state"><SearchRoundedIcon /><h2>No matches yet</h2><p>Try a different phrase or category.</p></div> : null}
    </div>
  );
}

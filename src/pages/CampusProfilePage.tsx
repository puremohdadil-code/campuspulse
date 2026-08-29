import { useState } from "react";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

const allInterests = ["Artificial intelligence", "Product design", "Scholarships", "Hackathons", "Entrepreneurship", "Sustainability", "Robotics", "Volunteering"];

export default function CampusProfilePage() {
  const [interests, setInterests] = useState(["Artificial intelligence", "Product design", "Scholarships", "Hackathons"]);
  const [saved, setSaved] = useState(false);

  return (
    <div className="profile-page">
      <section className="page-heading"><div><span className="page-kicker">PERSONALISE YOUR PULSE</span><h1>Your profile</h1><p>These details decide what CampusPulse brings forward.</p></div></section>
      {saved ? <div className="toast-banner"><CheckRoundedIcon /><strong>Preferences saved for this demo.</strong><button onClick={() => setSaved(false)}>Dismiss</button></div> : null}
      <section className="profile-grid">
        <article className="surface-card identity-card"><span className="large-avatar">AN</span><h2>Aina Noor</h2><p>Bachelor of Computer Science</p><div><span>Faculty</span><strong>Faculty of Computing & Informatics</strong></div><div><span>Campus</span><strong>Cyberjaya</strong></div><div><span>Study year</span><strong>Year 2</strong></div></article>
        <article className="surface-card preference-card"><header><TuneRoundedIcon /><div><span>DISCOVERY PREFERENCES</span><h2>Your interests</h2></div></header><p>Choose topics to tune recommendations and Pulse AI responses.</p><div className="interest-grid">{allInterests.map((interest) => { const active = interests.includes(interest); return <button className={active ? "active" : ""} onClick={() => setInterests((current) => active ? current.filter((item) => item !== interest) : [...current, interest])} key={interest}>{active ? <CheckRoundedIcon /> : null}{interest}</button>; })}</div><button className="solid-button save-preferences" onClick={() => setSaved(true)}>Save preferences</button></article>
      </section>
    </div>
  );
}

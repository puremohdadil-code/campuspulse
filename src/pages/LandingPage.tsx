import { Link } from "react-router-dom";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <Link className="brand-lockup" to="/" aria-label="CampusPulse home">
          <span className="brand-mark">CP</span>
          <span>CampusPulse</span>
        </Link>

        <nav className="landing-links" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#agent">Pulse AI</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <Link className="nav-cta" to="/dashboard">Open dashboard</Link>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><AutoAwesomeRoundedIcon /> Your campus, finally in sync</div>
            <h1>Know what matters.<br /><span>Before you miss it.</span></h1>
            <p>
              CampusPulse gathers deadlines, events, announcements and opportunities,
              then turns them into one personal daily plan with Pulse AI.
            </p>

            <div className="hero-actions">
              <Link className="primary-cta" to="/dashboard">
                Explore your pulse <ArrowForwardRoundedIcon />
              </Link>
              <a className="secondary-cta" href="#agent">Meet Pulse AI</a>
            </div>

            <div className="hero-proof">
              <span><strong>01</strong> unified calendar</span>
              <span><strong>24/7</strong> campus copilot</span>
              <span><strong>0</strong> missed deadlines</span>
            </div>
          </div>

          <div className="app-preview" aria-label="CampusPulse dashboard preview">
            <div className="preview-glow" />
            <div className="preview-window">
              <div className="preview-sidebar">
                <span className="mini-mark">CP</span>
                <span className="side-dot active" />
                <span className="side-dot" />
                <span className="side-dot" />
                <span className="side-dot" />
              </div>
              <div className="preview-content">
                <div className="preview-topbar">
                  <div><small>Friday, 29 August</small><strong>Good morning, Aina.</strong></div>
                  <span className="avatar">AN</span>
                </div>
                <div className="pulse-banner">
                  <div className="pulse-icon"><AutoAwesomeRoundedIcon /></div>
                  <div><small>YOUR DAILY PULSE</small><strong>Three things need your attention today.</strong></div>
                  <button>Review</button>
                </div>
                <div className="preview-grid">
                  <article className="preview-card agenda-card">
                    <div className="card-title"><span><CalendarMonthRoundedIcon /> Today</span><b>View all</b></div>
                    <div className="agenda-item urgent"><time>10:00</time><div><strong>AI Ethics assignment</strong><small>Due in 2 hours</small></div></div>
                    <div className="agenda-item"><time>14:00</time><div><strong>Tech Club workshop</strong><small>FCI XR Lab</small></div></div>
                    <div className="agenda-item"><time>18:30</time><div><strong>Scholarship briefing</strong><small>Online session</small></div></div>
                  </article>
                  <article className="preview-card agent-card" id="agent">
                    <div className="agent-orb"><AutoAwesomeRoundedIcon /></div>
                    <small>PULSE AI</small>
                    <strong>I found a schedule conflict.</strong>
                    <p>Your workshop overlaps with a project meeting. Want me to suggest a new time?</p>
                    <button>Fix my schedule</button>
                  </article>
                </div>
                <div className="notice-strip">
                  <NotificationsActiveRoundedIcon />
                  <span><strong>New opportunity:</strong> Yayasan scholarship applications close on Monday.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features" id="features">
          <header>
            <span>ONE CAMPUS. ONE CLEAR VIEW.</span>
            <h2>Everything it gathers,<br /><em>and everything it clears up.</em></h2>
            <p>CampusPulse follows the mobile-app template logic: focused features, concrete benefits, visible proof and one direct route into the product.</p>
          </header>
          <div className="landing-feature-grid">
            <article><CalendarMonthRoundedIcon /><span>01</span><h3>One smart calendar</h3><p>Course deadlines, club events and opportunities share one timeline with conflict detection.</p></article>
            <article><NotificationsActiveRoundedIcon /><span>02</span><h3>Personal, not noisy</h3><p>Updates are ranked around your courses, interests and urgency instead of broadcast to everyone.</p></article>
            <article><AutoAwesomeRoundedIcon /><span>03</span><h3>Pulse AI takes action</h3><p>Ask a question, compare options and approve calendar or reminder actions from the same conversation.</p></article>
          </div>
        </section>

        <section className="landing-story" id="how-it-works">
          <div className="story-image"><img src="/campus-stream.png" alt="Students on a connected university campus" /></div>
          <div className="story-copy">
            <span>HOW CAMPUSPULSE WORKS</span>
            <h2>From scattered updates<br />to one useful next step.</h2>
            <ol>
              <li><b>01</b><div><strong>Gather</strong><p>Bring academic notices, events, clubs and scholarships into one feed.</p></div></li>
              <li><b>02</b><div><strong>Understand</strong><p>Match every item against the student’s courses, interests and calendar.</p></div></li>
              <li><b>03</b><div><strong>Act</strong><p>Let Pulse AI explain priorities and prepare actions for student approval.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="landing-stats">
          <div><strong>12</strong><span>campus source types</span></div>
          <div><strong>1</strong><span>unified student timeline</span></div>
          <div><strong>24/7</strong><span>AI campus copilot</span></div>
          <div><strong>100%</strong><span>student-controlled actions</span></div>
        </section>

        <section className="landing-final-cta">
          <span>YOUR CAMPUS IS ALREADY MOVING</span>
          <h2>Move with it.</h2>
          <p>Open the complete CampusPulse frontend and experience the daily brief, discovery feed, calendar and Pulse AI demo.</p>
          <Link className="primary-cta" to="/dashboard">Enter CampusPulse <ArrowForwardRoundedIcon /></Link>
        </section>
      </main>

      <footer className="landing-footer"><span className="brand-mark">CP</span><strong>CampusPulse</strong><small>Designed for MMU Hack Day 2026 · Frontend demo</small></footer>
    </div>
  );
}

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const navItems = [
  { label: "Home", path: "/dashboard", icon: HomeRoundedIcon, end: true },
  { label: "Discover", path: "/dashboard/discover", icon: ExploreRoundedIcon },
  { label: "Calendar", path: "/dashboard/calendar", icon: CalendarMonthRoundedIcon },
  { label: "Pulse AI", path: "/dashboard/agent", icon: AutoAwesomeRoundedIcon },
  { label: "Notifications", path: "/dashboard/notifications", icon: NotificationsRoundedIcon, badge: 3 },
];

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="campus-app-shell">
      <aside className={`campus-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><CloseRoundedIcon /></button>
        <button className="app-brand" onClick={() => navigate("/dashboard")}>
          <span className="brand-mark">CP</span>
          <span><strong>CampusPulse</strong><small>MMU student hub</small></span>
        </button>

        <nav className="campus-nav" aria-label="CampusPulse pages">
          <small>MY CAMPUS</small>
          {navItems.map(({ label, path, icon: Icon, badge, end }) => (
            <NavLink key={path} to={path} end={end} onClick={() => setMobileOpen(false)}>
              <Icon /><span>{label}</span>{badge ? <b>{badge}</b> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-agent-card">
          <AutoAwesomeRoundedIcon />
          <strong>Ask Pulse anything</strong>
          <p>Turn campus information into a clear next step.</p>
          <button onClick={() => navigate("/dashboard/agent")}>Start a conversation</button>
        </div>

        <NavLink className="profile-link" to="/dashboard/profile">
          <span className="profile-avatar">AN</span>
          <span><strong>Aina Noor</strong><small>Faculty of Computing</small></span>
          <PersonRoundedIcon />
        </NavLink>
      </aside>

      {mobileOpen ? <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" /> : null}

      <div className="campus-main">
        <header className="campus-topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><MenuRoundedIcon /></button>
          <label className="global-search">
            <SearchRoundedIcon />
            <input aria-label="Search CampusPulse" placeholder="Search deadlines, events, clubs…" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <span className="live-status"><i /> Campus sources synced</span>
            <button className="notification-button" onClick={() => navigate("/dashboard/notifications")} aria-label="View notifications">
              <NotificationsRoundedIcon /><b>3</b>
            </button>
          </div>
        </header>
        <main className="campus-page"><Outlet /></main>
      </div>
    </div>
  );
}

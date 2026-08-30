import { useState } from "react";
import type { FormEvent } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth/AuthContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useCampusTranslation } from "./i18n/campusTranslations";
import { authApi, notificationsApi } from "./api/campuspulse";

const navItems = [
  { labelKey: "nav.home", path: "/dashboard", icon: HomeRoundedIcon, end: true },
  { labelKey: "nav.discover", path: "/dashboard/updates", icon: ExploreRoundedIcon },
  { labelKey: "nav.attendance", path: "/dashboard/attendance", icon: FactCheckRoundedIcon },
  { labelKey: "nav.calendar", path: "/dashboard/calendar", icon: CalendarMonthRoundedIcon },
  { labelKey: "nav.messages", path: "/dashboard/messages", icon: ForumRoundedIcon },
  { labelKey: "nav.notifications", path: "/dashboard/notifications", icon: NotificationsRoundedIcon, showUnread: true },
  { labelKey: "nav.mmu", path: "/dashboard/mmu", icon: AccountBalanceRoundedIcon },
  { labelKey: "nav.settings", path: "/dashboard/settings", icon: SettingsRoundedIcon },
];

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const { session, signOut } = useAuth();
  const { text } = useCampusTranslation();
  // The two badges in this shell are the same number, so they share one
  // query. `unread=true` already excludes dismissed items server-side.
  const unread = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationsApi.list(true),
    retry: false,
    staleTime: 30_000,
  });
  const unreadCount = unread.data?.length ?? 0;
  const health = useQuery({ queryKey: ["health"], queryFn: authApi.health, retry: false, refetchInterval: 60_000 });

  // Onboarding gate. The backend creates an empty UserAcademic on signup,
  // and personalization has nothing to match on until the student fills it
  // in — so an empty profile is sent to the profile screen. Once per mount
  // only: after that they are free to leave it unfinished.
  // The shell search hands the term to Discover, which already filters the
  // campus-content feed — no second search implementation.
  const [search, setSearch] = useState("");
  const runSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(search.trim() ? `/dashboard/discover?q=${encodeURIComponent(search.trim())}` : "/dashboard/discover");
  };

  const logout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="campus-app-shell">
      <aside className={`campus-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label={text("nav.close")}><CloseRoundedIcon /></button>
        <button className="app-brand" onClick={() => navigate("/dashboard")}>
          <span className="brand-mark">CP</span>
          <span><strong>CampusPulse</strong><small>{text("common.brandSubtitle")}</small></span>
        </button>

        <nav className="campus-nav" aria-label={text("nav.label")}>
          <small>{text("nav.campus")}</small>
          {navItems.map(({ labelKey, path, icon: Icon, showUnread, end }) => (
            <NavLink key={path} to={path} end={end} onClick={() => setMobileOpen(false)}>
              <Icon /><span>{text(labelKey)}</span>{showUnread && unreadCount ? <b>{unreadCount}</b> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-account">
          <NavLink className="profile-link" to="/dashboard/profile">
            <span className="profile-avatar">{session?.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
            <span><strong>{session?.name}</strong><small>{text("roles.student")}</small></span>
            <PersonRoundedIcon />
          </NavLink>
          <button className="sidebar-logout" onClick={logout}><LogoutRoundedIcon /> {text("common.signOut")}</button>
        </div>
      </aside>

      {mobileOpen ? <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label={text("nav.closeOverlay")} /> : null}

      <div className="campus-main">
        <header className="campus-topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label={text("nav.open")}><MenuRoundedIcon /></button>
          <form className="global-search" onSubmit={runSearch}>
            <SearchRoundedIcon />
            <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label={text("topbar.searchLabel")} placeholder={text("topbar.search")} />
            <kbd>⌘ K</kbd>
          </form>
          <div className="topbar-actions">
            <LanguageSwitcher />
            <span className={`live-status ${health.isError ? "is-offline" : ""}`} title={health.isError ? text("live.unavailable") : health.data?.timestamp}><i /> {health.isLoading ? text("common.loading") : health.isError ? text("live.unavailable") : text("topbar.synced")}</span>
            <button className="notification-button" onClick={() => navigate("/dashboard/notifications")} aria-label={text("topbar.notifications")}>
              <NotificationsRoundedIcon />{unreadCount ? <b>{unreadCount}</b> : null}
            </button>
          </div>
        </header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            className="campus-page"
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : .38, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}

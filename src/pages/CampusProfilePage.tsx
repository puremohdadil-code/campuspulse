import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { academicApi, coursesApi } from "../api/campuspulse";
import { useAuth } from "../auth/AuthContext";
import { ApiError, ApiLoading } from "../components/ApiState";
import { useCampusTranslation } from "../i18n/campusTranslations";

export default function CampusProfilePage() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { text } = useCampusTranslation();
  const academic = useQuery({ queryKey: ["academic-profile"], queryFn: academicApi.get, retry: false });
  const catalog = useQuery({ queryKey: ["courses"], queryFn: () => coursesApi.list(), retry: false });

  if (academic.isLoading || catalog.isLoading) return <ApiLoading />;
  if (academic.isError) return <ApiError error={academic.error} onRetry={() => academic.refetch()} />;
  if (catalog.isError) return <ApiError error={catalog.error} onRetry={() => catalog.refetch()} />;
  if (!academic.data) return <ApiError error={new Error("The academic profile response was empty.")} onRetry={() => academic.refetch()} />;

  const profile = academic.data;
  const selectedCourses = (catalog.data ?? []).filter((course) => profile.courses.includes(course._id));
  const academy = profile.major || profile.faculty || "—";
  const campus = profile.university || "—";
  const year = profile.yearOfStudy ? `Year ${profile.yearOfStudy}` : "—";
  const initials = session?.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const logout = async () => { await signOut(); navigate("/login", { replace: true }); };

  return (
    <div className="profile-page">
      <section className="page-heading"><div><span className="page-kicker">{text("profile.kicker")}</span><h1>{text("profile.title")}</h1><p>{text("profile.subtitle")}</p></div><button className="logout-button" onClick={logout}><LogoutRoundedIcon /> {text("common.signOut")}</button></section>
      <section className="profile-grid">
        <article className="surface-card identity-card"><span className="large-avatar">{initials}</span><h2>{session?.name}</h2><p>{session?.email}</p><div><span>{text("roles.academicProfile")}</span><strong>{academy}</strong></div><div><span>{text("profile.campus")}</span><strong>{campus}</strong></div><div><span>{text("profile.year")}</span><strong>{year}</strong></div></article>
        <article className="surface-card preference-card"><header><SchoolRoundedIcon /><div><span>{text("profile.academicKicker")}</span><h2>{text("profile.academicTitle")}</h2></div></header><p>{text("profile.academicText")}</p><div className="interest-grid">{selectedCourses.map((course) => <span className="active" key={course._id}>{course.code} · {course.name}</span>)}</div><h3>{text("profile.interests")}</h3><div className="interest-grid">{profile.interests.map((interest) => <span className="active" key={interest}>{interest}</span>)}</div><button className="solid-button save-preferences" onClick={() => navigate("/onboarding")}><EditRoundedIcon /> {text("settings.edit")}</button></article>
      </section>
    </div>
  );
}

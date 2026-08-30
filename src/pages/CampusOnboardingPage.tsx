import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AuthShell from "../components/AuthShell";
import { ApiError, ApiLoading } from "../components/ApiState";
import { academicApi, apiErrorMessage, coursesApi, notificationsApi } from "../api/campuspulse";
import type { Course, EditableAcademic } from "../api/types";
import { useCampusTranslation } from "../i18n/campusTranslations";

function uniqueTags(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function optionLabel(value: string) {
  const acronyms: Record<string, string> = { ai: "AI", it: "IT", ux: "UX", vr: "VR", ar: "AR" };
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) => acronyms[part.toLowerCase()] ?? `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export default function CampusOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { text } = useCampusTranslation();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[] | null>(null);
  const [interests, setInterests] = useState<string[] | null>(null);
  const [interestDraft, setInterestDraft] = useState("");
  const [faculty, setFaculty] = useState<string | null>(null);
  const [major, setMajor] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [personalizing, setPersonalizing] = useState(false);
  const [personalizeError, setPersonalizeError] = useState("");

  const catalog = useQuery({ queryKey: ["courses"], queryFn: () => coursesApi.list(), retry: false });
  const academic = useQuery({ queryKey: ["academic-profile"], queryFn: academicApi.get, retry: false });

  const currentCourses = selected ?? academic.data?.courses ?? [];
  const currentInterests = useMemo(
    () => interests ?? academic.data?.interests ?? [],
    [academic.data?.interests, interests],
  );
  const currentFaculty = faculty ?? academic.data?.faculty ?? "";
  const currentMajor = major ?? academic.data?.major ?? "";
  const currentYear = year ?? (academic.data?.yearOfStudy ? String(academic.data.yearOfStudy) : "");

  const facultyOptions = useMemo(
    () => uniqueTags([
      academic.data?.faculty ?? "",
      ...(catalog.data ?? []).map((course) => course.faculty ?? ""),
    ]).sort((a, b) => a.localeCompare(b)),
    [academic.data?.faculty, catalog.data],
  );

  const catalogTags = useMemo(
    () => uniqueTags((catalog.data ?? []).flatMap((course) => course.tags ?? [])),
    [catalog.data],
  );

  const majorOptions = useMemo(() => {
    const facultyCourses = currentFaculty
      ? (catalog.data ?? []).filter((course) => course.faculty?.trim() === currentFaculty)
      : (catalog.data ?? []);
    const facultyName = currentFaculty.toLowerCase();
    const usableTags = uniqueTags(facultyCourses.flatMap((course) => course.tags ?? []))
      .filter((tag) => {
        const normalized = tag.toLowerCase();
        return normalized !== facultyName
          && !normalized.startsWith("school of ")
          && !normalized.startsWith("faculty of ")
          && !["core", "elective", "general", "course"].includes(normalized);
      })
      .map(optionLabel);
    return uniqueTags([academic.data?.major ?? "", ...usableTags]).sort((a, b) => a.localeCompare(b));
  }, [academic.data?.major, catalog.data, currentFaculty]);

  const interestOptions = useMemo(
    () => uniqueTags([...currentInterests, ...catalogTags]).sort((a, b) => optionLabel(a).localeCompare(optionLabel(b))),
    [catalogTags, currentInterests],
  );

  const realIds = useMemo(() => new Set((catalog.data ?? []).map((course) => course._id)), [catalog.data]);
  const grouped = useMemo(() => {
    const map = new Map<string, Course[]>();
    const term = query.trim().toLowerCase();
    for (const course of catalog.data ?? []) {
      if (term && !`${course.code} ${course.name} ${course.faculty ?? ""}`.toLowerCase().includes(term)) continue;
      const group = course.faculty?.trim() || "Other";
      map.set(group, [...(map.get(group) ?? []), course]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [catalog.data, query]);

  const addInterest = () => {
    const next = uniqueTags([...currentInterests, interestDraft]);
    if (next.length !== currentInterests.length) setInterests(next);
    setInterestDraft("");
  };

  const personalize = async () => {
    setPersonalizing(true);
    setPersonalizeError("");
    try {
      await notificationsApi.personalize();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["campus-content"] }),
        queryClient.invalidateQueries({ queryKey: ["attendance"] }),
        queryClient.invalidateQueries({ queryKey: ["daily-brief"] }),
      ]);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setPersonalizeError(apiErrorMessage(requestError));
    } finally {
      setPersonalizing(false);
    }
  };

  const saveProfile = useMutation({
    mutationFn: async (payload: EditableAcademic) => academicApi.update(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["academic-profile"] });
      await personalize();
    },
    onError: (requestError) => setError(apiErrorMessage(requestError)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const courseIds = currentCourses.filter((id) => realIds.has(id));
    const cleanInterests = uniqueTags(currentInterests);
    if (!courseIds.length || !cleanInterests.length) {
      setError(text("onboarding.selectError"));
      return;
    }
    const payload: EditableAcademic = { courses: courseIds, interests: cleanInterests };
    if (currentFaculty.trim()) payload.faculty = currentFaculty.trim();
    if (currentMajor.trim()) payload.major = currentMajor.trim();
    if (currentYear) {
      const numericYear = Number(currentYear);
      if (!Number.isInteger(numericYear) || numericYear < 1 || numericYear > 10) {
        setError(text("onboarding.yearError"));
        return;
      }
      payload.yearOfStudy = numericYear;
    }
    saveProfile.mutate(payload);
  };

  if (catalog.isLoading || academic.isLoading) return <ApiLoading />;
  if (catalog.isError) return <ApiError error={catalog.error} onRetry={() => catalog.refetch()} />;
  if (academic.isError) return <ApiError error={academic.error} onRetry={() => academic.refetch()} />;

  if (personalizing || personalizeError) {
    return (
      <div className="onboarding-processing">
        <span className={personalizing ? "processing-orb is-spinning" : "processing-orb"}><SchoolRoundedIcon /></span>
        <h1>{personalizing ? text("onboarding.building") : text("onboarding.retryTitle")}</h1>
        <p>{personalizing ? text("onboarding.buildingText") : personalizeError}</p>
        {personalizeError ? <button className="solid-button" onClick={personalize}>{text("onboarding.retry")}</button> : null}
      </div>
    );
  }

  return (
    <AuthShell eyebrow={text("onboarding.eyebrow")} title={text("onboarding.title")} description={text("onboarding.subtitle")}>
      <form className="auth-form onboarding-form" onSubmit={submit}>
        <div className="auth-two-column">
          <label>{text("onboarding.faculty")}<select value={currentFaculty} onChange={(event) => { setFaculty(event.target.value); setMajor(""); }}><option value="">{text("onboarding.selectFaculty")}</option>{facultyOptions.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>
          <label>{text("onboarding.major")}<select value={currentMajor} onChange={(event) => setMajor(event.target.value)} disabled={!majorOptions.length}><option value="">{text("onboarding.selectMajor")}</option>{majorOptions.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>
        </div>
        <label>{text("onboarding.year")}<select value={currentYear} onChange={(event) => setYear(event.target.value)}><option value="">{text("onboarding.selectYear")}</option>{Array.from({ length: 10 }, (_, index) => String(index + 1)).map((option) => <option value={option} key={option}>{option}</option>)}</select></label>

        <label>{text("onboarding.interests")}
          <span className="tag-input-row"><select value={interestDraft} onChange={(event) => setInterestDraft(event.target.value)}><option value="">{text("onboarding.selectInterest")}</option>{interestOptions.filter((option) => !currentInterests.includes(option)).map((option) => <option value={option} key={option}>{optionLabel(option)}</option>)}</select><button type="button" onClick={addInterest} disabled={!interestDraft}>{text("onboarding.add")}</button></span>
        </label>
        <div className="onboarding-tags">
          {currentInterests.map((interest) => <button type="button" key={interest} onClick={() => setInterests(currentInterests.filter((item) => item !== interest))}>{interest}<CloseRoundedIcon /></button>)}
        </div>

        <label>{text("onboarding.search")}<span className="course-search"><SearchRoundedIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text("onboarding.searchHint")} /></span></label>
        <div className="course-picker">
          {grouped.map(([group, courses]) => (
            <section key={group}><h3>{group}</h3><div className="course-picker-grid">{courses.map((course) => {
              const active = currentCourses.includes(course._id);
              return <button type="button" className={active ? "active" : ""} onClick={() => setSelected(active ? currentCourses.filter((id) => id !== course._id) : [...currentCourses, course._id])} key={course._id}>{active ? <CheckRoundedIcon /> : null}<span><strong>{course.code}</strong><small>{course.name}</small></span></button>;
            })}</div></section>
          ))}
        </div>
        {error ? <div className="auth-error">{error}</div> : null}
        <button className="auth-submit" type="submit" disabled={saveProfile.isPending}>{saveProfile.isPending ? text("onboarding.saving") : text("onboarding.save")}</button>
      </form>
    </AuthShell>
  );
}

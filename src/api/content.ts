import type { CampusContent, CampusContentType, NotificationPriority } from "./types";

// The backend has four content types; the UI has always spoken in four
// categories with a fixed colour each. Everything that renders campus
// content (dashboard, discover, calendar) maps through here so one
// backend item never shows up as two different colours across pages.
export type CampusCategory = "Academic" | "Event" | "Scholarship" | "Club";

const CATEGORY_BY_TYPE: Record<CampusContentType, CampusCategory> = {
  announcement: "Academic",
  deadline: "Academic",
  event: "Event",
  scholarship: "Scholarship",
};

const COLOR_BY_CATEGORY: Record<CampusCategory, string> = {
  Academic: "#b34237",
  Event: "#4975a8",
  Scholarship: "#8d6d33",
  Club: "#2f7d63",
};

export function categoryOf(type: CampusContentType): CampusCategory {
  return CATEGORY_BY_TYPE[type] ?? "Academic";
}

export function colorOf(type: CampusContentType): string {
  return COLOR_BY_CATEGORY[categoryOf(type)];
}

/** The one date an item is really about: its deadline, else its start. */
export function contentDate(item: Pick<CampusContent, "deadline" | "startDate">): Date | null {
  const raw = item.deadline || item.startDate;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDay(date: Date | null, lang: string) {
  if (!date) return "—";
  return new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" }).format(date);
}

export function formatTime(date: Date | null, lang: string) {
  if (!date) return "";
  return new Intl.DateTimeFormat(lang, { hour: "numeric", minute: "2-digit" }).format(date);
}

/**
 * The agenda column renders the clock and its am/pm marker as two separate
 * elements, so the formatted time has to come back already split.
 */
export function splitTime(date: Date | null, lang: string): [string, string] {
  const formatted = formatTime(date, lang);
  if (!formatted) return ["--:--", ""];
  const gap = formatted.lastIndexOf(" ");
  return gap === -1 ? [formatted, ""] : [formatted.slice(0, gap), formatted.slice(gap + 1)];
}

/** Within a day of its date — what the agenda row highlights as urgent. */
export function isUrgent(date: Date | null) {
  if (!date) return false;
  const delta = date.getTime() - Date.now();
  return delta >= 0 && delta <= 24 * 60 * 60 * 1000;
}

// The notification rows carry severity styling that predates the API. The
// backend ranks with four priorities, so they map onto the four strongest
// severity steps the stylesheet already defines.
const SEVERITY_BY_PRIORITY: Record<NotificationPriority, string> = {
  critical: "critical",
  high: "elevated",
  medium: "warning",
  low: "notice",
};

export function severityOf(priority: NotificationPriority) {
  return SEVERITY_BY_PRIORITY[priority] ?? "notice";
}

export function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 7],
];

/** "8 min ago" in whichever language is active. */
export function relativeTime(iso: string, lang: string) {
  const formatter = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  let value = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(value) < size) return formatter.format(value, unit);
    value = Math.round(value / size);
  }
  return formatter.format(value, "week");
}

// Auto-generated "Timetable update" / template rows carry no action for the
// student and crowd out real deadlines, so every browse surface hides them.
const NOISE_TITLE = /\b(?:timetable|template|update)\b/i;

export function isNoise(title: string | null | undefined) {
  return !!title && NOISE_TITLE.test(title);
}

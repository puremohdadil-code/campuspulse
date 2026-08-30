import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useCampusTranslation } from "../i18n/campusTranslations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentApi, notificationsApi } from "../api/campuspulse";
import PageLoading from "../components/PageLoading";
import { categoryOf, colorOf, contentDate, formatDay, formatTime, isNoise } from "../api/content";
import type { CampusContentType } from "../api/types";
import { ApiError } from "../components/ApiState";

const types: Array<{ value: "all" | CampusContentType; labelKey: string }> = [
  { value: "all", labelKey: "updates.all" },
  { value: "announcement", labelKey: "updates.announcements" },
  { value: "deadline", labelKey: "updates.deadlines" },
  { value: "event", labelKey: "updates.events" },
  { value: "scholarship", labelKey: "updates.scholarships" },
];

export default function DiscoverPage() {
  // The shell's search box navigates here with ?q=, so the term survives
  // the page change instead of being dropped on arrival.
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const setQuery = (next: string) => setParams(next ? { q: next } : {}, { replace: true });
  const [type, setType] = useState<"all" | CampusContentType>("all");
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [draftProgress, setDraftProgress] = useState<Record<string, number>>({});
  const { lang, text } = useCampusTranslation();
  const queryClient = useQueryClient();
  const content = useQuery({ queryKey: ["campus-content", type, upcomingOnly], queryFn: () => contentApi.list({ ...(type === "all" ? {} : { type }), upcoming: upcomingOnly }), retry: false });

  const contentItems = useMemo(() => (content.data ?? []).filter((item) => !isNoise(item.title)).map((item) => {
    const date = contentDate(item);
    return {
      id: item._id,
      title: item.title,
      description: item.description || "",
      category: categoryOf(item.type),
      date: formatDay(date, lang),
      time: formatTime(date, lang),
      location: item.location || "—",
      source: item.source || "—",
      color: colorOf(item.type),
      // Tags come from the backend and are the only searchable text that
      // is not already on the card, so the filter reads them too.
      tags: item.tags.join(" "),
      url: item.url,
      // The caller's own state on this item, or null when the AI never
      // surfaced it — that is what the bookmark toggle acts on.
      myState: item.myState ?? null,
    };
  }), [content.data, lang]);

  const results = useMemo(() => contentItems.filter((item) => {
    const haystack = `${item.title} ${item.description} ${item.location} ${item.source} ${item.tags}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  }), [query, contentItems]);

  // Bookmarking is "start tracking this": addressed by campus-content id it
  // creates the notification when there isn't one, so the item then also
  // shows up in the feed.
  const track = useMutation({
    mutationFn: ({ contentId, notificationId, progress }: { contentId: string; notificationId?: string; progress: number }) => notificationId
      ? notificationsApi.setProgress(notificationId, progress)
      : notificationsApi.trackContent(contentId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campus-content"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (content.isLoading) return <PageLoading />;
  if (content.isError) return <ApiError error={content.error} onRetry={() => content.refetch()} />;

  return (
    <div className="discover-page">
      <section className="discover-hero">
        <img src="/campus-stream.png" alt={text("discover.alt")} />
        <div className="discover-overlay">
          <span>{text("discover.kicker")}</span>
          <h1>{text("discover.title1")}<br />{text("discover.title2")}</h1>
          <p>{text("discover.subtitle")}</p>
        </div>
      </section>

      <section className="discover-controls">
        <label><SearchRoundedIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text("discover.search")} /></label>
        <div className="filter-pills">
          {types.map((item) => <button className={type === item.value ? "active" : ""} onClick={() => setType(item.value)} key={item.value}>{text(item.labelKey)}</button>)}
          <button className={upcomingOnly ? "active" : ""} onClick={() => setUpcomingOnly((current) => !current)}>{upcomingOnly ? text("updates.upcoming") : text("updates.allDates")}</button>
        </div>
      </section>

      <section className="section-heading-row compact">
        <div><span>{text("discover.feed")}</span><h2>{text("discover.matches", { count: results.length })}</h2></div>
        <small>{text("updates.api")}</small>
      </section>

      <section className="discover-grid">
        {results.map((item) => {
          const tracked = item.myState;
          return (
            <article className="discover-card" key={item.id}>
              <div className="discover-card-band" style={{ background: item.color }} />
              <div className="discover-card-content">
                <div className="opportunity-top"><span className="category-pill" style={{ color: item.color }}>{text(`discover.${item.category.toLowerCase()}`)}</span><button onClick={() => !tracked && track.mutate({ contentId: item.id, progress: 0 })} disabled={track.isPending} title={text(tracked ? "messages.tracking" : "messages.track")} aria-label={text(tracked ? "messages.tracking" : "messages.track")}>{tracked ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}</button></div>
                {tracked ? <div className="content-state"><span className="category-pill">{tracked.completed ? text("messages.done") : `${text("messages.progress")} ${tracked.progress}%`}</span>{tracked.priority ? <span className="category-pill">{tracked.priority}</span> : null}</div> : null}
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="opportunity-meta"><span><CalendarMonthRoundedIcon /> {item.date} · {item.time}</span><span><PlaceRoundedIcon /> {item.location}</span></div>
                <label className="message-progress">{text("messages.progress")}<input type="range" min={0} max={100} step={5} value={draftProgress[item.id] ?? tracked?.progress ?? 0} onChange={(event) => setDraftProgress((current) => ({ ...current, [item.id]: Number(event.target.value) }))} onPointerUp={() => track.mutate({ contentId: item.id, notificationId: tracked?.notificationId, progress: draftProgress[item.id] ?? tracked?.progress ?? 0 })} /><b>{draftProgress[item.id] ?? tracked?.progress ?? 0}%</b></label>
                <footer><small>{item.source}</small><button onClick={() => item.url && window.open(item.url, "_blank", "noopener,noreferrer")}>{text("discover.open")} <ArrowOutwardRoundedIcon /></button></footer>
              </div>
            </article>
          );
        })}
      </section>

      {results.length === 0 ? <div className="empty-state"><SearchRoundedIcon /><h2>{text("discover.empty")}</h2><p>{text("discover.emptyText")}</p></div> : null}
    </div>
  );
}

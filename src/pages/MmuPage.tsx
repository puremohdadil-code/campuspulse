import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useCampusTranslation } from "../i18n/campusTranslations";

/* Illustrations are inline SVG rather than image files: they inherit the
   portal palette through currentColor and CSS variables, stay sharp at any
   size, cost no extra request, and expose named classes the stylesheet can
   animate part by part on hover. */

function MainSiteArt() {
  // A proper portico: pediment over an entablature, six fluted columns with
  // capitals and bases, and three steps down to the plaza.
  const columns = [79, 107, 135, 171, 199, 227];
  return (
    <svg viewBox="0 0 320 170" role="presentation" focusable="false">
      <rect className="art-sky" x="0" y="0" width="320" height="170" rx="4" />

      <g className="art-drift">
        <circle className="art-glow" cx="280" cy="38" r="27" />
      </g>

      <g className="art-rise">
        {/* flag over the roofline */}
        <g className="ms-mast">
          <path className="ms-pole" d="M160 30 V6" />
          <path className="art-red art-flag" d="M161 8 h17 l-4 6 l4 6 h-17 z" />
        </g>

        {/* pediment */}
        <path className="art-navy" d="M160 28 L256 66 H64 Z" />
        <path className="ms-tympanum" d="M160 40 L233 64 H87 Z" />
        <circle className="ms-emblem" cx="160" cy="55" r="6" />

        {/* entablature */}
        <rect className="art-navy" x="66" y="66" width="188" height="14" rx="2" />
        <rect className="art-gold ms-frieze" x="70" y="69" width="180" height="5" rx="1" />

        {/* the lit doorway, seen through the colonnade */}
        <rect className="ms-door" x="150" y="96" width="20" height="32" rx="2" />

        {columns.map((x, i) => (
          <g className="ms-col" key={x} style={{ transitionDelay: `${i * 55}ms` }}>
            <rect className="art-navy" x={x - 3} y="80" width="20" height="5" rx="1" />
            <rect className="art-navy" x={x} y="85" width="14" height="40" />
            <path className="ms-flute" d={`M${x + 4} 88 V122 M${x + 7} 88 V122 M${x + 10} 88 V122`} />
            <rect className="art-navy" x={x - 3} y="125" width="20" height="5" rx="1" />
          </g>
        ))}

        {/* steps */}
        <rect className="art-navy" x="66" y="130" width="188" height="6" rx="1" />
        <rect className="ms-step" x="60" y="136" width="200" height="6" rx="1" />
        <rect className="ms-step" x="54" y="142" width="212" height="6" rx="1" />
      </g>

      <rect className="art-ground" x="34" y="154" width="252" height="3" rx="1.5" />
    </svg>
  );
}

function ClicArt() {
  // Gauge ticks around the dial: twelve marks, the first nine picked out to
  // echo the figure the ring is drawing.
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { x1: 98 + Math.cos(a) * 49, y1: 85 + Math.sin(a) * 49, x2: 98 + Math.cos(a) * 54, y2: 85 + Math.sin(a) * 54, on: i < 10 };
  });
  const rows = [
    { y: 42, w: 34, accent: "art-red", tail: 52, tx: 218 },
    { y: 80, w: 26, accent: "art-gold", tail: 60, tx: 210 },
    { y: 118, w: 42, accent: "art-navy", tail: 44, tx: 226 },
  ];

  return (
    <svg viewBox="0 0 320 170" role="presentation" focusable="false">
      <rect className="art-sky" x="0" y="0" width="320" height="170" rx="4" />

      {/* attendance ring — the number a CLiC visit is usually about */}
      <g className="art-rise">
        <circle className="art-ring-halo" cx="98" cy="85" r="46" />
        <g className="art-ticks">
          {ticks.map((t, i) => (
            <line className={t.on ? "art-tick-mark is-on" : "art-tick-mark"} key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} style={{ transitionDelay: `${i * 45}ms` }} />
          ))}
        </g>
        <circle className="art-ring-track" cx="98" cy="85" r="40" />
        <circle className="art-ring" cx="98" cy="85" r="40" transform="rotate(-90 98 85)" />
        <text className="art-figure" x="98" y="88" textAnchor="middle">86%</text>
        <text className="art-figure-note" x="98" y="102" textAnchor="middle">ATTENDANCE</text>
      </g>

      <g className="art-rows">
        {rows.map((r, i) => (
          <g className={`art-row art-row-${i + 1}`} key={r.y} style={{ transitionDelay: `${i * 70}ms` }}>
            <rect className="art-panel" x="164" y={r.y} width="118" height="30" rx="4" />
            <circle className={`art-row-dot ${r.accent}`} cx="172" cy={r.y + 15} r="2.5" />
            <rect className={r.accent} x="180" y={r.y + 12} width={r.w} height="6" rx="3" />
            <rect className="art-line" x={r.tx} y={r.y + 12} width={r.tail} height="6" rx="3" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function EbwiseArt() {
  // The eBWise identity rebuilt as vector so it can be animated piece by
  // piece: the blue mosaic is the brand's own "pixels resolving into
  // knowledge" motif, so it is what assembles on hover.
  const pixels = [
    { x: 24, y: 96, s: 13, o: 0.95 }, { x: 40, y: 96, s: 13, o: 0.8 },
    { x: 24, y: 80, s: 13, o: 0.7 }, { x: 40, y: 80, s: 13, o: 0.95 },
    { x: 56, y: 80, s: 13, o: 0.55 }, { x: 24, y: 64, s: 13, o: 0.45 },
    { x: 40, y: 64, s: 13, o: 0.7 }, { x: 10, y: 88, s: 9, o: 0.5 },
    { x: 10, y: 72, s: 9, o: 0.32 }, { x: 56, y: 60, s: 9, o: 0.4 },
    { x: 24, y: 50, s: 9, o: 0.28 }, { x: 8, y: 104, s: 7, o: 0.35 },
  ];
  return (
    <svg viewBox="0 0 320 170" role="img" aria-label="eBWise">
      <rect className="art-sky" x="0" y="0" width="320" height="170" rx="4" />
      <g className="ebw-pixels">
        {pixels.map((p, i) => (
          <rect className="ebw-pixel" key={i} x={p.x} y={p.y} width={p.s} height={p.s} rx="1.5" opacity={p.o} style={{ animationDelay: `${i * 42}ms` }} />
        ))}
      </g>

      {/* the owl-book mark */}
      <g className="ebw-mark">
        <path className="ebw-mark-body" d="M78 54 h50 a6 6 0 0 1 6 6 v52 a6 6 0 0 1 -6 6 h-50 a6 6 0 0 1 -6 -6 v-52 a6 6 0 0 1 6 -6 z" />
        <path className="ebw-page" d="M79 66 q12 -5 24 0 v44 q-12 -5 -24 0 z" />
        <path className="ebw-page ebw-page-right" d="M127 66 q-12 -5 -24 0 v44 q12 -5 24 0 z" />
        <g className="ebw-eyes">
          <circle className="ebw-eye" cx="92" cy="72" r="10" />
          <circle className="ebw-eye" cx="114" cy="72" r="10" />
          <circle className="ebw-pupil" cx="92" cy="72" r="4.6" />
          <circle className="ebw-pupil" cx="114" cy="72" r="4.6" />
        </g>
        <path className="ebw-beak" d="M103 84 l6 0 l-3 6 z" />
      </g>

      <g className="ebw-word">
        <text className="ebw-e" x="152" y="106">e</text>
        <text className="ebw-b" x="176" y="106">B</text>
        <text className="ebw-wise" x="206" y="106">wise</text>
        <path className="ebw-swoosh" d="M207 117 q42 9 88 -4" />
      </g>
    </svg>
  );
}

function TeamsArt() {
  // A meeting window rather than four loose boxes: title bar, participant
  // grid with an active speaker, and the call controls along the bottom.
  const tiles = [
    { x: 56, y: 46, live: true }, { x: 163, y: 46, live: false },
    { x: 56, y: 86, live: false }, { x: 163, y: 86, live: false },
  ];
  return (
    <svg viewBox="0 0 320 170" role="presentation" focusable="false">
      <rect className="art-sky" x="0" y="0" width="320" height="170" rx="4" />

      <g className="art-rise">
        <rect className="art-panel art-stage" x="48" y="22" width="224" height="126" rx="6" />

        {/* window chrome */}
        <g className="tm-header">
          <path className="tm-header-rule" d="M48 40 H272" />
          <circle className="tm-chrome" cx="60" cy="31" r="2.6" />
          <circle className="tm-chrome" cx="69" cy="31" r="2.6" />
          <circle className="tm-chrome" cx="78" cy="31" r="2.6" />
          <circle className="art-live-halo" cx="214" cy="30" r="9" />
          <circle className="tm-live-dot" cx="214" cy="30" r="3.5" />
          <text className="tm-live-label" x="222" y="33">LIVE</text>
          <text className="tm-time" x="264" y="33" textAnchor="end">12:04</text>
        </g>

        {tiles.map((t, i) => (
          <g className={`tm-tile tm-tile-${i + 1}`} key={i} style={{ transitionDelay: `${i * 60}ms` }}>
            <rect className="tm-tile-bg" x={t.x} y={t.y} width="101" height="34" rx="4" />
            {t.live ? <rect className="tm-speaking" x={t.x} y={t.y} width="101" height="34" rx="4" /> : null}
            <circle className="tm-avatar" cx={t.x + 50} cy={t.y + 13} r="7" />
            <path className="tm-avatar" d={`M${t.x + 39} ${t.y + 31} a11 11 0 0 1 22 0 z`} />
            <rect className="tm-name" x={t.x + 6} y={t.y + 25} width="22" height="4" rx="2" />
            {t.live ? (
              <g className="tm-wave">
                <rect x={t.x + 84} y={t.y + 20} width="3" height="7" rx="1.5" />
                <rect x={t.x + 89} y={t.y + 17} width="3" height="13" rx="1.5" />
                <rect x={t.x + 94} y={t.y + 21} width="3" height="5" rx="1.5" />
              </g>
            ) : null}
          </g>
        ))}

        {/* call controls */}
        <g className="tm-controls">
          <circle className="tm-ctrl" cx="118" cy="132" r="9" />
          <circle className="tm-ctrl" cx="142" cy="132" r="9" />
          <circle className="tm-ctrl" cx="166" cy="132" r="9" />
          <rect className="tm-ctrl-end" x="182" y="123" width="30" height="18" rx="9" />
        </g>
      </g>
    </svg>
  );
}

interface Portal {
  key: string;
  href: string;
  art: ReactNode;
  tone: string;
}

const portals: Portal[] = [
  { key: "main", href: "https://www.mmu.edu.my/", art: <MainSiteArt />, tone: "navy" },
  { key: "clic", href: "https://clic.mmu.edu.my", art: <ClicArt />, tone: "red" },
  { key: "ebwise", href: "https://ebwise.mmu.edu.my", art: <EbwiseArt />, tone: "ebwise" },
  { key: "teams", href: "https://teams.cloud.microsoft/convene/worker/", art: <TeamsArt />, tone: "blue" },
];

export default function MmuPage() {
  const { text } = useCampusTranslation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="mmu-page">
      <section className="page-heading mmu-heading">
        <div>
          <span className="page-kicker">{text("mmu.kicker")}</span>
          <h1>{text("mmu.title")}</h1>
          <p>{text("mmu.subtitle")}</p>
        </div>
      </section>

      <motion.section
        className="mmu-grid"
        initial={reduceMotion ? false : "hidden"}
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.09 } } }}
      >
        {portals.map((portal) => (
          <motion.a
            className={`mmu-card tone-${portal.tone}`}
            key={portal.key}
            href={portal.href}
            target="_blank"
            rel="noopener noreferrer"
            title={text("mmu.external")}
            variants={{
              hidden: { opacity: 0, y: 26 },
              shown: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }}
            whileHover={reduceMotion ? undefined : { y: -8 }}
            whileTap={reduceMotion ? undefined : { y: -2 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <span className="mmu-sheen" aria-hidden="true" />
            <div className="mmu-art">{portal.art}</div>
            <div className="mmu-body">
              <span className="mmu-tag">{text(`mmu.${portal.key}Name`)}<i /></span>
              <p>{text(`mmu.${portal.key}Text`)}</p>
              <ul className="mmu-chips">
                {text(`mmu.${portal.key}Tags`).split("|").map((chip) => <li key={chip}>{chip}</li>)}
              </ul>
              <span className="mmu-cta">{text("mmu.open")} <ArrowOutwardRoundedIcon /></span>
            </div>
          </motion.a>
        ))}
      </motion.section>
    </div>
  );
}

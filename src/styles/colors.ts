// =====================================================
// Design tokens
// Every theme below shares the same shape, so swapping
// THEMES.<name> below re-skins the whole app safely.
// =====================================================

export interface Theme {
  primary: string;
  primaryHover: string;
  /** Text/icon color to use on top of a solid `primary` fill. */
  onPrimary: string;

  background: string;
  card: string;
  cardHover: string;

  border: string;
  borderStrong: string;

  text: string;
  textLight: string;
  textMuted: string;

  white: string;
  /** rgba shadow tint, tuned per theme for elevation (box-shadow). */
  shadow: string;

  success: string;
  warning: string;
  error: string;
  info: string;
}

// Shared, deliberately theme-agnostic status colors — flat, modern,
// readable with white text. Keeping these fixed means "success" always
// reads as success no matter which theme is active.
const status = {
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
  info: "#2563EB",
};

const coffeeTheme: Theme = {
  primary: "#6F4E37",
  primaryHover: "#5A3E2B",
  onPrimary: "#FFFFFF",
  background: "#FBF7F2",
  card: "#FFFFFF",
  cardHover: "#F5EEE6",
  border: "#E8DCCB",
  borderStrong: "#D8C6AC",
  text: "#362419",
  textLight: "#8A7566",
  textMuted: "#B3A292",
  white: "#FFFFFF",
  shadow: "rgba(111, 78, 55, 0.14)",
  ...status,
};

const forestTheme: Theme = {
  primary: "#2F6F4E",
  primaryHover: "#255A3F",
  onPrimary: "#FFFFFF",
  background: "#F5FAF6",
  card: "#FFFFFF",
  cardHover: "#EAF4EC",
  border: "#D7E9DB",
  borderStrong: "#BEDDC5",
  text: "#1C3B2A",
  textLight: "#6E8F7B",
  textMuted: "#9DB8AA",
  white: "#FFFFFF",
  shadow: "rgba(47, 111, 78, 0.14)",
  ...status,
};

const plumTheme: Theme = {
  primary: "#6B3FA0",
  primaryHover: "#55317F",
  onPrimary: "#FFFFFF",
  background: "#FAF7FC",
  card: "#FFFFFF",
  cardHover: "#F1E9F7",
  border: "#E3D3EF",
  borderStrong: "#CDB2E3",
  text: "#2E1F3D",
  textLight: "#8E76A6",
  textMuted: "#B7A5C7",
  white: "#FFFFFF",
  shadow: "rgba(107, 63, 160, 0.14)",
  ...status,
};

const oceanTheme: Theme = {
  primary: "#1D6FA5",
  primaryHover: "#17587F",
  onPrimary: "#FFFFFF",
  background: "#F4F9FC",
  card: "#FFFFFF",
  cardHover: "#E8F2F8",
  border: "#D3E6F1",
  borderStrong: "#B3D4E8",
  text: "#142C3B",
  textLight: "#6C8CA0",
  textMuted: "#9BB3C2",
  white: "#FFFFFF",
  shadow: "rgba(29, 111, 165, 0.14)",
  ...status,
};

const sunsetTheme: Theme = {
  primary: "#E0654A",
  primaryHover: "#C14F38",
  onPrimary: "#FFFFFF",
  background: "#FFF8F5",
  card: "#FFFFFF",
  cardHover: "#FBEAE4",
  border: "#F5D9CE",
  borderStrong: "#EFC0AE",
  text: "#3B2018",
  textLight: "#A67C6D",
  textMuted: "#C5A79A",
  white: "#FFFFFF",
  shadow: "rgba(224, 101, 74, 0.16)",
  ...status,
};

const mintTheme: Theme = {
  primary: "#158A85",
  primaryHover: "#10706C",
  onPrimary: "#FFFFFF",
  background: "#F2FAF9",
  card: "#FFFFFF",
  cardHover: "#E3F4F2",
  border: "#CDE9E6",
  borderStrong: "#A9DAD5",
  text: "#143331",
  textLight: "#67918D",
  textMuted: "#9BBCB8",
  white: "#FFFFFF",
  shadow: "rgba(21, 138, 133, 0.14)",
  ...status,
};

const midnightTheme: Theme = {
  primary: "#33475B",
  primaryHover: "#253544",
  onPrimary: "#FFFFFF",
  background: "#F6F8F9",
  card: "#FFFFFF",
  cardHover: "#EBEFF2",
  border: "#DCE2E7",
  borderStrong: "#C2CCD3",
  text: "#1A2530",
  textLight: "#74838F",
  textMuted: "#A2AFB8",
  white: "#FFFFFF",
  shadow: "rgba(51, 71, 91, 0.14)",
  ...status,
};

const roseGoldTheme: Theme = {
  primary: "#B98A80",
  primaryHover: "#9E6F65",
  onPrimary: "#FFFFFF",
  background: "#FDF8F7",
  card: "#FFFFFF",
  cardHover: "#F7EAE7",
  border: "#F0DAD5",
  borderStrong: "#E3C0B8",
  text: "#4A332F",
  textLight: "#9C7D76",
  textMuted: "#C2A9A3",
  white: "#FFFFFF",
  shadow: "rgba(185, 138, 128, 0.16)",
  ...status,
};

// ---------------------------------------------------------------------
// New: modern / elegant additions
// ---------------------------------------------------------------------

// Neutral-indigo SaaS look (Linear / Vercel / Stripe dashboard family).
const slateTheme: Theme = {
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  onPrimary: "#FFFFFF",
  background: "#F8F9FC",
  card: "#FFFFFF",
  cardHover: "#F1F2FA",
  border: "#E4E6F0",
  borderStrong: "#CDD1E4",
  text: "#1E1B2E",
  textLight: "#6B7094",
  textMuted: "#9EA2C0",
  white: "#FFFFFF",
  shadow: "rgba(79, 70, 229, 0.16)",
  ...status,
};

// Dark, elegant, gold-accented — for a premium/dark-mode feel.
const graphiteTheme: Theme = {
  primary: "#C9A24B",
  primaryHover: "#B58F3E",
  onPrimary: "#1C1608",
  background: "#14161A",
  card: "#1C1F26",
  cardHover: "#262A33",
  border: "#2C3038",
  borderStrong: "#3A3F4A",
  text: "#ECEDEF",
  textLight: "#9BA1AC",
  textMuted: "#6C7280",
  white: "#FFFFFF",
  shadow: "rgba(0, 0, 0, 0.45)",
  ...status,
};

// Warm ivory + bronze — quiet luxury.
const champagneTheme: Theme = {
  primary: "#B08D57",
  primaryHover: "#96733F",
  onPrimary: "#FFFFFF",
  background: "#FBF8F2",
  card: "#FFFFFF",
  cardHover: "#F5EEDD",
  border: "#EBDFC4",
  borderStrong: "#DBC79B",
  text: "#3A2F1E",
  textLight: "#9C8A66",
  textMuted: "#C2B393",
  white: "#FFFFFF",
  shadow: "rgba(176, 141, 87, 0.18)",
  ...status,
};

// Deep, sophisticated emerald + cream.
const emeraldTheme: Theme = {
  primary: "#0F6B4C",
  primaryHover: "#0B543C",
  onPrimary: "#FFFFFF",
  background: "#F4FAF7",
  card: "#FFFFFF",
  cardHover: "#E6F3EC",
  border: "#D2E9DE",
  borderStrong: "#AEDAC3",
  text: "#0B2A1E",
  textLight: "#5F8874",
  textMuted: "#93B4A5",
  white: "#FFFFFF",
  shadow: "rgba(15, 107, 76, 0.16)",
  ...status,
};

export const THEMES = {
  coffee: coffeeTheme,
  forest: forestTheme,
  plum: plumTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
  mint: mintTheme,
  midnight: midnightTheme,
  roseGold: roseGoldTheme,

  // new, modern/elegant
  slate: slateTheme,
  graphite: graphiteTheme,
  champagne: champagneTheme,
  emerald: emeraldTheme,
};

export type ThemeName = keyof typeof THEMES;

// ---------------------------------------------------------------------
// Light/dark mode
//
// THEMES above is a palette catalog (kept for reference / a future accent
// picker) — it is NOT what's live at runtime. The values actually painted
// on screen live as CSS custom properties in index.css
// (`:root[data-theme="light"]` / `:root[data-theme="dark"]`), and every
// field of COLORS below just points at one of those variables.
//
// Why: common.tsx's ~50 components read COLORS.* directly. If COLORS held
// literal hex values, switching mode would mean re-rendering every one of
// them via context. Instead COLORS never changes — only the CSS variable
// values do (toggled with one attribute on <html>) — so the whole app
// re-skins itself for free, no re-render, no FOUC, no context plumbing.
// ---------------------------------------------------------------------

export type Mode = "light" | "dark";

const MODE_STORAGE_KEY = "currentMode";

export const COLORS: Theme = {
  primary: "var(--color-primary)",
  primaryHover: "var(--color-primary-hover)",
  onPrimary: "var(--color-on-primary)",
  background: "var(--color-background)",
  card: "var(--color-card)",
  cardHover: "var(--color-card-hover)",
  border: "var(--color-border)",
  borderStrong: "var(--color-border-strong)",
  text: "var(--color-text)",
  textLight: "var(--color-text-light)",
  textMuted: "var(--color-text-muted)",
  white: "var(--color-white)",
  shadow: "var(--color-shadow)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  error: "var(--color-error)",
  info: "var(--color-info)",
};

export function getStoredMode(): Mode {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(MODE_STORAGE_KEY) === "dark" ? "dark" : "light";
}

/** Paints <html data-theme="..."> (index.css reacts to it) and persists the choice. */
export function applyMode(mode: Mode) {
  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.style.colorScheme = mode;
  window.localStorage.setItem(MODE_STORAGE_KEY, mode);
}

/** Resolves a `var(--x)` string (or a literal color) to its current computed value. */
export function resolveCssVar(value: string): string {
  const match = /var\((--[\w-]+)\)/.exec(value);
  if (!match) return value;
  return getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim() || value;
}

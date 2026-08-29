import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resources from "./resources";

export const LANG_STORAGE_KEY = "lang";
export type Lang = "en" | "ar";
export const RTL_LANGS: Lang[] = ["ar"];

export function getStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(LANG_STORAGE_KEY) === "ar" ? "ar" : "en";
}

export function dirFor(lang: Lang): "rtl" | "ltr" {
  return RTL_LANGS.includes(lang) ? "rtl" : "ltr";
}

/** Mirrors the active language onto <html lang/dir> — needed for native form controls, scrollbars, etc. */
export function applyLangAttributes(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = dirFor(lang);
}

i18n.use(initReactI18next).init({
  resources,
  lng: getStoredLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Keep <html lang/dir> in sync whenever the language changes, however it changes
// (this call, browser back/forward restoring i18next-persisted state, etc).
i18n.on("languageChanged", (lng) => applyLangAttributes((lng as Lang) === "ar" ? "ar" : "en"));

/** Switches the active language app-wide: i18next, localStorage, and <html lang/dir>. */
export function setLang(lang: Lang) {
  i18n.changeLanguage(lang);
  window.localStorage.setItem(LANG_STORAGE_KEY, lang);
}

export default i18n;

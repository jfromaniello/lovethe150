"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { en, type Dict } from "./i18n/en";
import { es } from "./i18n/es";

export type Locale = "en" | "es";

const STORAGE_KEY = "lovethe150-locale";
const CHANGE_EVENT = "lovethe150-locale-change";

const DICTS: Record<Locale, Dict> = { en, es };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
  fmt: (template: string, vars: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectBrowserLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") return stored;
  } catch {}
  try {
    const nav = window.navigator.language || "en";
    if (nav.toLowerCase().startsWith("es")) return "es";
  } catch {}
  return "en";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore<Locale>(
    subscribe,
    detectBrowserLocale,
    () => "en"
  );

  const setLocale = useCallback((l: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const t = DICTS[locale];
    const fmt = (template: string, vars: Record<string, string | number>) =>
      template.replace(/\{(\w+)\}/g, (_, k) =>
        vars[k] !== undefined ? String(vars[k]) : `{${k}}`
      );
    return { locale, setLocale, t, fmt };
  }, [locale, setLocale]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return ctx;
}

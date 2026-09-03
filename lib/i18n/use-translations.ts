"use client";

import { useCallback, useSyncExternalStore } from "react";
import { defaultLocale, locales, type Locale } from "./config";
import ar from "./messages/ar.json";
import en from "./messages/en.json";
import fr from "./messages/fr.json";

const messages: Record<string, Record<string, string>> = { ar, en, fr };

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getCurrentLocale(): Locale {
  const lang = getCookie("lang");
  if (lang && (locales as readonly string[]).includes(lang)) {
    return lang as Locale;
  }
  return defaultLocale;
}

let cachedLocale = defaultLocale;

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return cachedLocale;
  cachedLocale = getCurrentLocale();
  return cachedLocale;
}

function subscribeToLocale(callback: () => void): () => void {
  const observer = new MutationObserver(() => {
    const newLocale = getCurrentLocale();
    if (newLocale !== cachedLocale) {
      cachedLocale = newLocale;
      callback();
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  window.addEventListener("storage", callback);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
  };
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribeToLocale, getLocaleSnapshot, () => defaultLocale);
}

export function useTranslations(namespace?: string) {
  const locale = useLocale();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      let msg = messages[locale]?.[fullKey] ?? messages[defaultLocale]?.[fullKey] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          msg = msg.replace(`{${k}}`, String(v));
        }
      }
      return msg;
    },
    [locale, namespace],
  );

  return { t, locale, dir: locale === "ar" ? "rtl" : "ltr" };
}

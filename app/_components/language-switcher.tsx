"use client";

import { useCallback } from "react";

interface SwitcherProps {
  currentLang: "en" | "ar" | "fr";
  label: string;
}

export function LanguageSwitcher({ currentLang, label }: SwitcherProps) {
  const toggle = useCallback(() => {
    const nextLang = currentLang === "ar" ? "en" : currentLang === "en" ? "fr" : "ar";
    const { pathname, search } = window.location;

    // Strip any locale prefix to get the clean path
    const cleanPath = pathname.replace(/^\/(en|ar|fr)(\/|$)/, "/") || "/";

    // Add the new locale prefix if not Arabic (which has no prefix)
    const nextPath = nextLang === "ar" ? cleanPath : `/${nextLang}${cleanPath === "/" ? "" : cleanPath}`;

    document.cookie = `lang=${nextLang};path=/;max-age=31536000;SameSite=Lax`;
    window.location.href = `${nextPath}${search}`;
  }, [currentLang]);

  return (
    <button
      onClick={toggle}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
      aria-label={`Switch language to ${currentLang === "ar" ? "English" : currentLang === "en" ? "Français" : "Arabic"}`}
    >
      {label}
    </button>
  );
}

interface SetterProps {
  lang: string;
}

export function LangCookieSetter({ lang }: SetterProps) {
  if (typeof window !== "undefined") {
    document.cookie = `lang=${lang};path=/;max-age=31536000;SameSite=Lax`;
  }
  return null;
}

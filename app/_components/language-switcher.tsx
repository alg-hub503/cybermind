"use client";

import { useCallback, useEffect } from "react";

interface SwitcherProps {
  currentLang: "en" | "ar";
  label: string;
}

export function LanguageSwitcher({ currentLang, label }: SwitcherProps) {
  const toggle = useCallback(() => {
    const nextLang = currentLang === "ar" ? "en" : "ar";
    document.cookie = `lang=${nextLang};path=/;max-age=31536000;SameSite=Lax`;
    window.location.reload();
  }, [currentLang]);

  return (
    <button
      onClick={toggle}
      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white transition"
      aria-label={`Switch language to ${currentLang === "ar" ? "English" : "Arabic"}`}
    >
      {label}
    </button>
  );
}

interface SetterProps {
  lang: string;
}

export function LangCookieSetter({ lang }: SetterProps) {
  useEffect(() => {
    document.cookie = `lang=${lang};path=/;max-age=31536000;SameSite=Lax`;
  }, [lang]);
  return null;
}

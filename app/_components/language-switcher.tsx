"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Globe } from "lucide-react";

type Locale = "ar" | "en" | "fr";

const languages: { code: Locale; label: string; short: string }[] = [
  { code: "ar", label: "العربية", short: "AR" },
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
];

interface SwitcherProps {
  currentLang: Locale;
}

export function LanguageSwitcher({ currentLang }: SwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchTo = useCallback((nextLang: Locale) => {
    if (nextLang === currentLang) {
      setOpen(false);
      return;
    }
    const { pathname, search } = window.location;
    const cleanPath = pathname.replace(/^\/(en|ar|fr)(\/|$)/, "/") || "/";
    const nextPath = nextLang === "ar" ? cleanPath : `/${nextLang}${cleanPath === "/" ? "" : cleanPath}`;
    document.cookie = `lang=${nextLang};path=/;max-age=31536000;SameSite=Lax`;
    window.location.href = `${nextPath}${search}`;
  }, [currentLang]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
        aria-label="Change language"
      >
        <Globe size={14} />
        <span>{languages.find((l) => l.code === currentLang)?.short}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchTo(lang.code)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                lang.code === currentLang
                  ? "font-semibold text-blue-600"
                  : "text-slate-700"
              }`}
            >
              <span className="text-xs font-medium text-slate-400 w-6">{lang.short}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
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

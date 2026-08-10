"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export default function MaintenancePage() {
  const { t, locale, dir } = useTranslations("maintenance");

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4"
      dir={dir}
    >
      <meta httpEquiv="refresh" content="60" />
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <div className="mb-6 flex items-center justify-between">
            <div />
            <LanguageSwitcher
              currentLang={locale}
              label={locale === "ar" ? "EN" : "AR"}
            />
          </div>

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-8 w-8 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {t("description")}
          </p>

          <p className="mt-4 text-xs text-slate-400">
            {t("support")}{" "}
            <a
              href="mailto:support@cybermind.com"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              support@cybermind.com
            </a>
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              {t("login")}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t("home")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

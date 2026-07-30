"use client";

import { useTranslations } from "@/lib/i18n/use-translations";

interface DashboardHeaderProps {
  name?: string | null;
}

export default function DashboardHeader({ name }: DashboardHeaderProps) {
  const { t, dir } = useTranslations("dashboard");
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? t("greetingMorning") : hour < 18 ? t("greetingAfternoon") : t("greetingEvening");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" dir={dir}>
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
          {t("title")}
        </span>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {greeting}
          {name ? `, ${name}` : ""}
        </h1>

        <p className="max-w-2xl text-slate-500">{t("description")}</p>
      </div>
    </section>
  );
}

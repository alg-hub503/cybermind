"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { SchoolSettings } from "@/lib/features/schools/types/school-settings";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

const LOCALES = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

const CURRENCIES = [
  { value: "SAR", label: "SAR — ريال سعودي" },
  { value: "USD", label: "USD — دولار أمريكي" },
  { value: "EUR", label: "EUR — يورو" },
  { value: "AED", label: "AED — درهم إماراتي" },
  { value: "KWD", label: "KWD — دينار كويتي" },
  { value: "BHD", label: "BHD — دينار بحريني" },
  { value: "QAR", label: "QAR — ريال قطري" },
  { value: "OMR", label: "OMR — ريال عماني" },
  { value: "JOD", label: "JOD — دينار أردني" },
  { value: "EGP", label: "EGP — جنيه مصري" },
  { value: "TRY", label: "TRY — ليرة تركية" },
  { value: "GBP", label: "GBP — جنيه إسترليني" },
];

const TIMEZONES = [
  "Asia/Riyadh", "Asia/Dubai", "Asia/Muscat", "Asia/Bahrain", "Asia/Qatar",
  "Asia/Kuwait", "Asia/Aden", "Asia/Baghdad", "Asia/Amman", "Asia/Damascus",
  "Asia/Beirut", "Africa/Cairo", "Africa/Tripoli", "Africa/Tunis",
  "Africa/Algiers", "Africa/Casablanca", "Europe/Istanbul",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "Asia/Tokyo", "Asia/Singapore", "Asia/Shanghai", "Australia/Sydney",
];

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

interface TabProps {
  settings: SchoolSettings;
  onSave: (data: Partial<SchoolSettings>) => Promise<void>;
  saving: boolean;
}

export default function RegionalTab({ settings, onSave, saving }: TabProps) {
  const { t } = useTranslations("settings");
  const [locale, setLocale] = useState(settings.locale ?? "ar");
  const [currency, setCurrency] = useState(settings.currency ?? "SAR");
  const [timezone, setTimezone] = useState(settings.timezone ?? "Asia/Riyadh");
  const [dateFormat, setDateFormat] = useState(settings.dateFormat ?? "DD/MM/YYYY");

  async function handleSave() {
    await onSave({
      locale: locale || null,
      currency: currency || null,
      timezone: timezone || null,
      dateFormat: dateFormat || null,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t("regional")}</h3>
        <p className="mt-1 text-sm text-slate-500">{t("regionalDescription")}</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("language")}
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("currency")}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("timezone")}
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("dateFormat")}
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              {DATE_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <span className="flex items-center gap-2">
              <Spinner size={16} /> {t("saving")}
            </span>
          ) : (
            t("save")
          )}
        </Button>
      </div>
    </div>
  );
}

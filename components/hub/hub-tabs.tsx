"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";

type Tab = "help" | "guide" | "contact" | "report" | "sales";

const TABS: Tab[] = ["help", "guide", "contact", "report", "sales"];

const FAQ_ITEMS = [
  { qKey: "faqQ1", aKey: "faqA1" },
  { qKey: "faqQ2", aKey: "faqA2" },
  { qKey: "faqQ3", aKey: "faqA3" },
  { qKey: "faqQ4", aKey: "faqA4" },
  { qKey: "faqQ5", aKey: "faqA5" },
  { qKey: "faqQ6", aKey: "faqA6" },
];

const GUIDE_STEPS = [
  { titleKey: "guideStep1Title", descKey: "guideStep1Desc" },
  { titleKey: "guideStep2Title", descKey: "guideStep2Desc" },
  { titleKey: "guideStep3Title", descKey: "guideStep3Desc" },
  { titleKey: "guideStep4Title", descKey: "guideStep4Desc" },
  { titleKey: "guideStep5Title", descKey: "guideStep5Desc" },
  { titleKey: "guideStep6Title", descKey: "guideStep6Desc" },
];

export default function HubTabs() {
  const { t } = useTranslations("hub");
  const [active, setActive] = useState<Tab>("help");
  const [faqQuery, setFaqQuery] = useState("");
  const [reportType, setReportType] = useState("BUG");
  const [reportDesc, setReportDesc] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const filteredFaq = FAQ_ITEMS.filter((item) => {
    if (!faqQuery.trim()) return true;
    const q = faqQuery.toLowerCase();
    return t(item.qKey).toLowerCase().includes(q) || t(item.aKey).toLowerCase().includes(q);
  });

  const submitReport = async () => {
    if (!reportDesc.trim()) return;
    setReportStatus("submitting");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: reportType, description: reportDesc.trim() }),
      });
      if (res.ok) {
        setReportStatus("success");
        setReportDesc("");
        setReportType("BUG");
      } else {
        setReportStatus("error");
      }
    } catch {
      setReportStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              active === tab
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t(tab === "help" ? "helpCenter" : tab === "guide" ? "userGuide" : tab === "contact" ? "contactUs" : tab === "report" ? "reportIssue" : "talkToSales")}
          </button>
        ))}
      </div>

      {active === "help" && (
        <div className="space-y-6">
          <input
            type="search"
            value={faqQuery}
            onChange={(e) => setFaqQuery(e.target.value)}
            placeholder={t("faqSearch")}
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <h2 className="text-lg font-semibold text-slate-900">{t("faqTitle")}</h2>
          {filteredFaq.length === 0 ? (
            <p className="text-slate-500">{t("faqNoResults")}</p>
          ) : (
            <div className="space-y-4">
              {filteredFaq.map((item) => (
                <div key={item.qKey} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900">{t(item.qKey)}</h3>
                  <p className="mt-2 text-sm text-slate-600">{t(item.aKey)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {active === "guide" && (
        <div className="space-y-6">
          <p className="text-slate-600">{t("guideIntro")}</p>
          <div className="space-y-4">
            {GUIDE_STEPS.map((step) => (
              <div key={step.titleKey} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900">{t(step.titleKey)}</h3>
                <p className="mt-2 text-sm text-slate-600">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === "contact" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">{t("contactEmail")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("contactEmailValue")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">{t("contactHours")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("contactHoursValue")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">{t("contactSocial")}</h3>
            <p className="mt-2 text-sm text-slate-600">Twitter / LinkedIn / Facebook</p>
          </div>
        </div>
      )}

      {active === "report" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("reportType")}</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="BUG">{t("reportTypeBug")}</option>
                  <option value="SUGGESTION">{t("reportTypeSuggestion")}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("reportDescription")}</label>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  rows={5}
                  placeholder={t("reportDescriptionPlaceholder")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={submitReport}
                disabled={reportStatus === "submitting" || !reportDesc.trim()}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reportStatus === "submitting" ? t("reportSubmitting") : t("reportSubmit")}
              </button>
              {reportStatus === "success" && (
                <p className="text-sm text-emerald-600">{t("reportSuccess")}</p>
              )}
              {reportStatus === "error" && (
                <p className="text-sm text-red-600">{t("reportError")}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {active === "sales" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-600">{t("salesDesc")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">{t("salesEmail")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("salesEmailValue")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">{t("salesPhone")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("salesPhoneValue")}</p>
          </div>
          <p className="text-sm text-slate-500">{t("salesNote")}</p>
        </div>
      )}
    </div>
  );
}

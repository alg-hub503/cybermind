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

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Sales form state
  const [salesOrg, setSalesOrg] = useState("");
  const [salesPhone, setSalesPhone] = useState("");
  const [salesStudents, setSalesStudents] = useState("");
  const [salesSolution, setSalesSolution] = useState("");
  const [salesRequirements, setSalesRequirements] = useState("");
  const [salesDemo, setSalesDemo] = useState(false);
  const [salesStatus, setSalesStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

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

  const submitContact = async () => {
    if (!contactSubject.trim() || !contactMessage.trim()) return;
    setContactStatus("submitting");
    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          subject: contactSubject.trim(),
          message: contactMessage.trim(),
        }),
      });
      if (res.ok) {
        setContactStatus("success");
        setContactName("");
        setContactEmail("");
        setContactSubject("");
        setContactMessage("");
      } else {
        setContactStatus("error");
      }
    } catch {
      setContactStatus("error");
    }
  };

  const submitSales = async () => {
    if (!salesOrg.trim() || !salesRequirements.trim()) return;
    setSalesStatus("submitting");
    try {
      const res = await fetch("/api/sales-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: salesOrg.trim(),
          phone: salesPhone.trim() || undefined,
          studentCount: salesStudents ? parseInt(salesStudents, 10) : undefined,
          currentSolution: salesSolution.trim() || undefined,
          requirements: salesRequirements.trim(),
          demoRequested: salesDemo,
        }),
      });
      if (res.ok) {
        setSalesStatus("success");
        setSalesOrg("");
        setSalesPhone("");
        setSalesStudents("");
        setSalesSolution("");
        setSalesRequirements("");
        setSalesDemo(false);
      } else {
        setSalesStatus("error");
      }
    } catch {
      setSalesStatus("error");
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
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("contactName")}</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={t("contactNamePlaceholder")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("contactEmailLabel")}</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder={t("contactEmailPlaceholder")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("contactSubject")}</label>
                <input
                  type="text"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder={t("contactSubjectPlaceholder")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("contactMessage")}</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={5}
                  placeholder={t("contactMessagePlaceholder")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={submitContact}
                disabled={contactStatus === "submitting" || !contactSubject.trim() || !contactMessage.trim()}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {contactStatus === "submitting" ? t("contactSubmitting") : t("contactSubmit")}
              </button>
              {contactStatus === "success" && (
                <p className="text-sm text-emerald-600">{t("contactSuccess")}</p>
              )}
              {contactStatus === "error" && (
                <p className="text-sm text-red-600">{t("contactError")}</p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">{t("contactHours")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("contactHoursValue")}</p>
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
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("salesOrg")}</label>
                <input
                  type="text"
                  value={salesOrg}
                  onChange={(e) => setSalesOrg(e.target.value)}
                  placeholder={t("salesOrgPlaceholder")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("salesPhone")}</label>
                <input
                  type="tel"
                  value={salesPhone}
                  onChange={(e) => setSalesPhone(e.target.value)}
                  placeholder={t("salesPhonePlaceholder")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("salesStudents")}</label>
                <input
                  type="number"
                  value={salesStudents}
                  onChange={(e) => setSalesStudents(e.target.value)}
                  placeholder={t("salesStudentsPlaceholder")}
                  min="1"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("salesSolution")}</label>
                <input
                  type="text"
                  value={salesSolution}
                  onChange={(e) => setSalesSolution(e.target.value)}
                  placeholder={t("salesSolutionPlaceholder")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("salesRequirements")}</label>
                <textarea
                  value={salesRequirements}
                  onChange={(e) => setSalesRequirements(e.target.value)}
                  rows={5}
                  placeholder={t("salesRequirementsPlaceholder")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="salesDemo"
                  checked={salesDemo}
                  onChange={(e) => setSalesDemo(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="salesDemo" className="text-sm font-medium text-slate-700">{t("salesDemo")}</label>
              </div>
              <button
                onClick={submitSales}
                disabled={salesStatus === "submitting" || !salesOrg.trim() || !salesRequirements.trim()}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salesStatus === "submitting" ? t("salesSubmitting") : t("salesSubmit")}
              </button>
              {salesStatus === "success" && (
                <p className="text-sm text-emerald-600">{t("salesSuccess")}</p>
              )}
              {salesStatus === "error" && (
                <p className="text-sm text-red-600">{t("salesError")}</p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">{t("salesContactInfo")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("salesContactInfoValue")}</p>
          </div>
          <p className="text-sm text-slate-500">{t("salesNote")}</p>
        </div>
      )}
    </div>
  );
}

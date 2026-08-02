"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { SchoolSettings } from "@/lib/features/schools/types/school-settings";
import GeneralTab from "./tabs/general-tab";
import BrandingTab from "./tabs/branding-tab";
import RegionalTab from "./tabs/regional-tab";
import ContactTab from "./tabs/contact-tab";
import BillingTab from "./tabs/billing-tab";
import LegalTab from "./tabs/legal-tab";

interface SchoolSettingsFormProps {
  schoolId: string;
  initialSettings: SchoolSettings;
}

type TabId = "general" | "branding" | "regional" | "contact" | "billing" | "legal";

const TABS: { id: TabId; labelKey: string }[] = [
  { id: "general", labelKey: "general" },
  { id: "branding", labelKey: "branding" },
  { id: "regional", labelKey: "regional" },
  { id: "contact", labelKey: "contact" },
  { id: "billing", labelKey: "billing" },
  { id: "legal", labelKey: "legal" },
];

export default function SchoolSettingsForm({
  schoolId,
  initialSettings,
}: SchoolSettingsFormProps) {
  const { t } = useTranslations("settings");
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [settings, setSettings] = useState<SchoolSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  async function handleSave(data: Partial<SchoolSettings>) {
    setSaving(true);
    try {
      const response = await fetch(`/api/schools/${schoolId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error ?? "Failed to save settings");
        return;
      }

      const updated = await response.json();
      setSettings(updated);
      toast.success(t("saveSuccess"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200">
        <nav className="flex overflow-x-auto" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-6 py-4 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "general" && (
          <GeneralTab
            settings={settings}
            onSave={handleSave}
            saving={saving}
          />
        )}
        {activeTab === "branding" && (
          <BrandingTab
            settings={settings}
            onSave={handleSave}
            saving={saving}
          />
        )}
        {activeTab === "regional" && (
          <RegionalTab
            settings={settings}
            onSave={handleSave}
            saving={saving}
          />
        )}
        {activeTab === "contact" && (
          <ContactTab
            settings={settings}
            onSave={handleSave}
            saving={saving}
          />
        )}
        {activeTab === "billing" && (
          <BillingTab
            settings={settings}
            onSave={handleSave}
            saving={saving}
          />
        )}
        {activeTab === "legal" && (
          <LegalTab
            settings={settings}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { PlatformSettings } from "@/lib/features/platform/types/platform-settings";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

interface PlatformSettingsFormProps {
  initialSettings: PlatformSettings;
}

export default function PlatformSettingsForm({
  initialSettings,
}: PlatformSettingsFormProps) {
  const { t } = useTranslations("platformSettings");
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  // Platform Identity
  const [platformName, setPlatformName] = useState(
    initialSettings.platformName ?? ""
  );
  const [defaultLogoUrl, setDefaultLogoUrl] = useState(
    initialSettings.defaultLogoUrl ?? ""
  );
  const [defaultPrimaryColor, setDefaultPrimaryColor] = useState(
    initialSettings.defaultPrimaryColor ?? "#4F46E5"
  );
  const [supportEmail, setSupportEmail] = useState(
    initialSettings.supportEmail ?? ""
  );

  // Trial Defaults
  const [trialDurationDays, setTrialDurationDays] = useState(
    initialSettings.trialDurationDays
  );
  const [trialWarningDays, setTrialWarningDays] = useState(
    initialSettings.trialWarningDays
  );

  // Platform
  const [maintenanceMode, setMaintenanceMode] = useState(
    initialSettings.maintenanceMode
  );

  const isDirty = useMemo(() => {
    return (
      platformName !== (initialSettings.platformName ?? "") ||
      defaultLogoUrl !== (initialSettings.defaultLogoUrl ?? "") ||
      defaultPrimaryColor !==
        (initialSettings.defaultPrimaryColor ?? "#4F46E5") ||
      supportEmail !== (initialSettings.supportEmail ?? "") ||
      trialDurationDays !== initialSettings.trialDurationDays ||
      trialWarningDays !== initialSettings.trialWarningDays ||
      maintenanceMode !== initialSettings.maintenanceMode
    );
  }, [
    platformName,
    defaultLogoUrl,
    defaultPrimaryColor,
    supportEmail,
    trialDurationDays,
    trialWarningDays,
    maintenanceMode,
    initialSettings,
  ]);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/platform-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformName: platformName || null,
          defaultLogoUrl: defaultLogoUrl || null,
          defaultPrimaryColor: defaultPrimaryColor || null,
          supportEmail: supportEmail || null,
          trialDurationDays,
          trialWarningDays,
          maintenanceMode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error ?? t("saveError"));
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
    <div className="space-y-6">
      {/* Platform Identity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("platformIdentity")}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {t("platformIdentityDescription")}
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("platformName")}
            </label>
            <Input
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="CyberMind"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("defaultLogoUrl")}
            </label>
            <Input
              value={defaultLogoUrl}
              onChange={(e) => setDefaultLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("defaultPrimaryColor")}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={defaultPrimaryColor}
                onChange={(e) => setDefaultPrimaryColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300"
              />
              <Input
                value={defaultPrimaryColor}
                onChange={(e) => setDefaultPrimaryColor(e.target.value)}
                placeholder="#4F46E5"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("supportEmail")}
            </label>
            <Input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@cybermind.com"
            />
          </div>
        </div>
      </div>

      {/* Trial Defaults */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("trialDefaults")}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {t("trialDefaultsDescription")}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("trialDurationDays")}
            </label>
            <Input
              type="number"
              min={1}
              max={365}
              value={trialDurationDays}
              onChange={(e) => setTrialDurationDays(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("trialWarningDays")}
            </label>
            <Input
              type="number"
              min={1}
              max={30}
              value={trialWarningDays}
              onChange={(e) => setTrialWarningDays(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Platform */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("platform")}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {t("platformDescription")}
        </p>

        <div className="mt-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={maintenanceMode}
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                maintenanceMode ? "bg-indigo-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <label className="text-sm font-medium text-slate-700">
              {t("maintenanceMode")}
            </label>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {t("maintenanceModeNote")}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !isDirty}>
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

"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { SchoolSettings } from "@/lib/features/schools/types/school-settings";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

interface TabProps {
  settings: SchoolSettings;
  onSave: (data: Partial<SchoolSettings>) => Promise<void>;
  saving: boolean;
}

export default function BrandingTab({ settings, onSave, saving }: TabProps) {
  const { t } = useTranslations("settings");
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(settings.coverUrl ?? "");
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor ?? "#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor ?? "#64748B");

  async function handleSave() {
    await onSave({
      logoUrl: logoUrl || null,
      coverUrl: coverUrl || null,
      faviconUrl: faviconUrl || null,
      primaryColor: primaryColor || null,
      secondaryColor: secondaryColor || null,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t("branding")}</h3>
        <p className="mt-1 text-sm text-slate-500">{t("brandingDescription")}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t("logoUrl")}
          </label>
          <Input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t("coverUrl")}
          </label>
          <Input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t("faviconUrl")}
          </label>
          <Input
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
            placeholder="https://example.com/favicon.ico"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("primaryColor")}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#4F46E5"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("secondaryColor")}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#64748B"
              />
            </div>
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
